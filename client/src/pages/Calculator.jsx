import { useState, useEffect, useRef } from 'react';
import RouteResults from '../components/RouteResults';
import MapContainer from '../components/MapContainer';
import { calculateToll } from '../utils/api';
import { useRoute } from '../context/RouteContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import usePlacesAutocomplete from '../hooks/usePlacesAutocomplete';
import { motion } from 'framer-motion';
import {
  Search,
  Navigation,
  Zap,
  TrendingDown,
  Target,
  AlertCircle,
  History,
  Bookmark,
  Share2,
  Calculator as CalcIcon,
  ArrowUpDown,
} from 'lucide-react';

const Calculator = () => {
  // State variables
  const [source, setSource] = useState(''); // Initialize as empty
  const [destination, setDestination] = useState(''); // Initialize as empty
  const [showResults, setShowResults] = useState(false); // Initialize as false
  const [vehicleType, setVehicleType] = useState('Car'); // Default to Car
  const [routePreference, setRoutePreference] = useState('best'); // example
  const [isCalculating, setIsCalculating] = useState(false);
  const [routes, setRoutes] = useState([]); // routes from API
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(-1);
  const [isRouteSaved, setIsRouteSaved] = useState(false); // Track if current route is saved
  const [isUsingRoute, setIsUsingRoute] = useState(false); // Track if currently using a route from history

  const { routeData,setRouteData, setIsLoading, isLoading, setSelectedRouteIndex: contextSetSelectedRouteIndex } = useRoute();

  // Refs for autocomplete inputs
  const sourceRef = useRef();
  const destinationRef = useRef();
  usePlacesAutocomplete(sourceRef, setSource);
  usePlacesAutocomplete(destinationRef, setDestination);
  
  // No longer saving source/destination persistently in this useEffect
  // This useEffect will only be for saving `showResults` when it changes
  useEffect(() => {
    localStorage.setItem('showResults', showResults.toString());
  }, [showResults]);

  // Load saved route data and user preferences on mount
  useEffect(() => {
    // Check if coming from "Use Route" button
    const routeToUse = localStorage.getItem('routeToUse');
    if (routeToUse) {
      console.log('Loading route from localStorage.routeToUse:', routeToUse);
      const { source: routeSource, destination: routeDestination, vehicleType: routeVehicleType } = JSON.parse(routeToUse);
      setIsUsingRoute(true); // Flag that we're using a route
      setSource(routeSource);
      setDestination(routeDestination);
      setVehicleType(routeVehicleType);
      
      // Clear any existing results so user starts fresh, but prepare for new calculation
      setShowResults(false);
      setRoutes([]);
      setSelectedRouteIndex(-1);
      
      localStorage.removeItem('routeToUse'); // Clean up - important!
      toast.success('📍 Route loaded! Click Calculate to find toll details.');
    } else {
      // For a fresh load, clear previous search data from localStorage and state
      console.log('No routeToUse found, clearing previous search data.');
      localStorage.removeItem('source');
      localStorage.removeItem('destination');
      localStorage.removeItem('routeData');
      localStorage.removeItem('showResults');

      setSource('');
      setDestination('');
      setShowResults(false);
      setRoutes([]);
      setSelectedRouteIndex(-1);
      setIsUsingRoute(false); // Ensure this is false for fresh loads

      // Fetch user's default vehicle type
      const fetchDefaultVehicleType = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (token && userId) {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/users/profile?userId=${userId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.user.defaultVehicleType) {
              setVehicleType(response.data.user.defaultVehicleType);
            }
          } catch (error) {
            console.error('Error fetching default vehicle type:', error);
          }
        }
      };
      
      fetchDefaultVehicleType();
    }

    // Remove this block as routeData is now cleared if not using routeToUse
    // const savedRouteData = localStorage.getItem('routeData');
    // if (savedRouteData) {
    //   const data = JSON.parse(savedRouteData);
    //   setRoutes(data.routes || []);
    //   setSelectedRouteIndex(data.selectedRouteIndex || -1);
    //   setShowResults(true);
    //   setRouteData(data);
    // }
  }, [setRouteData]);

  // Handle form submit to calculate toll/routes
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source || !destination) {
      toast.error('Please enter both source and destination');
      return;
    }
    setIsCalculating(true);
    setIsLoading(true);
    
    try {
      const response = await calculateToll(source, destination, vehicleType, routePreference);
      // Assuming response structure: { routes: [...], otherData }

      if (!response.routes || response.routes.length === 0) {
        toast.error('No routes found');
        setIsCalculating(false);
        setIsLoading(false);
        return;
      }

      setRoutes(response.routes);
      setSelectedRouteIndex(0); // default select first route
      setShowResults(true);

      // Save to localStorage
      localStorage.setItem('routeData', JSON.stringify(response));
      localStorage.setItem('showResults', 'true');

      setRouteData(response);
      
      // Reset the route usage flag after calculation
      setIsUsingRoute(false);

      // Optionally save to user history if logged in
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (token && userId) {
        const selectedRoute = response.routes[0];
          const payload = {
            source,
            destination,
            vehicleType,
            price: selectedRoute.totalToll || 0,
            userId,
          };

                 if (payload.source && payload.destination && payload.userId && payload.price !== undefined) {
           // Add flag to mark as trip history (automatic save)
           payload.isSaved = false; // This goes to trip history
           
           await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/routes`, payload, {
             headers: { Authorization: `Bearer ${token}` },
           });
           // Don't show toast for automatic saving
         }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to calculate toll');
    } finally {
      setIsCalculating(false);
      setIsLoading(false);
    }
  };

  // Handler to select route
  const handleSelectRoute = (index) => {
    setSelectedRouteIndex(index);
  };

  // Check if current route combination is already saved
  const checkIfRouteSaved = async () => {
    if (!source || !destination) return;
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) return;
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/routes?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const savedRoute = response.data.find(route => 
        route.source === source && 
        route.destination === destination && 
        route.isSaved === true
      );
      
      setIsRouteSaved(!!savedRoute);
    } catch (error) {
      console.error('Error checking saved routes:', error);
    }
  };

  // Check saved status when source/destination changes
  useEffect(() => {
    checkIfRouteSaved();
  }, [source, destination]);

  // Save/Unsave route toggle functionality
  const toggleSaveRoute = async () => {
    if (!source || !destination) {
      toast.error('No route data to save');
      return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      toast.error('Please login to save routes');
      return;
    }

    try {
      if (isRouteSaved) {
        // Unsave the route - find and delete the saved route
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/routes?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const savedRoute = response.data.find(route => 
          route.source === source && 
          route.destination === destination && 
          route.isSaved === true
        );
        
        if (savedRoute) {
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/api/users/routes/${savedRoute._id}?userId=${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsRouteSaved(false);
          toast.success('Route unsaved successfully!');
        }
      } else {
        // Save the route
        if (routes.length === 0) {
          toast.error('Please calculate route first');
          return;
        }
        
        const routeIndex = selectedRouteIndex >= 0 ? selectedRouteIndex : 0;
        const selectedRoute = routes[routeIndex];
        
        const payload = {
          source,
          destination,
          vehicleType,
          price: selectedRoute?.totalToll || selectedRoute?.toll || 0,
          userId,
          isSaved: true
        };

        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/routes`, 
          payload, 
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        setIsRouteSaved(true);
        toast.success('Route saved successfully!');
      }
    } catch (error) {
      console.error('Error saving/unsaving route:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save/unsave route');
      }
    }
  };
  const shareRoute = () => {
    toast.info('Share route functionality not implemented yet.');
  };

