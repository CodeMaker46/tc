import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { useRoute } from '../context/RouteContext';
import { useDarkMode } from '../context/DarkModeContext';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const libraries = ['geometry', 'places'];

// Custom marker icons
const startMarkerIcon = {
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  fillColor: '#10B981',
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: '#ffffff',
  scale: 1.5,
  anchor: { x: 12, y: 24 },
};

const endMarkerIcon = {
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  fillColor: '#EF4444',
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: '#ffffff',
  scale: 1.5,
  anchor: { x: 12, y: 24 },
};

const tollMarkerIcon = {
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  fillColor: '#F59E0B',
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: '#ffffff',
  scale: 1.2,
  anchor: { x: 12, y: 24 },
};

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

  const { darkMode } = useDarkMode();

  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);
  const [selectedToll, setSelectedToll] = useState(null);

  // Define dark theme styles
  const darkMapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ];

  const defaultMapStyles = []; // Default styles (light mode)

  // Step 1: Set default route index AFTER data is loaded
  useEffect(() => {
    if (isLoaded && routeData?.routes?.length > 0 && selectedRouteIndex === -1) {
      setSelectedRouteIndex(0);
      const selectedRoute = routeData.routes[selectedRouteIndex];
      const foundTolls = selectedRoute?.tolls|| [];
      setTolls(foundTolls);
    }
  }, [isLoaded, routeData, selectedRouteIndex]);

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
    <div className="w-full h-full rounded-xl shadow-2xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={startLoc || { lat: 20.5937, lng: 78.9629 }}
        zoom={7}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{
          scrollwheel: true,
          gestureHandling: 'auto',
          disableDefaultUI: false,
          styles: darkMode ? darkMapStyles : defaultMapStyles,
        }}
      >
        {startLoc && (
          <Marker
            position={startLoc}
            icon={startMarkerIcon}
            animation={window.google.maps.Animation.DROP}
          />
        )}
        {endLoc && (
          <Marker
            position={endLoc}
            icon={endMarkerIcon}
            animation={window.google.maps.Animation.DROP}
          />
        )}

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
              icon={tollMarkerIcon}
              animation={window.google.maps.Animation.DROP}
              onClick={() => setSelectedToll(toll)}
            />
          );
        })}

        {selectedToll && (
          <InfoWindow
            position={{
              lat: Number(selectedToll.location.lat),
              lng: Number(selectedToll.location.lng),
            }}
            onCloseClick={() => setSelectedToll(null)}
          >
            <div className="p-2 min-w-[150px] max-w-[250px] bg-white rounded-lg shadow-md ">
              <h3 className="font-bold text-lg text-gray-900  mb-2">
                {selectedToll.name || 'Toll Plaza'}
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 ">
                  <span className="font-semibold">Cost:</span> {selectedToll.cost !== undefined && selectedToll.cost !== null ? `₹${Number(selectedToll.cost).toFixed(2)}` : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 ">
                  <span className="font-semibold">Plaza ID:</span> {selectedToll.plaza_id || 'N/A'}
                </p>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapContainer;
