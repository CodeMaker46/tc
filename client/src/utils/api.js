import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'; 
console.log("base url", BASE_URL);  

export const calculateToll = async (source, destination, vehicleType) => {
  try {
    const postData = {
      origin: source,
      destination,
      vehicleType, 
    };
    console.log("calculateToll POST data:", postData);  // <-- Add this line

    const response = await axios.post(`${BASE_URL}/api/toll/calculate-toll`, postData);
    return response.data;
  } catch (error) {
    console.error("API Error", error);
    throw error;
  }
};
