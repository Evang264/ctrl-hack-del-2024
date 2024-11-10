"use client";

import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

type MapHandlerProps = {
  start: google.maps.places.PlaceResult | null;
  destination: google.maps.places.PlaceResult | null;
  startMarker: google.maps.marker.AdvancedMarkerElement | null;
  destinationMarker: google.maps.marker.AdvancedMarkerElement | null;
}

export default function MapHandler({ start, destination, startMarker, destinationMarker }: MapHandlerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (start && start.geometry?.viewport && destination && destination.geometry?.viewport) {
      map.fitBounds(start.geometry?.viewport.union(destination.geometry?.viewport));
    } else if (start && start.geometry?.viewport) {
      map.fitBounds(start.geometry?.viewport)
    } else if (destination && destination.geometry?.viewport) {
      map.fitBounds(destination.geometry?.viewport)
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