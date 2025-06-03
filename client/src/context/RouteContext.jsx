
import React, { createContext, useState, useContext, useEffect, useRef } from "react";

const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
  const [routeData, setRouteData] = useState(() => {
    const storedData = localStorage.getItem("routeData");
    return storedData ? JSON.parse(storedData) : null;
  });

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null)

  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  // const [decodedPath, setDecodedPath] = useState(null);

  useEffect(() => {
    if(selectedRouteIndex){
      localStorage.setItem("selectedRouteIndex", selectedRouteIndex.toString());
    }
  }, [selectedRouteIndex]);

  // useEffect(() => {
  //   if (!routeData || !routeData.routes || !routeData.routes[selectedRouteIndex]) return;

  //   const selectedRoute = routeData.routes[selectedRouteIndex];
  //   const polylinePoints = selectedRoute.polyline?.points;
  //   if (!polylinePoints || !window.google?.maps?.geometry?.encoding || !mapRef.current) return;

  //   const getdecodedPath = window.google.maps.geometry.encoding.decodePath(polylinePoints);
  //   console.log("decodedPath", getdecodedPath);

  //   setDecodedPath(getdecodedPath);

  //   if (polylineRef.current) {
  //     polylineRef.current.setMap(null);
  //   }

  //   const newPolyline = new window.google.maps.Polyline({
  //     path: decodedPath,
  //     strokeColor: "#1976d2",
  //     strokeOpacity: 1.0,
  //     strokeWeight: 5,
  //   });

  //   newPolyline.setMap(mapRef.current);
  //   polylineRef.current = newPolyline;
  // }, [routeData, selectedRouteIndex, decodedPath]);

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
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = () => useContext(RouteContext);
