import {
  GoogleMap,
  useLoadScript,
  Marker,
} from '@react-google-maps/api';
import { useEffect, useRef, useState } from 'react';
import { useRoute } from '../context/RouteContext';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapContainer = () => {
  const { routeData, selectedRouteIndex } = useRoute();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry'],
  });

  const mapRef = useRef(null);
  const polylineRef = useRef(null); // <-- Track the Polyline instance

  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);

  useEffect(() => {
    if (!isLoaded || !routeData?.routes || selectedRouteIndex == null) return;

    const selectedRoute = routeData.routes[selectedRouteIndex];
    if (!selectedRoute) return;

    const polylinePoints =
      selectedRoute?.overview_polyline?.points || selectedRoute?.polyline?.points;

    if (!polylinePoints) {
      console.warn('No polyline points found for the selected route.');
      return;
    }

    if (window.google?.maps?.geometry?.encoding && mapRef.current) {
      // Decode polyline
      const decodedPath = window.google.maps.geometry.encoding.decodePath(polylinePoints);

      // Remove the previous polyline from the map
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      // Create a new polyline
      const newPolyline = new window.google.maps.Polyline({
        path: decodedPath,
        strokeColor: '#1976d2',
        strokeOpacity: 1.0,
        strokeWeight: 5,
      });

      // Set it on the map
      newPolyline.setMap(mapRef.current);
      polylineRef.current = newPolyline;
    } else {
      console.warn('Google Maps geometry library not loaded or map not initialized.');
    }

    const legs = selectedRoute.legs;
    if (legs?.length > 0) {
      setStartLoc(legs[0].start_location);
      setEndLoc(legs[legs.length - 1].end_location);
    }

    // Cleanup
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      setStartLoc(null);
      setEndLoc(null);
    };
  }, [isLoaded, routeData, selectedRouteIndex]);

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
    </GoogleMap>
  );
};

export default MapContainer;
