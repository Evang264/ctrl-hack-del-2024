"use client";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

type PlaceAutocompleteProps = {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  placeholder: string;
  isDevMode: boolean;
}

export default function PlaceAutocomplete({ onPlaceSelect, placeholder, isDevMode }: PlaceAutocompleteProps) {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const bounds: google.maps.LatLngBoundsLiteral = {
      north: 43.477679374793965,
      west: -80.56617994304592,
      south: 43.464644769488466,
      east: -80.53314589340809
    }

    const options: google.maps.places.AutocompleteOptions = {
      fields: ['geometry', 'name', 'formatted_address'],
      bounds
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-control">
      <div className={clsx("autocomplete-container", isDevMode ? "bg-devmodeBg" : "bg-normalBg")}>
        <input ref={inputRef} type="text" className={clsx("border rounded-xl h-12 w-full px-2 bg-transparent", isDevMode ? "border-white text-white" : "border-black text-black")} placeholder={placeholder} />
      </div>
    </div>
  );
};