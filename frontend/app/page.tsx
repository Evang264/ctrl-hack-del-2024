"use client";

import { AdvancedMarker, APIProvider, Map, MapCameraChangedEvent, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import MapHandler from "@/components/map-handler";
import { Polyline } from "@/components/polyline";
import { Switch } from "@/components/ui/switch";
import clsx from "clsx";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import React from "react";

const defaultLocation = { lat: 43.77211663142969, lng: -79.50660297466334 };

// type PrevLocation = {
//   name: string;
//   city: string;
//   province: string;
//   country: string;
// }
type PrevTrip = {
  start: google.maps.places.PlaceResult;
  destination: google.maps.places.PlaceResult;
}

// const chartConfig = {
//   visitors: {
//     label: "Visitors",
//   },
//   chrome: {
//     label: "Chrome",
//     color: "hsl(var(--chart-1))",
//   },
//   safari: {
//     label: "Safari",
//     color: "hsl(var(--chart-2))",
//   },
//   firefox: {
//     label: "Firefox",
//     color: "hsl(var(--chart-3))",
//   },
//   edge: {
//     label: "Edge",
//     color: "hsl(var(--chart-4))",
//   },
//   other: {
//     label: "Other",
//     color: "hsl(var(--chart-5))",
//   },
// } satisfies ChartConfig;

// const chartData = [
//   { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
//   { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
//   { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
//   { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
//   { browser: "other", visitors: 190, fill: "var(--color-other)" },
// ];

const charts = [
  {
    data: [
      { type: "sun", percentage: 80, fill: "#C2CAF2" },
      { type: "sunAvoided", percentage: 20, fill: "#8590C8" },
    ],
    center: "80%",
    title: "Sun Avoidance",
    config: {
      percentage: {
        label: "Percentage",
      },
      sun: {
        label: "Sun",
        color: "hsl(var(--chart-1))",
      },
      sunAvoided: {
        label: "Sun Avoided",
        color: "hsl(var(--chart-2))",
      },
    }
  },
  {
    data: [
      { type: "increase", percentage: 12, fill: "#C2CAF2" },
      { type: "remaining", percentage: 82, fill: "#8590C8" },
    ],
    center: "12%",
    title: "Step Increase",
    config: {
      percentage: {
        label: "Percentage",
      },
      increase: {
        label: " ",
        color: "hsl(var(--chart-1))",
      },
      remaining: {
        label: "Increase",
        color: "hsl(var(--chart-2))",
      },
    }
  },
  {
    data: [
      { type: "outdoors", percentage: 34, fill: "#C2CAF2" },
      { type: "indoors", percentage: 66, fill: "#8590C8" },
    ],
    center: "34%",
    title: "Time Spent Outdoors",
    config: {
      percentage: {
        label: "Percentage",
      },
      outdoors: {
        label: "Outdoors",
        color: "hsl(var(--chart-1))",
      },
      indoors: {
        label: "Indoors",
        color: "hsl(var(--chart-2))",
      },
    }
  },
  // {
  //   data: chartData,
  //   center: "12%",
  //   title: "Step Increase"
  // },
  // {
  //   data: chartData,
  //   center: "34%",
  //   title: "Time Spent Outdoors"
  // }
]

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [location, setLocation] = useState<google.maps.LatLngLiteral>(defaultLocation);

  const [start, setStart] = useState<google.maps.places.PlaceResult | null>(null);

  const [destination, setDestination] = useState<google.maps.places.PlaceResult | null>(null);

  const addStart = (place: google.maps.places.PlaceResult | null) => {
    setStart(place);
  }

  const addDestination = (place: google.maps.places.PlaceResult | null) => {
    setDestination(place);
  }

  const [startMarkerRef, startMarker] = useAdvancedMarkerRef();
  const [destinationMarkerRef, destinationMarker] = useAdvancedMarkerRef();

  const [isDevMode, setIsDevMode] = useState<boolean>(false);

  const [prevTrips, setPrevTrips] = useState<PrevTrip[] | null>(null);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);

  const flightPlanCoordinates = [
    { lat: 37.772, lng: -122.214 },
    { lat: 21.291, lng: -157.821 },
    { lat: -18.142, lng: 178.431 },
    { lat: -27.467, lng: 153.027 },
  ];

  useEffect(() => {
    if (prevTrips == null) {
      const storedData = localStorage.getItem("shadefindrHistory");

      let currentData: PrevTrip[];
      if (storedData === null) {
        setPrevTrips([]);
      } else {
        setPrevTrips(JSON.parse(storedData));
      }
    } else {
      localStorage.setItem("shadefindrHistory", JSON.stringify(prevTrips));
    }

    console.log("history", localStorage.getItem("shadefindrHistory"));
  }, [prevTrips])

  const onStart = () => {
    if (!start || !destination) return;

    setPrevTrips([...prevTrips!, {
      start,
      destination
    }]);

    // TODO: add API call
  };

  // const totalVisitors = React.useMemo(() => {
  //   return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  // }, [])

  return (
    <>
      <main className={clsx(optionsOpen ? "brightness-50" : "")}>
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <Navbar onStart={onStart} addStart={addStart} addDestination={addDestination} isDevMode={isDevMode} canStart={start?.geometry?.location !== undefined && destination?.geometry?.location !== undefined} />
          <div className="h-screen w-screen">
            <Map
              mapId={'bf51a910020fa25a'}
              defaultZoom={14}
              defaultCenter={ defaultLocation }
              onCameraChanged={ (ev: MapCameraChangedEvent) => setLocation(ev.detail.center)}
              colorScheme={isDevMode ? "DARK" : "LIGHT"}
              zoomControl={false}
              streetViewControl={false}
              fullscreenControl={false}
              mapTypeControl={false}
            >
              <AdvancedMarker ref={startMarkerRef} position={null} />
              <AdvancedMarker ref={destinationMarkerRef} position={null} />
              <Polyline
                strokeWeight={10}
                strokeColor={'#ff22cc88'}
                path={flightPlanCoordinates}
              />
            </Map>
            <MapHandler start={start} destination={destination} startMarker={startMarker} destinationMarker={destinationMarker} />
          </div>
        </APIProvider>
        <div className={clsx("absolute bottom-0 right-0 m-5 flex items-center space-x-2 p-2 rounded-xl", isDevMode ? "bg-devmodeLightBg text-white" : "bg-normalBg text-black")}>
          <Label htmlFor="airplane-mode">Dev Mode</Label>
          <Switch id="airplane-mode" checked={isDevMode} onCheckedChange={() => setIsDevMode((prev) => !prev)} />
        </div>
      </main>
      <button onClick={() => setOptionsOpen(true)} className={clsx("absolute top-5 right-5 p-2 rounded-xl", isDevMode ? "bg-devmodeBg" : "bg-normalBg", optionsOpen ? "hidden" : "")}><img src="/history.svg" width="40" height="40" /></button>
      <aside className={clsx(optionsOpen ? "flex flex-col px-5 py-7" : "hidden", isDevMode ? "bg-devmodeBg text-white" : "bg-normalBg", "h-screen absolute top-0 right-0 w-128")}>
        <button onClick={() => setOptionsOpen(false)} className={clsx("absolute top-5 right-5 p-2 rounded-xl", isDevMode ? "" : "")}><img src="/X.svg" width="40" height="40" /></button>
        <div className="flex items-center gap-x-2">
          <img src="/history.svg" width="40" height="40" />
          <h2 className={clsx("text-xl", isDevMode ? "text-devmodeBlue" : "text-black")}>History and Stats</h2>
        </div>
        <div className="flex justify-between">
          {charts.map((chart) => (
            <div className="flex flex-col items-center">
              <ChartContainer
                config={chart.config}
                className="mx-auto aspect-square h-40"
                key={chart.title}
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chart.data}
                    dataKey="percentage"
                    nameKey="type"
                    innerRadius={60}
                    outerRadius={70}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className={clsx("text-3xl font-bold", isDevMode ? "fill-white" : "fill-foreground")}
                              >
                                {chart.center}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <span className="px-5 text-center leading-4">{chart.title}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-x-2">
          <img src="/summary.svg" width="20" height="20" className="m-3" />
          <h2 className={clsx("text-xl", isDevMode ? "text-devmodeBlue" : "text-black")}>Summary</h2>
        </div>
        <div className="flex items-center gap-x-2">
          <img src="/summary.svg" width="20" height="20" className="m-3" />
          <h2 className={clsx("text-xl", isDevMode ? "text-devmodeBlue" : "text-black")}>Trips</h2>
        </div>
      </aside>
    </>
  );
}
