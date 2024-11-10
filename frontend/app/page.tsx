"use client";

import { AdvancedMarker, APIProvider, Map, MapCameraChangedEvent, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useState } from "react";
import Navbar from "@/components/navbar";
import MapHandler from "@/components/map-handler";
import { Polyline } from "@/components/polyline";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import clsx from "clsx";

const defaultLocation = { lat: 43.77211663142969, lng: -79.50660297466334 };

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

  const flightPlanCoordinates = [
    { lat: 37.772, lng: -122.214 },
    { lat: 21.291, lng: -157.821 },
    { lat: -18.142, lng: 178.431 },
    { lat: -27.467, lng: 153.027 },
  ];

  return (
    <>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <Navbar addStart={addStart} addDestination={addDestination} isDevMode={isDevMode} canStart={start?.geometry?.location !== undefined && destination?.geometry?.location !== undefined} />
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
    </>
  );
}
