import { GoogleMap, useLoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapContainer = ({ source, destination }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [directions, setDirections] = useState(null);
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  useEffect(() => {
    if (!isLoaded || !source || !destination) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: source,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          // Save coordinates for custom markers
          const route = result.routes[0].legs[0];
          setSourceCoords(route.start_location);
          setDestCoords(route.end_location);
        } else {
          console.error('Error fetching directions:', status);
        }
      }
    );
  }, [isLoaded, source, destination]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={sourceCoords || { lat: 20.5937, lng: 78.9629 }}
      zoom={6}
    >
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{ suppressMarkers: true }}
        />
      )}
      {sourceCoords && (
        <Marker position={sourceCoords} label="S" />
      )}
      {destCoords && (
        <Marker position={destCoords} label="D" />
      )}
    </GoogleMap>
  );
};

export default MapContainer;
