import { useState } from 'react';
import RouteResults from '../components/RouteResults';
import MapContainer from '../components/MapContainer';
import { calculateToll } from '../utils/api';
import { useRoute } from '../context/RouteContext';
import{ React ,useEffect} from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Calculator = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [intermediateStops, setIntermediateStops] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [vehicleType, setVehicleType] = useState('car');
  const [axleCount, setAxleCount] = useState('2');
  const [fuelType, setFuelType] = useState('diesel');
  const [showVehicleNumber, setShowVehicleNumber] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  const {setRouteData ,setIsLoading,isLoading} = useRoute();


  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      translateAndExtract(transcript);
    }
  }, [transcript]);


  const translateAndExtract = async (spokenText) => {
    try {
      // Google Translate API endpoint
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: spokenText,
            target: 'en',
          }),
        }
      );

      const data = await response.json();
      const translated = data.data.translations[0].translatedText;
      setTranslatedText(translated);

      extractPlaces(translated);
    } catch (err) {
      console.error('Translation failed', err);
    }
  };

  const extractPlaces = (text) => {
  const patterns = [
    /from\s+(.+?)\s+to\s+(.+)/i,
    /go from\s+(.+?)\s+to\s+(.+)/i,
    /go to\s+(.+?)\s+from\s+(.+)/i,
    /(.+?)\s+to\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const extractedSource = pattern.source.includes('from') ? match[1] : match[2];
      const extractedDestination = pattern.source.includes('from') ? match[2] : match[1];

      if (extractedSource && extractedDestination) {
        setSource(extractedSource.trim());
        setDestination(extractedDestination.trim());
        return;
      }
    }
  }

  console.warn('Could not extract full route from speech');
};



  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser doesn't support speech recognition.</span>;
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("source & destination & vehicleType:", source,destination, vehicleType);
    console.log("vehicleType type:", typeof vehicleType, "value:", vehicleType);
    console.log('source type:', typeof source, source);
    console.log('destination type:', typeof destination, destination);
    setIsLoading(true); 


    try {
      const response = await calculateToll(source,destination,vehicleType);
      setShowResults(true);
      setRouteData(response);
      console.log("Response Data:", response);
      
    } catch (error) {
      console.error("Error:", error);
    }finally {
    setIsLoading(false);       // stop loading once done
  }
  };

  const addIntermediateStop = () => {
    setIntermediateStops([...intermediateStops, '']);
  };

  const updateIntermediateStop = (index, value) => {
    const updatedStops = [...intermediateStops];
    updatedStops[index] = value;
    setIntermediateStops(updatedStops);
  };

  const removeIntermediateStop = (index) => {
    const updatedStops = intermediateStops.filter((_, i) => i !== index);
    setIntermediateStops(updatedStops);
  };

  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
    // Add voice recognition logic here
  };

  const handleMicClick = () => {
  if (!listening) {
    setIsVoiceActive(true);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'hi-IN' });
  } else {
    setIsVoiceActive(false);
    SpeechRecognition.stopListening();
  }
};


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
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center space-x-2"
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
                axleCount={axleCount}
                fuelType={fuelType}
              />
            </div>

            {/* Right side - Map */}
          <div className="bg-white rounded-lg shadow-sm p-4 min-h-[600px]">
  <MapContainer source={source} destination={destination} stops={intermediateStops} />
</div>

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
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-2 rounded-full ${
                      isVoiceActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-blue-100 hover:text-blue-600 transition-colors`}
                  >
                    {/* <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg> */}
                    <p className="text-sm text-gray-500">
                      🎤 Detected: {translatedText} <br />
                      Source: <strong>{source}</strong>, Destination: <strong>{destination}</strong>
                    </p>

                  </button>
                </div>

                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                    Source
                  </label>
                  <input
                    type="text"
                    id="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
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

                <button
                  type="button"
                  onClick={addIntermediateStop}
                  className="mt-2 flex items-center justify-center w-full py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Stop
                </button>

                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                    Destination
                  </label>
                  <input
                    type="text"
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                    placeholder="Enter destination location"
                    required
                  />
                </div>
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 "
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={showVehicleNumber}
                        onChange={() => setShowVehicleNumber(true)}
                      />
                      <label htmlFor="vehicleNumberOption" className="ml-2 block text-sm font-medium text-gray-700">
                        Enter Vehicle Number
                      </label>
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                      >
                        <option value="Car">Car</option>
                        <option value="Light Commercial Vehicle">Light Commercial Vehicle</option>
                        <option value="Bus">Bus</option>
                        <option value="Multi-Axle Truck">Multi-Axle Truck</option>
                        <option value="Heavy Commercial Vehicle">Heavy Commercial Vehicle</option>
                        <option value="4 to 6 Axle Truck">4 to 6 Axle Truck</option>
                        <option value="7 or More Axle Truck">7 or More Axle Truck</option>
                      </select>
                    </div>

                    {/* {vehicleType === 'truck' && (
                      <div>
                        <label htmlFor="axleCount" className="block text-sm font-medium text-gray-700">
                          Number of Axles
                        </label>
                        <select
                          id="axleCount"
                          value={axleCount}
                          onChange={(e) => setAxleCount(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          {[2, 3, 4, 5, 6, 7].map(num => (
                            <option key={num} value={num}>{num} Axles</option>
                          ))}
                        </select>
                      </div>
                    )} */}

                    {/* <div>
                      <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
                        Fuel Type
                      </label>
                      <select
                        id="fuelType"
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={vehicleType === 'truck'}
                      >
                        <option value="diesel">Diesel</option>
                        <option value="petrol">Petrol</option>
                        <option value="cng">CNG</option>
                        <option value="electric">Electric</option>
                      </select>
                    </div> */}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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