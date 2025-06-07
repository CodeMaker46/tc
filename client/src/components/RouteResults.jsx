import React from 'react';
import { useRoute } from '../context/RouteContext';
import RouteCard from './UI/RouteCard';
import { motion } from 'framer-motion';
import { IndianRupee, MapPin } from 'lucide-react';

const RouteResults = ({ source, destination, vehicleType }) => {
  const {
    routeData,
    isLoading,
    selectedRouteIndex,
    setSelectedRouteIndex,
  } = useRoute();

  console.log('RouteResults: routeData from context (full):', routeData);
  console.log('RouteResults: routeData.routes from context:', routeData?.routes);

  if (isLoading) {
    return (
      <div>
        <h1 className="dark:text-white">Loading Data...</h1>
        <p className="dark:text-white">Please wait while the data is loading.</p>
      </div>
    );
  }

  if (!routeData || !routeData.routes || routeData.routes.length === 0) {
    console.log('RouteResults: Displaying "No routes found" because:');
    if (!routeData) console.log('  - routeData is null/undefined');
    if (routeData && !routeData.routes) console.log('  - routeData.routes is null/undefined');
    if (routeData && routeData.routes && routeData.routes.length === 0) console.log('  - routeData.routes is empty');
    return <p className="dark:text-white">No routes found from {source} to {destination} yet.</p>;
  }

  const routes = routeData.routes;

  const cheapestRouteIndex = routeData.cheapestRoute
    ? routes.findIndex((r) => r.routeIndex === routeData.cheapestRoute.routeIndex)
    : -1;

  const fastestRouteIndex = routeData.fastestRoute
    ? routes.findIndex((r) => r.routeIndex === routeData.fastestRoute.routeIndex)
    : -1;

  const handleSelect = (index) => {
    setSelectedRouteIndex(index);
  };

  const preparedRoutes = routes.map((route, index) => {
    let type = 'best';
    if (index === cheapestRouteIndex && index === fastestRouteIndex) {
      type = 'best';
    } else if (index === cheapestRouteIndex) {
      type = 'cheapest';
    } else if (index === fastestRouteIndex) {
      type = 'fastest';
    }

    const name =
      route.name ||
      (cheapestRouteIndex === fastestRouteIndex && index === cheapestRouteIndex
        ? 'Best Route'
        : index === cheapestRouteIndex
        ? 'Cheapest Route'
        : index === fastestRouteIndex
        ? 'Fastest Route'
        : `Route ${index + 1}`);

    return {
      ...route,
      name,
      type,
      cost: route.totalToll || 0,
      duration: route.duration || 0,
      distance: route.distance || 0,
      tolls: route.tolls || [],
      routeIndex: index,
    };
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Routes from {source} to {destination} — Vehicle: {vehicleType}
      </h2>

      <div className="flex flex-col gap-4">
  {preparedRoutes.map((route, index) => (
    <RouteCard
      key={index}
      route={route}
      isSelected={selectedRouteIndex === index}
      onSelect={() => handleSelect(index)}
    />
  ))}
</div>

      {/* Cost Breakdown */}
      {selectedRouteIndex !== -1 && preparedRoutes[selectedRouteIndex] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-red-50 border border-blue-200 rounded-xl p-4 mt-4 dark:bg-gradient-to-r dark:from-black dark:to-red-900 dark:border-red-900 dark:text-red-100"
        >
          <h3 className="font-semibold text-blue-800 mb-3 dark:text-white">Cost Breakdown</h3>
          <div className="space-y-2 text-sm">
            {preparedRoutes[selectedRouteIndex].tolls.map((toll, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold dark:bg-red-900 dark:text-red-200">{idx + 1}</span>
                  <MapPin className="w-4 h-4 text-blue-700 dark:text-white" />
                  <span className="text-blue-700 dark:text-white">{toll.name}</span>
                </span>
                <span className="font-medium flex items-center gap-1">
                  <IndianRupee className="w-4 h-4 text-red-500 dark:text-white" />
                  {(toll.rate ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-blue-200 dark:border-red-800 pt-2 flex justify-between font-semibold">
              <span className="dark:text-white">Total Tolls:</span>
              <span className="flex items-center gap-1 dark:text-white">
                <IndianRupee className="w-4 h-4 text-red-500 dark:text-white" />
                {preparedRoutes[selectedRouteIndex].tolls.reduce((sum, t) => sum + (t.rate ?? 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RouteResults;
