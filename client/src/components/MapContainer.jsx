import {
  GoogleMap,
  useLoadScript,
  Marker,
} from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { useRoute } from '../context/RouteContext';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const libraries = ['geometry', 'places'];

const MapContainer = () => {
  const {
    routeData,
    selectedRouteIndex,
    mapRef,
    polylineRef,
    tolls,
    setTolls,
    setSelectedRouteIndex,
  } = useRoute();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);

  // Step 1: Set default route index AFTER data is loaded
  useEffect(() => {
    if (isLoaded && routeData?.routes?.length > 0 && selectedRouteIndex === -1) {
      setSelectedRouteIndex(0);
      const selectedRoute = routeData.routes[selectedRouteIndex];
      const foundTolls = selectedRoute?.tolls|| [];
      setTolls(foundTolls);

    }
  }, [isLoaded, routeData, selectedRouteIndex]);
  console.log("tolls found",tolls);
  console.log("data", routeData);
  // Step 2: Handle drawing, tolls, start/end based on selected route
  useEffect(() => {
    if (
      !isLoaded ||
      !routeData?.routes ||
      selectedRouteIndex < 0 ||
      !routeData.routes[selectedRouteIndex]
    )
      return;

    const selectedRoute = routeData.routes[selectedRouteIndex];
    const foundTolls = selectedRoute?.tolls|| [];
    setTolls(foundTolls);

    const polylinePoints = selectedRoute?.polyline?.points;
    if (!polylinePoints) {
      console.warn('No polyline points found.');
      return;
    }

    if (window.google?.maps?.geometry?.encoding && mapRef.current) {
      const decodedPath = window.google.maps.geometry.encoding.decodePath(polylinePoints);

      // Remove old polyline
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      const newPolyline = new window.google.maps.Polyline({
        path: decodedPath,
        strokeColor: '#1976d2',
        strokeOpacity: 1.0,
        strokeWeight: 5,
      });

      newPolyline.setMap(mapRef.current);
      polylineRef.current = newPolyline;
    }

    // Handle start and end locations
    const legs = selectedRoute?.legs || [];
    if (legs.length > 0) {
      setStartLoc(legs[0].start_location);
      setEndLoc(legs[legs.length - 1].end_location);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      setStartLoc(null);
      setEndLoc(null);
    };
  }, [isLoaded, routeData, selectedRouteIndex]);

  // Step 3: Fit bounds
  useEffect(() => {
    if (!mapRef.current || !window.google || !tolls ) return;

    const bounds = new window.google.maps.LatLngBounds();

    tolls.forEach(toll => {
      if (
        toll &&
        toll.location &&
        typeof toll.location.lat === 'number' &&
        typeof toll.location.lng === 'number'
      ) {
        bounds.extend({
          lat: toll.location.lat,
          lng: toll.location.lng,
        });
      }
    });

    if (startLoc) bounds.extend(startLoc);
    if (endLoc) bounds.extend(endLoc);

    mapRef.current.fitBounds(bounds);
  }, [tolls, startLoc, endLoc]);

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
    
      mapContainerStyle={containerStyle}
      center={startLoc || { lat: 20.5937, lng: 78.9629 }}
      zoom={7}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
      {startLoc && <Marker position={startLoc} label="S" />}
      {endLoc && <Marker position={endLoc} label="D" />}

      {tolls?.map((toll, index) => {
        if (
          !toll ||
          !toll.location ||
          typeof toll.location.lat !== 'number' ||
          typeof toll.location.lng !== 'number'
        ) {
          console.warn(`Invalid toll at index ${index}`, toll);
          return null;
        }

        return (
          <Marker
            key={`toll-${index}`}
            position={{
              lat: Number(toll.location.lat),
              lng: Number(toll.location.lng),
            }}
            label="🛣️"
          />
        );
      })}
    </GoogleMap>
  );
};

export default MapContainer;
