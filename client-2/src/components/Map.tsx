import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { motion } from 'framer-motion';
import { Route, TollPoint } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const tollIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNEQzI2MjYiLz4KPHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI2IiB5PSI2Ij4KPHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+Cjwvc3ZnPgo=',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

interface MapProps {
  routes: Route[];
  selectedRoute?: Route;
  center?: [number, number];
  zoom?: number;
  onTollClick?: (toll: TollPoint) => void;
}

const Map: React.FC<MapProps> = ({ 
  routes, 
  selectedRoute, 
  center = [40.7128, -74.0060], 
  zoom = 10,
  onTollClick 
}) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && selectedRoute) {
      // Fit map bounds to show the entire selected route
      const bounds = selectedRoute.coordinates;
      if (bounds.length > 1) {
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [selectedRoute]);

  const getRouteColor = (routeType: string) => {
    switch (routeType) {
      case 'fastest': return '#EA580C';
      case 'cheapest': return '#059669';
      case 'balanced': return '#2563EB';
      default: return '#DC2626';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full rounded-xl overflow-hidden shadow-2xl"
    >
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render all routes */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            color={getRouteColor(route.type)}
            weight={selectedRoute?.id === route.id ? 6 : 3}
            opacity={selectedRoute?.id === route.id ? 1 : 0.6}
          />
        ))}

        {/* Render toll points for selected route */}
        {selectedRoute?.tolls.map((toll) => (
          <Marker
            key={toll.id}
            position={toll.location}
            icon={tollIcon}
            eventHandlers={{
              click: () => onTollClick?.(toll)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-red-600">{toll.name}</h3>
                <p className="text-sm text-gray-600">Cost: ${toll.cost.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Type: {toll.vehicleType}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
};

export default Map;