import React, { createContext, useState, useContext } from "react";


const RouteContext = createContext();


export const RouteProvider = ({ children }) => {
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);

  return (
    <RouteContext.Provider value={{ routeData, setRouteData, isLoading, setIsLoading , selectedRouteIndex, setSelectedRouteIndex }}>
      {children}
    </RouteContext.Provider>
  );
};


export const useRoute = () => useContext(RouteContext);
