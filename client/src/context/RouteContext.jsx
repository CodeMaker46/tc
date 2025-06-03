
import React, { createContext, useState, useContext, useEffect, useRef } from "react";

const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
  const [routeData, setRouteData] = useState(() => {
    const storedData = localStorage.getItem("routeData");
    return storedData ? JSON.parse(storedData) : null;
  });

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(-1)
  

  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const [tolls, setTolls] = useState(null);
  


  return (
    <RouteContext.Provider
      value={{
        routeData,
        setRouteData,
        isLoading,
        setIsLoading,
        selectedRouteIndex,
        setSelectedRouteIndex,
        mapRef,
        polylineRef,
        tolls,
        setTolls
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = () => useContext(RouteContext);
