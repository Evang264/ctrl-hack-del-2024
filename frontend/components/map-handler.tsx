"use client";

import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

type MapHandlerProps = {
  start: google.maps.places.PlaceResult | null;
  destination: google.maps.places.PlaceResult | null;
  startMarker: google.maps.marker.AdvancedMarkerElement | null;
  destinationMarker: google.maps.marker.AdvancedMarkerElement | null;
  isNavOpen: boolean;
}

export default function MapHandler({ start, destination, startMarker, destinationMarker, isNavOpen }: MapHandlerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const padding = isNavOpen ? { left: 300 } : 0;

    if (start && start.geometry?.viewport && destination && destination.geometry?.viewport) {
      map.fitBounds(start.geometry?.viewport.union(destination.geometry?.viewport), padding);
    } else if (start && start.geometry?.viewport) {
      map.fitBounds(start.geometry?.viewport, padding)
    } else if (destination && destination.geometry?.viewport) {
      map.fitBounds(destination.geometry?.viewport, padding)
    }

    if (start && startMarker) {
      startMarker.position = start.geometry?.location;
    }
    if (destination && destinationMarker) {
      destinationMarker.position = destination.geometry?.location;
    }
  }, [map, start, destination, startMarker, destinationMarker]);

  return null;
};