return (
    <div className="min-h-screen p-4 lg:p-8 bg-gray-50 dark:bg-black">
    <div className="max-w-7xl mx-auto">
        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
          className="bg-white dark:bg-black dark:border dark:border-red-900 rounded-2xl shadow-xl dark:shadow-red-900 p-6 mb-8"
      >
          <div className="flex flex-col lg:flex-row items-center gap-4 mb-4">
            <div className="relative flex-1 min-w-0">
              <Navigation className="absolute left-3 top-3 w-5 h-5 text-red-500 dark:text-red-400" />
            <input
                ref={sourceRef}
              type="text"
              placeholder="From (Origin)"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-red-900 dark:bg-black dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-400"
                autoComplete="off"
            />
          </div>

            {/* Interchange Button */}
            <div className="flex items-center justify-center flex-none">
              <button
                type="button"
                aria-label="Swap source and destination"
                className="p-2 rounded-full bg-gray-100 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 border border-gray-200 dark:border-red-700 shadow-sm transition dark:text-white"
                onClick={() => {
                  const temp = source;
                  setSource(destination);
                  setDestination(temp);
                  setTimeout(() => {
                    if (destination && source) {
                      const newSource = destination;
                      const newDestination = source;
                      if (newSource && newDestination) {
                        document.getElementById('calculate-btn')?.click();
                      }
                    }
                  }, 0);
                }}
              >
                <ArrowUpDown className="w-5 h-5 text-red-500 dark:text-white" />
              </button>
            </div>

            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-3 w-5 h-5 text-red-500 dark:text-white" />
            <input
                ref={destinationRef}
              type="text"
              placeholder="To (Destination)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-red-900 dark:bg-black dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:border-red-400"
                autoComplete="off"
            />
          </div>

          <select
            value={vehicleType}
            onChange={(e) => {
              setVehicleType(e.target.value);
              setIsUsingRoute(false); // Reset flag when user manually changes vehicle type
            }}
              className="px-4 py-3 border border-gray-200 dark:border-red-900 dark:bg-black dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 max-w-xs flex-1"
          >
              <option value="Car">Car</option>
              <option value="Light Commercial Vehicle">Light Commercial Vehicle</option>
              <option value="Bus">Bus</option>
              <option value="3 Axle Truck">3 Axle Truck</option>
              <option value="4 Axle Truck">4 Axle Truck</option>
              <option value="Heavy Commercial Vehicle">Heavy Commercial Vehicle</option>
              <option value="5 or More Axle Truck">5 or More Axle Truck</option>
          </select>

          <select
            value={routePreference}
            onChange={(e) => setRoutePreference(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-red-900 dark:bg-black dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 max-w-xs flex-1"
          >
              <option value="best">Best</option>
            <option value="cheapest">Cheapest</option>
            <option value="fastest">Fastest</option>
          </select>

          <motion.button
              id="calculate-btn"
              type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
              disabled={isCalculating || !source || !destination}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 ml-2 flex-none w-[170px] flex items-center justify-center dark:bg-gradient-to-r dark:from-black dark:to-red-900 dark:text-white"
          >
            {isCalculating ? (
                <span className="flex items-center justify-center w-full">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Calculating...
                </span>
            ) : (
                <span className="flex items-center justify-center w-full">
                Calculate
                </span>
            )}
          </motion.button>
          </div>
        </motion.form>

      {/* Results Section */}
        {showResults && routes.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Route Options */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
              className="xl:col-span-1 space-y-4 bg-white dark:bg-black dark:border dark:border-red-900 rounded-2xl shadow-xl dark:shadow-red-900 p-6 transition-colors duration-300"
          >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Route Options</h2>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSaveRoute}
                    className={`p-2 transition-colors ${
                      isRouteSaved 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-500 hover:text-red-600 dark:text-white dark:hover:text-red-400'
                    }`}
                    title={isRouteSaved ? "Unsave route" : "Save route"}
                  >
                    <Bookmark className={`w-5 h-5 ${isRouteSaved ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={shareRoute}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-white dark:hover:text-red-400"
                    title="Share route"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
            </div>

              {/* List of route options */}
              {routes && routes.length > 0 && (
                <RouteResults
                  source={source}
                  destination={destination}
                  vehicleType={vehicleType}
                  routes={routes}
                />
            )}

            {/* Report Issues Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mt-6 dark:bg-gradient-to-r dark:from-black dark:to-red-900 dark:border-red-900 dark:text-red-100"
            >
              <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 dark:text-white" />
                <div>
                    <h3 className="font-semibold text-orange-800 dark:text-white">Found an Issue?</h3>
                    <p className="text-sm text-orange-700 mb-2 dark:text-white">
                    Report incorrect toll prices or missing toll booths
                  </p>
                    <button className="text-sm text-orange-600 hover:text-orange-800 font-medium underline dark:text-white dark:hover:text-red-400">
                    Report Issue →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-2 h-96 xl:h-[600px] sticky top-20"
          >
              <MapContainer
              routes={routes}
                selectedRouteIndex={selectedRouteIndex}
                onSelectRoute={handleSelectRoute}
            />
          </motion.div>
        </div>
      )}
    </div>
  </div>
);
};

export default Calculator;
