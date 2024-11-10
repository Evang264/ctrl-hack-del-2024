"use client";

import { AdvancedMarker, APIProvider, Map, MapCameraChangedEvent, useAdvancedMarkerRef, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import MapHandler from "@/components/map-handler";
import { Polyline } from "@/components/polyline";
import { Label as UILabel } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import clsx from "clsx";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import React from "react";
import trees from "../data/trees.json";

const defaultLocation = { lat: 43.472284474327545, lng: -80.54485482138256 };

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
    center: "80%+",
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
    } as ChartConfig
  },
  {
    data: [
      { type: "increase", percentage: 12, fill: "#C2CAF2" },
      { type: "remaining", percentage: 82, fill: "#8590C8" },
    ],
    center: "12%+",
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
    } as ChartConfig
  },
  {
    data: [
      { type: "outdoors", percentage: 34, fill: "#C2CAF2" },
      { type: "indoors", percentage: 66, fill: "#8590C8" },
    ],
    center: "34%+",
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
    } as ChartConfig
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
];

const summaryStats = [
  {
    name: "Total Hours Walked",
    value: "4 hrs"
  },
  {
    name: "Total Calories",
    value: "1201"
  },
  {
    name: "Total Distance",
    value: "20 km"
  },
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

  const [steps, setSteps] = useState<google.maps.DirectionsStep[] | null>(null);

  // const flightPlanCoordinates = [
  //   { lat: 37.772, lng: -122.214 },
  //   { lat: 21.291, lng: -157.821 },
  //   { lat: -18.142, lng: 178.431 },
  //   { lat: -27.467, lng: 153.027 },
  // ];

  // const flightPlanCoordinates = steps?.flatMap((step) => step.path);

  // console.log("steps", steps);

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

    // console.log("history", localStorage.getItem("shadefindrHistory"));
  }, [prevTrips]);

  useEffect(() => {
    if ((!startMarker?.position || !destinationMarker?.position) && steps) {
      setSteps(null);
    }
  }, [start, destination]);

  const onStart = async () => {
    if (!start || !destination) return;

    setPrevTrips([...prevTrips!, {
      start,
      destination
    }]);

    // TODO: add API call

    if (!isDevMode) {
      if (!start.geometry?.location || !destination.geometry?.location) return;
      const service = new google.maps.DirectionsService();
      const response = await service.route({
        origin: start.geometry.location,
        destination: destination.geometry.location,
        travelMode: "WALKING" as google.maps.TravelMode,
        provideRouteAlternatives: false
      });

      setSteps(response.routes[0].legs[0].steps);
    }
  };

  // const totalVisitors = React.useMemo(() => {
  //   return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  // }, [])

  return (
    <>
      <main className={clsx(optionsOpen ? "brightness-50" : "")}>
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <Navbar steps={steps} onStart={onStart} addStart={addStart} addDestination={addDestination} isDevMode={isDevMode} canStart={start?.geometry?.location !== undefined && destination?.geometry?.location !== undefined} />
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
              <AdvancedMarker ref={startMarkerRef} position={null}>
                <div className="rounded-full bg-white w-5 h-5 border-black border-4" />
              </AdvancedMarker>
              <AdvancedMarker ref={destinationMarkerRef} position={null} />
              {trees.trees.map((tree, i) => (
                <AdvancedMarker position={tree} key={i}>
                  <div className="bg-green-500 w-5 h-5 rounded-full border" />
                </AdvancedMarker>
              ))}
              {steps && 
                <Polyline
                  strokeWeight={8}
                  strokeColor={'#0551ffff'}
                  path={steps?.flatMap((step) => step.path)}
                />
              }
            </Map>
            <MapHandler start={start} destination={destination} startMarker={startMarker} destinationMarker={destinationMarker} />
          </div>
        </APIProvider>
        <div className={clsx("absolute bottom-0 right-0 m-5 flex items-center space-x-2 p-2 rounded-xl", isDevMode ? "bg-devmodeLightBg text-white" : "bg-normalBg text-black")}>
          <UILabel htmlFor="airplane-mode">Dev Mode</UILabel>
          <Switch id="airplane-mode" checked={isDevMode} onCheckedChange={() => setIsDevMode((prev) => !prev)} />
        </div>
      </main>
      <button onClick={() => setOptionsOpen(true)} className={clsx("absolute top-5 right-5 p-4 rounded-xl", isDevMode ? "bg-devmodeBg" : "bg-normalBg", optionsOpen ? "hidden" : "")}><img src={isDevMode ? "/blue-bars.svg" : "/bars.svg"} width="24" height="24" /></button>
      {optionsOpen &&
        <aside className={clsx("flex flex-col px-5 py-7", isDevMode ? "bg-devmodeBg text-white" : "bg-normalBg", "h-screen absolute top-0 right-0 w-128")}>
          <button onClick={() => setOptionsOpen(false)} className={clsx("absolute top-5 right-5 p-2 rounded-xl", isDevMode ? "" : "")}><img src="/X.svg" width="40" height="40" /></button>
          <div className="flex items-center gap-x-2">
            <img src={isDevMode ? "/dev-history.svg" : "/history.svg"} width="44" height="44" />
            <h2 className={clsx("text-xl", isDevMode ? "text-devmodeBlue" : "text-normalOrange")}>History and Stats</h2>
          </div>
          <div className="flex justify-between">
            {charts.map((chart) => (
              <div className="flex flex-col items-center" key={chart.title}>
                <ChartContainer
                  config={chart.config}
                  className="mx-auto aspect-square h-40"
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
            <img src={isDevMode ? "/dev-summary.svg" : "/summary.svg"} width="20" height="20" className="m-3" />
            <h2 className={clsx("text-xl", isDevMode ? "text-devmodeBlue" : "text-normalOrange")}>Summary</h2>
          </div>
          <div className="bg-[#C2CAF2] grid grid-cols-3 gap-5 rounded-2xl p-3 text-white">
            {
              summaryStats.map((stat) => (
                <div className="bg-[#8590C8] rounded-xl p-2" key={stat.name}>
                  <p className="font-bold">{stat.value}</p>
                  <p className="pr-8">{stat.name}</p>
                </div>
              ))
            }
          </div>
          <div className="flex items-center gap-x-2 mt-5">
            <img src={isDevMode ? "/dev-trips.svg" : "/trips.svg"} width="28" height="28" className="m-2" />
            <h2 className={clsx("text-xl", isDevMode ? "text-devmodeBlue" : "text-normalOrange")}>Trips</h2>
          </div>
          <ul>
            {prevTrips && prevTrips.slice(-3).toReversed().map((prevTrip, i) => (
              <li key={i} className={clsx("px-3", i !== 0 ? "border-t border-gray-500 py-3" : "pb-3 pt-1")}>
                <h3>{prevTrip.destination.name}</h3>
                <p className="opacity-50">{prevTrip.destination.formatted_address?.split(", ").slice(0, -1).join(", ")}</p>
              </li>
            ))}
          </ul>
        </aside>
      }
    </>
  );
}
