import { GoogleMap, useLoadScript, DirectionsRenderer } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapContainer = ({ source, destination, stops }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (!isLoaded) return; // wait for script to load

    if (source && destination) {
      const directionsService = new window.google.maps.DirectionsService();

      const waypoints = stops
        .filter(stop => stop.trim() !== '')
        .map(stop => ({ location: stop, stopover: true }));

      directionsService.route(
        {
          origin: source,
          destination: destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error('Error fetching directions:', status);
          }
        }
      );
    }
  }, [isLoaded, source, destination, stops]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: 20.5937, lng: 78.9629 }}
      zoom={5}
    >
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default MapContainer;
