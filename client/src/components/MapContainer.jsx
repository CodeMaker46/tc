import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { useEffect, useRef, useState } from 'react';
import { useRoute } from '../context/RouteContext';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapContainer = () => {
  const { routeData, selectedRouteIndex, mapRef, polylineRef } = useRoute();
  const [tolls, setTolls] = useState(null);
  //console.log("routeData",routeData,selectedRouteIndex);

  // Add debug for verified/unverified tolls
  if (routeData?.routes && selectedRouteIndex != null) {
    const selectedRoute = routeData.routes[selectedRouteIndex];
    // console.log('Verified tolls:', selectedRoute.tollsVerified);
    // console.log('Unverified tolls:', selectedRoute.tollsUnverified);
    // console.log('SnapToRoadError:', selectedRoute.snapToRoadError);
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry'],
  });

  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);
  const [hoveredTollIndex, setHoveredTollIndex] = useState(null);

  // Add debugging
  // useEffect(() => {
  //   console.log('Tolls data:', tolls);
  //   //console.log('Hovered toll index:', hoveredTollIndex);
  //   if (hoveredTollIndex !== null && tolls[hoveredTollIndex]) {
  //     console.log('Hovered toll data:', tolls[hoveredTollIndex]);
  //   }
  // }, [tolls, hoveredTollIndex]);

  useEffect(() => {
    if (!isLoaded || !routeData?.routes || selectedRouteIndex == null) return;
    const selectedRoute = routeData.routes[selectedRouteIndex];
    const foundTolls = selectedRoute.tolls || [];
    setTolls(foundTolls);

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
      // Clear any pending timeouts
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setStartLoc(null);
      setEndLoc(null);
      setHoveredTollIndex(null);
    };
  }, [isLoaded, routeData, selectedRouteIndex]);

  // Handle mouse events with debouncing to prevent multiple InfoWindows
  const hoverTimeoutRef = useRef(null);

  const handleTollMouseOver = (index) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    console.log('Mouse over toll:', index);
    setHoveredTollIndex(index);
  };

  const handleTollMouseOut = () => {
    // Add a small delay before hiding to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      //console.log('Mouse out');
      setHoveredTollIndex(null);
    }, 100);
  };

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

      {/* Toll markers with improved hover handling */}
      {tolls?.map((toll, index) => {
        // Add validation for toll data
        if (!toll || !toll.location || 
            typeof toll.location.lat !== 'number' || 
            typeof toll.location.lng !== 'number') {
          console.warn(`Invalid toll data at index ${index}:`, toll);
          return null;
        }

        return (
          <Marker
            key={`toll-${index}`} // Better key
            position={{ 
              lat: Number(toll.location.lat), 
              lng: Number(toll.location.lng) 
            }}
            label="🛣️" // More appropriate toll icon
            onMouseOver={() => handleTollMouseOver(index)}
            onMouseOut={handleTollMouseOut}
            // Add click handler as backup
            onClick={() => setHoveredTollIndex(index)}
            options={{
              title: '', // Remove title tooltip
            }}
          />
        );
      })}

      
    </GoogleMap>
  );
};

export default MapContainer;