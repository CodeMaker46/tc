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
const libraries = ['geometry','places'];
const MapContainer = () => {
  const { routeData, selectedRouteIndex, mapRef, polylineRef ,tolls,setTolls,setSelectedRouteIndex} = useRoute();
  
  console.log("Route Data:", routeData);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);

  useEffect(() => {
  if (isLoaded && routeData?.routes?.length > 0 && selectedRouteIndex === -1) {
    setSelectedRouteIndex(0);
  }
}, [isLoaded, routeData, selectedRouteIndex]);



  useEffect(() => {
  if (
    !isLoaded ||
    !routeData?.routes ||
    selectedRouteIndex < 0 ||
    !routeData.routes[selectedRouteIndex]
  ) return;

  const selectedRoute = routeData.routes[selectedRouteIndex];
  const foundTolls = selectedRoute?.tolls || [];
  setTolls(foundTolls);
  console.log("foundTolls",foundTolls)

  const polylinePoints = selectedRoute?.polyline?.points;
  if (!polylinePoints) {
    console.warn('No polyline points found.');
    return;
  }

  if (window.google?.maps?.geometry?.encoding && mapRef.current) {
    const decodedPath = window.google.maps.geometry.encoding.decodePath(polylinePoints);

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

  const legs = selectedRoute.legs;
  if (legs?.length > 0) {
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
}, [isLoaded, routeData, selectedRouteIndex,tolls]);

  
  

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
        if (!toll || !toll.location || 
            typeof toll.location.lat !== 'number' || 
            typeof toll.location.lng !== 'number') {
          console.warn(`Invalid toll data at index ${index}:`, toll);
          return null;
        }

        return (
          <Marker
            key={`toll-${index}`} 
            position={{ 
              lat: Number(toll.location.lat), 
              lng: Number(toll.location.lng) 
            }}
            label="🛣️" 
          />
        );
      })}

      

      

      
    </GoogleMap>
  );
};

export default MapContainer;