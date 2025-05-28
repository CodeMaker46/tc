const RouteResults = ({ source, destination, vehicleType, axleCount, fuelType }) => {
  const routes = [
    {
      type: 'Fastest Route',
      isRecommended: true,
      distance: '320 km',
      duration: '3h 10m',
      tollCost: 15.50,
      fuelCost: 43.20,
      totalCost: 58.70,
      isSelected: true
    },
    {
      type: 'Cheapest Route',
      distance: '335 km',
      duration: '3h 45m',
      tollCost: 7.25,
      fuelCost: 45.70,
      totalCost: 52.95,
      isSelected: false
    },
    {
      type: 'No Tolls',
      distance: '355 km',
      duration: '4h 15m',
      tollCost: 0,
      fuelCost: 48.90,
      totalCost: 48.90,
      isSelected: false
    }
  ];

  return (
    <div className="space-y-4">
      {routes.map((route, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border transition-all cursor-pointer
            ${route.isSelected 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50'
            }
          `}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {route.type}
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
                ₹{route.totalCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Total Cost</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded border border-gray-100 p-2">
              <div className="text-gray-500">Toll Cost</div>
              <div className="font-medium text-gray-900">₹{route.tollCost.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded border border-gray-100 p-2">
              <div className="text-gray-500">Fuel Cost (est.)</div>
              <div className="font-medium text-gray-900">₹{route.fuelCost.toFixed(2)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RouteResults; 