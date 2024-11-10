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
  onStart: () => void;
  onClear: () => void;
  isShowingPath: boolean;
  steps: google.maps.DirectionsStep[] | null;
  isLoading: boolean;
  shadePercent: number | null;
  isNavOpen: boolean;
  setIsNavOpen: React.Dispatch<React.SetStateAction<boolean>>
};

export default function Navbar({ isShowingPath, onClear, shadePercent, isLoading, addStart, addDestination, isDevMode, canStart, onStart, steps, isNavOpen, setIsNavOpen }: NavbarProps) {
  return (
    <>
      <div className={clsx(isNavOpen ? "flex" : "hidden", isDevMode ? "bg-devmodeBg text-white" : "bg-normalBg", "justify-between items-center flex-col pt-8 w-{1/3} h-screen fixed z-10 px-5 w-96")}>
        <div>
          <div className="flex gap-x-4 items-center">
            <button onClick={() => setIsNavOpen(false)} className="rotate-180">{isDevMode ? <img src="/dev-navbar-toggle.svg" width="33" height="24" /> : <img src="/navbar-toggle.svg" width="33" height="24" />}</button>
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

          <div className={clsx("flex flex-col gap-y-5 mt-5 overflow-auto max-h-[36rem]", { "scrollbar-black": isDevMode })}>
            {steps && steps.map((step, i) => (
              <div key={i} className="flex gap-x-5">
                <div className="w-5 flex items-center justify-center">
                  {step.instructions.startsWith("Head") && <img src={isDevMode ? "/dev-head.svg" : "/head.svg"} width="14" height="19" className="ml-1" />}
                  {step.instructions.startsWith("Turn <b>right</b>") && <img src={isDevMode ? "/dev-turn-right.svg" : "/turn-right.svg"} width="24" height="24" />}
                  {step.instructions.startsWith("Turn <b>left</b>") && <img src={isDevMode ? "/dev-turn-left.svg" : "/turn-left.svg"} width="24" height="24" />}
                  {step.instructions.startsWith("Slight <b>left</b>") && <img src={isDevMode ? "/dev-arrow-up-left.svg" : "/arrow-up-left.svg"} width="32" height="32" />}
                  {step.instructions.startsWith("Slight <b>right</b>") && <img src={isDevMode ? "/dev-arrow-up-right.svg" : "/arrow-up-right.svg"} width="32" height="32" />}
                </div>
                <div className="flex-1" dangerouslySetInnerHTML={{__html: step.instructions}} />
              </div>
            ))}
            {isLoading && "Finding shadiest path..."}
            {shadePercent && <div>Found <span className={clsx("font-bold", isDevMode ? "text-devmodeBlue" : "text-normalOrange")}>{shadePercent.toFixed(2)}%</span> shady path!</div>}
          </div>
        </div>
        {canStart && !isShowingPath && <button onClick={onStart} className={clsx("mb-5 w-4/5 py-2 rounded-2xl border transition", isDevMode ? "text-white bg-devmodeLightBg hover:brightness-125 border-white" : "text-black bg-normalBg border-black hover:brightness-95")}>Start Journey</button>}
        {canStart && isShowingPath && <button onClick={onClear} className={clsx("mb-5 w-4/5 py-2 rounded-2xl border transition", isDevMode ? "text-white bg-devmodeLightBg hover:brightness-125 border-white" : "text-black bg-normalBg border-black hover:brightness-95")}>Clear Path</button>}
      </div>
      <button onClick={() => setIsNavOpen(true)} className={clsx(isNavOpen ? "hidden" : "", isDevMode ? "bg-devmodeBg" : "bg-normalBg", "bg-opacity-50 absolute top-5 left-2 z-10 py-5 px-4 rounded-full")}>{isDevMode ? <img src="/dev-navbar-toggle.svg" width="33" height="24" /> : <img src="/navbar-toggle.svg" width="33" height="24" />}</button>
    </>
  )
}