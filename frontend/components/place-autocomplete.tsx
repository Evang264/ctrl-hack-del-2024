"use client";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";

type PlaceAutocompleteProps = {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  placeholder: string;
}

export default function PlaceAutocomplete({ onPlaceSelect, placeholder }: PlaceAutocompleteProps) {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const bounds: google.maps.LatLngBoundsLiteral = {
      north: 43.7730390011316,
      west: -79.53397119378593,
      south: 43.76335309009073,
      east: -79.49103024035965
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
      <div className="autocomplete-container">
        <input ref={inputRef} type="text" className="border border-black rounded-xl h-12 w-full px-2" placeholder={placeholder} />
      </div>
    </div>
  );
};