"use client"

import clsx from "clsx";
import localFont from 'next/font/local';
import PlaceAutocomplete from "./place-autocomplete";
import { APIProvider } from "@vis.gl/react-google-maps";

const departureMono = localFont({
  src: '../app/fonts/DepartureMono-1.422/DepartureMono-Regular.woff2',
  display: 'swap',
});

type NavbarProps = {
  addStart: (place: google.maps.places.PlaceResult | null) => void;
  addDestination: (place: google.maps.places.PlaceResult | null) => void;
  isDevMode: boolean;
  canStart: boolean;
};

export default function Navbar({ addStart, addDestination, isDevMode, canStart }: NavbarProps) {
  
  return (
    <div className={clsx(isDevMode ? "bg-devmodeBg" : "bg-normalBg", "rounded-xl flex justify-between items-center flex-col pt-8 w-{1/3} h-screen fixed z-10 px-5 w-96")}>
      <div>
        <div className="flex gap-x-4 items-center">
          {isDevMode ? <img src="/blue-bars.svg" width="24" height="24" /> : <img src="/bars.svg" width="24" height="24" />}
          <h1 className={clsx(departureMono.className, "text-4xl mb-1", isDevMode ? "text-[#248AFF]" : "text-[#DB7500]")}>shadefindr</h1>
        </div>
        
        <div className="flex items-center mt-5 gap-x-2">
          {isDevMode ? <img src="/blue-dir-icon.svg" width="20" height="80" /> : <img src="/dir-icon.svg" width="20" height="80" />}
          <div className="flex-1 flex flex-col gap-y-2">  
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
              <PlaceAutocomplete onPlaceSelect={addStart} placeholder="Choose starting point" isDevMode={isDevMode} />
              <PlaceAutocomplete onPlaceSelect={addDestination} placeholder="Choose destination" isDevMode={isDevMode} />
            </APIProvider>
          </div>
          {isDevMode ? <img src="/light-switch.svg" width="20" height="21" /> : <img src="/switch.svg" width="20" height="21" />}
        </div>
      </div>
      {canStart && <button className={clsx("mb-5 w-4/5 py-2 rounded-2xl border transition", isDevMode ? "text-white bg-[#424242] hover:brightness-125 border-white" : "text-black bg-normalBg border-black hover:brightness-95")}>Start Journey</button>}
    </div>
  )
}