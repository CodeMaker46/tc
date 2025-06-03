import React from 'react';
import { useRoute } from '../context/RouteContext';

const RouteResults = ({
   source,
  destination,
  vehicleType,
}) => {
  const { routeData, isLoading ,selectedRouteIndex, setSelectedRouteIndex } = useRoute();

  if (isLoading) {
    return (
      <div>
        <h1>Loading Data...</h1>
        <p>Please wait while the data is loading.</p>
      </div>
    );
  }

  if (!routeData || !routeData.routes || routeData.routes.length === 0) {
    return <p>No routes found from {source} to {destination} yet.</p>;
  }

  const routes = routeData.routes;

  const cheapestRouteIndex = routes.findIndex(
    r => r.routeIndex === routeData.cheapestRoute.routeIndex
  );

  const fastestRouteIndex = routes.findIndex(
    r => r.routeIndex === routeData.fastestRoute.routeIndex
  );

  const hadnleOnClick = (index) => () => {
    setSelectedRouteIndex(index);
  }
  

  return (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold mb-4">
      Routes from {source} to {destination}
    </h2>

    {routes.map((route, index) => (
      <button
        key={index}
        onClick={hadnleOnClick(index)}
        className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer focus:outline-none ${
          selectedRouteIndex === index
            ? 'bg-blue-50 border-blue-600'
            : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50'
        }`}
        type="button"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {route.name ||
                (cheapestRouteIndex === fastestRouteIndex && index === cheapestRouteIndex
                  ? 'Best Route'
                  : index === cheapestRouteIndex
                  ? 'Cheapest Route'
                  : index === fastestRouteIndex
                  ? 'Fastest Route'
                  : `Route ${index + 1}`)}
              {route.isRecommended && (
                <span className="ml-2 text-sm text-blue-600 font-normal">
                  (Recommended)
                </span>
              )}
            </h3>

            <div className="flex items-center mt-1 text-sm text-gray-500">
              <span>{route.distance}</span>
              <span className="mx-2">•</span>
              <span>{route.duration}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
    ₹{typeof route.totalToll === 'number' ? route.totalToll.toFixed(2) : '0.00'}
  </div>
            <div className="text-sm text-gray-500">Total Toll</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            🚗 Vehicle Type: <span className="text-gray-800 font-medium">{vehicleType}</span>
          </div>
        </div>
      </button>
    ))}
  </div>
);

  
};

export default RouteResults;
