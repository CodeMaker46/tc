import { useState, useEffect, useRef } from 'react';
import RouteResults from '../components/RouteResults';
import MapContainer from '../components/MapContainer';
import { calculateToll } from '../utils/api';
import { useRoute } from '../context/RouteContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import usePlacesAutocomplete from '../hooks/usePlacesAutocomplete';



const Calculator = () => {
  const [source, setSource] = useState(() => localStorage.getItem('source') || '');
  const [destination, setDestination] = useState(() => localStorage.getItem('destination') || '');
  const [intermediateStops, setIntermediateStops] = useState(() => {
    const saved = localStorage.getItem('intermediateStops');
    return saved ? JSON.parse(saved) : [];
  });
  const [showResults, setShowResults] = useState(() => localStorage.getItem('showResults') === 'true');
  const [vehicleType, setVehicleType] = useState(() => localStorage.getItem('vehicleType') || 'Car');
  const [axleCount, setAxleCount] = useState(() => localStorage.getItem('axleCount') || '2');
  const [fuelType, setFuelType] = useState(() => localStorage.getItem('fuelType') || 'diesel');
  const [showVehicleNumber, setShowVehicleNumber] = useState(() => localStorage.getItem('showVehicleNumber') === 'true');
  const [vehicleNumber, setVehicleNumber] = useState(() => localStorage.getItem('vehicleNumber') || '');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const {tolls,setRouteData, setIsLoading, isLoading,setSelectedRouteIndex,selectedRouteIndex} = useRoute();

  const sourceRef = useRef();
  const destinationRef = useRef();
  usePlacesAutocomplete(sourceRef, setSource);
  usePlacesAutocomplete(destinationRef, setDestination);
  
  

  // Load saved route data on component mount
  useEffect(() => {
    const savedRouteData = localStorage.getItem('routeData');
    if (savedRouteData) {
      setRouteData(JSON.parse(savedRouteData));
    }
  }, [setRouteData]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('source', source);
    localStorage.setItem('destination', destination);
  }, [source, destination, intermediateStops, showResults, vehicleType, axleCount, fuelType, showVehicleNumber, vehicleNumber]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
  
    try {
      
      const response = await calculateToll(source, destination, vehicleType);
      setShowResults(true);
      localStorage.setItem('showResults', 'true');
      setRouteData(response);
      localStorage.setItem('routeData', JSON.stringify(response));
      localStorage.setItem('polyline', response?.routes[selectedRouteIndex]?.polyline);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

    


      if (setSelectedRouteIndex !== -1 && token && userId && response.routes && response.routes.length > 0) {
        try {
          if(selectedRouteIndex ===-1) return;
          const selectedRoute = response.routes[selectedRouteIndex] || response.routes[0];
          const payload = {
            source,
            destination,
            price: selectedRoute.totalToll || 0,
            userId
          };
         // console.log('Saving route payload:', payload);
          // Prevent POST if any required field is missing
          if (!payload.source || !payload.destination || !payload.userId || payload.price === undefined) {
            toast.error('Missing required route data. Cannot save route.');
            return;
          }
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/routes`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Route saved to history!');
        } catch (error) {
          console.error('Error saving route:', error);
          toast.error('Failed to save route to history');
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error('Failed to calculate toll');
    } finally {
      setIsLoading(false);
    }
  };
  // console.log("current tolls in the calculator",tolls)

  const handleEditJourney = ()=>{
    setShowResults(false);
    setSelectedRouteIndex(-1);
    localStorage.removeItem('routeData')
    localStorage.removeItem('name')
    localStorage.removeItem('routeData')
    localStorage.removeItem('selectedRouteIndex')
    localStorage.removeItem('tolls')
    localStorage.removeItem('polyline')
    localStorage.removeItem('map')
    localStorage.removeItem('showResults');
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading overlay */}
      {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-white text-center font-semibold">
          <h1 className="text-lg mb-2">Loading Data...</h1>
          <p className="mb-4">Please wait while the data is loading.</p>
          <img src="/newpreeload.gif" alt="Loading..." className="w-12 h-12 mx-auto" />
        </div>
      </div>
    )}


{showResults ? (
  /* Results View */
  <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8 mt-1">
    <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center space-x-4 text-lg">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium text-gray-900">{source}</span>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium text-gray-900">{destination}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side - Route options */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Route Options</h2>
          <button
            onClick={ handleEditJourney }
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Journey</span>
          </button>
        </div>
        <RouteResults
          source={source}
          destination={destination}
          vehicleType={vehicleType}
        />
      </div>

      {/* Right side - Map */}
      <div className="bg-white rounded-lg shadow-sm p-4 min-h-[600px]">
        <MapContainer source={source} destination={destination} />
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
  <h3 className="text-xl font-semibold mb-4">Toll Details for Selected Route</h3>
  
  {!tolls || tolls.length===0? (
    <p>No tolls found on this route or the route is not selected.</p>
  ) : (
    <ul className="list-decimal list-inside space-y-2">
      {tolls.map((toll, i) => (
        <li key={i}>
          <span className="font-medium"> 🛣️ {toll.name}</span> : <span className='text-green-700'> ₹{toll.rate}</span>
        </li>
      ))}
    </ul>
  )}
</div>


  </div>
) : (
  /* Input Form View */
  <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Calculate Toll</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route Information */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Route Information</h3>
          </div>


          <div>
  <label htmlFor="source" className="block text-sm font-medium text-gray-700">
    Source
  </label>
  <input
    ref={sourceRef}
    type="text"
    id="source"
    value={source}
    onChange={(e) => setSource(e.target.value)}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2"
    placeholder="Enter source location"
    required
  />
</div>

{/* Intermediate Stops */}
{intermediateStops.map((stop, index) => (
  <div key={index} className="relative">
    <label htmlFor={`stop-${index}`} className="block text-sm font-medium text-gray-700">
      Stop {index + 1}
    </label>
    <div className="mt-1 flex">
      <input
        type="text"
        id={`stop-${index}`}
        value={stop}
        onChange={(e) => updateIntermediateStop(index, e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2"
        placeholder="Enter stop location"
      />
      <button
        type="button"
        onClick={() => removeIntermediateStop(index)}
        className="ml-2 p-2 text-gray-400 hover:text-gray-600"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
))}

<div>
  <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
    Destination
  </label>
  <input
    ref={destinationRef}
    type="text"
    id="destination"
    value={destination}
    onChange={(e) => setDestination(e.target.value)}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2"
    placeholder="Enter destination location"
    required
  />
</div>

{/* Vehicle Details */}
<div className="space-y-4">
  <h3 className="text-lg font-medium text-gray-900">Vehicle Details</h3>

  {/* Vehicle Input Toggle */}
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center space-x-6">
      <div className="flex items-center">
        <input
          type="radio"
          id="manualOption"
          name="vehicleDetailType"
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
          checked={!showVehicleNumber}
          onChange={() => setShowVehicleNumber(false)}
        />
        <label htmlFor="manualOption" className="ml-2 block text-sm font-medium text-gray-700">
          Select Vehicle Details
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="radio"
          id="vehicleNumberOption"
          name="vehicleDetailType"
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
          checked={showVehicleNumber}
          onChange={() => setShowVehicleNumber(true)}
        />
        <label htmlFor="vehicleNumberOption" className="ml-2 block text-sm font-medium text-gray-700">
          Enter Vehicle Number
        </label>
      </div>
    </div>
  </div>
</div>


{showVehicleNumber ? (
  <div>
    <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
      Vehicle Registration Number
    </label>
    <input
      type="text"
      id="vehicleNumber"
      value={vehicleNumber}
      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
      placeholder="Enter vehicle registration number"
    />
  </div>
) : (
  <div className="space-y-4">
    <div>
      <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
        Vehicle Type
      </label>
      <select
        id="vehicleType"
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2"
      >
        <option value="Car">Car</option>
        <option value="Light Commercial Vehicle">Light Commercial Vehicle</option>
        <option value="Bus">Bus</option>
        <option value="3 Axle Truck">3 Axle Truck</option>
        <option value="Heavy Commercial Vehicle">Heavy Commercial Vehicle</option>
        <option value="4 Axle Truck">4 Axle Truck</option>
        <option value="5 or More Axle Truck">5 or More Axle Truck</option>
      </select>
    </div>

                    

                    
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div>
              <button
    type="submit"
    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
  >
    Calculate Route
  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;