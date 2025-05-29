import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { useRoute } from '../context/RouteContext';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapContainer = () => {
  const {
    routeData,
    selectedRouteIndex,
  } = useRoute();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry'],
  });

  const [path, setPath] = useState([]);
  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);

  useEffect(() => {
    if (!isLoaded || !routeData?.routes || selectedRouteIndex == null) return;

    const selectedRoute = routeData.routes[selectedRouteIndex];
    if (!selectedRoute) return;

    console.log('Selected route:', selectedRoute);

    const polylinePoints = selectedRoute?.overview_polyline?.points || selectedRoute?.polyline?.points;
    if (!polylinePoints) {
      console.warn('No polyline points found for the selected route.');
      return;
    }

    if (window.google?.maps?.geometry?.encoding) {
      const decodedPath = window.google.maps.geometry.encoding.decodePath(polylinePoints);
      setPath(decodedPath);
    } else {
      console.warn('Google Maps geometry library not loaded.');
    }

    const legs = selectedRoute.legs;
    if (legs?.length > 0) {
      setStartLoc(legs[0].start_location);
      setEndLoc(legs[legs.length - 1].end_location);
    }

    // Cleanup on unmount or route change
    return () => {
      setPath([]);
      setStartLoc(null);
      setEndLoc(null);
    };
  }, [isLoaded, routeData, selectedRouteIndex]);

  if (loadError) {
    return <div>Error loading map</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <GoogleMap
  mapContainerStyle={containerStyle}
  center={startLoc || { lat: 20.5937, lng: 78.9629 }}
  zoom={7}
>
  {startLoc && <Marker position={startLoc} label="S" />}
  {endLoc && <Marker position={endLoc} label="D" />}
  {path.length > 0 && (
    <Polyline
      path={path}
      options={{
        strokeColor: '#1976d2',
        strokeWeight: 5,
      }}
    />
  )}
</GoogleMap>

  );
};

export default MapContainer;
