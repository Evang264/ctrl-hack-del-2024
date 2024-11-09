"use client";

import Image from "next/image";
import { APIProvider, Map, MapCameraChangedEvent } from "@vis.gl/react-google-maps";
import { useState } from "react";

const defaultLocation = { lat: 43.77211663142969, lng: -79.50660297466334 };

export default function Home() {
  const [location, setLocation] = useState<google.maps.LatLngLiteral>(defaultLocation);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="h-screen w-screen">
        <Map
          defaultZoom={14}
          defaultCenter={ defaultLocation }
          onCameraChanged={ (ev: MapCameraChangedEvent) => setLocation(ev.detail.center)}
        >
        </Map>
      </div>
    </APIProvider>
  );
}
