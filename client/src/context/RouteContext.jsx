import React, { createContext, useState, useContext, useEffect } from "react";


const RouteContext = createContext();


export const RouteProvider = ({ children }) => {
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(() => {
    const saved = localStorage.getItem('selectedRouteIndex');
    return saved ? parseInt(saved) : null;
  });

  // Persist selectedRouteIndex whenever it changes
  useEffect(() => {
    if (selectedRouteIndex !== null) {
      localStorage.setItem('selectedRouteIndex', selectedRouteIndex.toString());
    } else {
      localStorage.removeItem('selectedRouteIndex');
    }
  }, [selectedRouteIndex]);

  return (
    <RouteContext.Provider value={{ routeData, setRouteData, isLoading, setIsLoading , selectedRouteIndex, setSelectedRouteIndex }}>
      {children}
    </RouteContext.Provider>
  );
};


export const useRoute = () => useContext(RouteContext);
