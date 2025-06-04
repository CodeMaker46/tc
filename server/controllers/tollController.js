const axios = require('axios');

// Utility: Convert degrees to radians
const toRad = deg => (deg * Math.PI) / 180;
const toDeg = rad => (rad * 180) / Math.PI;

function parseDuration(durationStr) {
  const regex = /(\d+)\s*hour[s]?/i;
  const minRegex = /(\d+)\s*min[s]?/i;

  let hours = 0, minutes = 0;

  const hourMatch = durationStr.match(regex);
  const minMatch = durationStr.match(minRegex);

  if (hourMatch) {
    hours = parseInt(hourMatch[1]);
  }
  if (minMatch) {
    minutes = parseInt(minMatch[1]);
  }

  return hours * 60 + minutes; // Total in minutes
}

const getTollRate = (toll, vehicleType = 'Car') => {
  const rateKeyMap = {
    'Car': 'Car Rate Single',
    'Light Commercial Vehicle': 'Lcvrate Single',
    'Bus': 'Busrate Single',
    '3 Axle Truck': 'Threeaxle Single',
    'Heavy Commercial Vehicle': 'HCM EME Single',
    '4 Axle Truck': 'Fouraxle Single',
    '5 or More Axle Truck': 'Oversized Single',
  };

  const key = rateKeyMap[vehicleType] || 'Car Rate Single';
  return parseFloat(toll[key]) || 0;
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate bearing between two points
const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - 
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const decodePolyline = (encoded) => {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
};

// Improved interpolation with configurable density
const improveRoutePoints = (decodedPath, intervalKm = 0.5) => {
  const improvedPoints = [decodedPath[0]];
  
  for (let i = 0; i < decodedPath.length - 1; i++) {
    const p1 = decodedPath[i];
    const p2 = decodedPath[i + 1];
    const distance = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    
    // More reasonable interpolation - every 500m instead of 100m
    if (distance > intervalKm) {
      const numPoints = Math.ceil(distance / intervalKm);
      for (let j = 1; j < numPoints; j++) {
        const ratio = j / numPoints;
        improvedPoints.push({
          lat: p1.lat + (p2.lat - p1.lat) * ratio,
          lng: p1.lng + (p2.lng - p1.lng) * ratio
        });
      }
    }
    improvedPoints.push(p2);
  }
  
  return improvedPoints;
};

// Simplified and more lenient toll validation
const isTollNearRoute = (tollLat, tollLon, routePoints, maxDistanceKm = 0.2) => {
  let minDistance = Infinity;
  
  // Check distance to all route points
  for (const point of routePoints) {
    const distance = haversineDistance(point.lat, point.lng, tollLat, tollLon);
    minDistance = Math.min(minDistance, distance);
    
    // Early exit if we find a close point
    if (distance <= maxDistanceKm) {
      return true;
    }
  }
  
  return false;
};

// More sophisticated perpendicular distance calculation
const getMinDistanceToRoute = (tollLat, tollLon, routePoints) => {
  let minDistance = Infinity;
  
  // Check distance to route segments (not just points)
  for (let i = 0; i < routePoints.length - 1; i++) {
    const p1 = routePoints[i];
    const p2 = routePoints[i + 1];
    
    // Calculate distance to line segment
    const segmentDistance = pointToLineSegmentDistance(tollLat, tollLon, p1.lat, p1.lng, p2.lat, p2.lng);
    minDistance = Math.min(minDistance, segmentDistance);
  }
  
  return minDistance;
};

// Improved point to line segment distance calculation
const pointToLineSegmentDistance = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  if (dx === 0 && dy === 0) {
    // Line segment is a point
    return haversineDistance(px, py, x1, y1);
  }
  
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projectionX = x1 + t * dx;
  const projectionY = y1 + t * dy;
  
  return haversineDistance(px, py, projectionX, projectionY);
};

// Multi-tier validation approach
const validateTollForRoute = (tollLat, tollLon, routePoints, config = {}) => {
  const {
    primaryDistanceKm = 0.1,    // Primary validation distance
    secondaryDistanceKm = 0.2,  // Secondary validation distance
  } = config;
  
  // Tier 1: Quick distance check
  const minDistance = getMinDistanceToRoute(tollLat, tollLon, routePoints);
  
  if (minDistance <= primaryDistanceKm) {
    return { valid: true, confidence: 'high', distance: minDistance };
  }
  
  if (minDistance <= secondaryDistanceKm) {
    return { valid: true, confidence: 'medium', distance: minDistance };
  }
  
  return { valid: false, confidence: 'low', distance: minDistance };
};

// Relaxed toll finding with configurable strictness
const findNearbyTolls = (routePoints, nhaiData, vehicleType, config = {}) => {
  const {
    strictMode = false,
    includeMediumConfidence = true,
    maxDistanceKm = 0.2
  } = config;
  
  const nearbyTolls = [];
  const processedTolls = new Set();
  
  // console.log(`Searching for tolls near route with ${routePoints.length} points`);
  
  for (const toll of nhaiData) {
    if (processedTolls.has(toll.Tollname)) continue;
    
    const tollLat = parseFloat(toll.SnappedLatitude || toll.Latitude);
    const tollLon = parseFloat(toll.SnappedLongitude || toll.Longitude);
    
    if (isNaN(tollLat) || isNaN(tollLon)) {
      console.log(`Skipping toll ${toll.Tollname} - invalid coordinates`);
      continue;
    }
    
    const validation = validateTollForRoute(tollLat, tollLon, routePoints, {
      primaryDistanceKm: strictMode ? 0.1 : 0.2,
      secondaryDistanceKm: maxDistanceKm,
      enableBearingCheck: strictMode,
      enableParallelCheck: strictMode
    });
    
    if (validation.valid && (validation.confidence === 'high' || (includeMediumConfidence && validation.confidence === 'medium'))) {
      nearbyTolls.push({
        name: toll.Tollname,
        location: { lat: tollLat, lng: tollLon },
        rate: getTollRate(toll, vehicleType),
        projectType: toll.Projecttype,
        confidence: validation.confidence,
        distance: validation.distance,
        verified: validation.confidence === 'high'
      });
      processedTolls.add(toll.Tollname);
      console.log(`Found toll: ${toll.Tollname} (${validation.confidence} confidence, ${validation.distance.toFixed(3)}km)`);
    }
  }
  
  // console.log(`Found ${nearbyTolls.length} tolls for this route`);
  return nearbyTolls;
};

// Simplified cross-route validation
const filterUniqueRouteTolls = (routeResults, config = {}) => {
  const { enableCrossRouteFiltering = false } = config;
  
  if (!enableCrossRouteFiltering) {
    return routeResults; // Skip cross-route filtering
  }
  
  // Create a map of toll locations to routes
  const tollToRoutes = new Map();
  
  routeResults.forEach((route, routeIndex) => {
    route.tolls.forEach(toll => {
      const key = `${toll.location.lat.toFixed(4)},${toll.location.lng.toFixed(4)}`;
      if (!tollToRoutes.has(key)) {
        tollToRoutes.set(key, []);
      }
      tollToRoutes.get(key).push({ routeIndex, toll });
    });
  });
  
  // Only remove tolls that appear on ALL routes (clearly wrong)
  tollToRoutes.forEach((routes, tollKey) => {
    if (routes.length === routeResults.length) {
      // This toll appears on ALL routes - likely a data issue
      console.log(`Removing toll that appears on all routes: ${routes[0].toll.name}`);
      routes.forEach(({ routeIndex }) => {
        routeResults[routeIndex].tolls = routeResults[routeIndex].tolls.filter(t => 
          `${t.location.lat.toFixed(4)},${t.location.lng.toFixed(4)}` !== tollKey
        );
      });
    }
  });
  
  return routeResults;
};

const getTollData = async (req, res, nhaiData, tfw) => {
  const { 
    origin, 
    destination, 
    vehicleType = 'Car',
    strictMode = true,
    maxTollDistance = 0.5,
    enableCrossRouteFiltering = false
  } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' });
  }

  if (!nhaiData || nhaiData.length === 0) {
    return res.status(500).json({ error: 'NHAI toll data not loaded' });
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey === undefined) {
      return res.status(500).json({ error: 'Google Maps API key is not set' });
    }
    
    console.log(`Processing route from ${origin} to ${destination}`);
    
    // Get directions from Google Maps
    const directionsURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&alternatives=true&mode=driving&key=${apiKey}`;
    const googleRes = await axios.get(directionsURL);
    const routes = googleRes.data.routes;

    if (!routes || routes.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    console.log(`Found ${routes.length} alternative routes`);

    // Process up to 3 routes
    const limitedRoutes = routes.slice(0, 3);
    
    const routeResults = await Promise.all(limitedRoutes.map(async (route, routeIndex) => {
      console.log(`Processing route ${routeIndex + 1}`);
      
      const decodedPath = decodePolyline(route.overview_polyline.points);
      const improvedPoints = improveRoutePoints(decodedPath);
      
      // console.log(`Route ${routeIndex + 1}: ${decodedPath.length} original points, ${improvedPoints.length} improved points`);
      
      // Find tolls with relaxed validation
      const verifiedTolls = findNearbyTolls(improvedPoints, nhaiData, vehicleType, {
        strictMode,
        includeMediumConfidence: true,
        maxDistanceKm: maxTollDistance
      });
      
      // Calculate total toll cost - MAINTAIN ORIGINAL ORDER, NO SORTING
      let totalToll = 0;
      const covered = new Set();
      
      // Keep tolls in their original order (no sorting by latitude)
      const tollsInOrder = [...verifiedTolls];
      
      for (let i = 0; i < tollsInOrder.length - 1; i++) {
        const tollA = tollsInOrder[i];
        const tollB = tollsInOrder[i + 1];
        
        const sortedNames = [tollA.name, tollB.name].sort();
        const edgeKey = `${sortedNames[0]}|${sortedNames[1]}`;
        
        if (tfw[edgeKey] !== undefined) {
          totalToll += parseFloat(tfw[edgeKey][vehicleType]) || 0;
          covered.add(tollA.name);
          covered.add(tollB.name);
          continue;
        }
        
        if (!covered.has(tollA.name)) {
          totalToll += parseFloat(tollA.rate) || 0;
          covered.add(tollA.name);
        }
      }
      
      const lastToll = tollsInOrder[tollsInOrder.length - 1];
      if (lastToll && !covered.has(lastToll.name)) {
        totalToll += parseFloat(lastToll.rate) || 0;
      }
      
      return {
        routeIndex,
        polyline: route.overview_polyline,
        legs: route.legs,
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        tolls: verifiedTolls,
        tollsVerified: verifiedTolls.filter(t => t.confidence === 'high'),
        tollsUnverified: verifiedTolls.filter(t => t.confidence === 'medium'),
        totalToll,
        summary: route.summary || `Route ${routeIndex + 1}`
      };
    }));

    // Apply cross-route filtering if enabled
    const finalRouteResults = filterUniqueRouteTolls(routeResults, { enableCrossRouteFiltering });
    
    // Recalculate toll costs after filtering - MAINTAIN ORIGINAL ORDER
    finalRouteResults.forEach(route => {
      let totalToll = 0;
      const covered = new Set();
      
      // Keep tolls in their original order (no sorting by latitude)
      const tollsInOrder = [...route.tolls];
      
      for (let i = 0; i < tollsInOrder.length - 1; i++) {
        const tollA = tollsInOrder[i];
        const tollB = tollsInOrder[i + 1];
        
        const sortedNames = [tollA.name, tollB.name].sort();
        const edgeKey = `${sortedNames[0]}|${sortedNames[1]}`;
        
        if (tfw[edgeKey] !== undefined) {
          totalToll += parseFloat(tfw[edgeKey][vehicleType]) || 0;
          covered.add(tollA.name);
          covered.add(tollB.name);
          continue;
        }
        
        if (!covered.has(tollA.name)) {
          totalToll += parseFloat(tollA.rate) || 0;
          covered.add(tollA.name);
        }
      }
      
      const lastToll = tollsInOrder[tollsInOrder.length - 1];
      if (lastToll && !covered.has(lastToll.name)) {
        totalToll += parseFloat(lastToll.rate) || 0;
      }
      
      route.totalToll = totalToll;
    });

    // Sort routes by total toll (ascending)
    finalRouteResults.sort((a, b) => a.totalToll - b.totalToll);

    // console.log('Route processing completed');
    
    return res.json({
      vehicleType,
      routes: finalRouteResults,
      cheapestRoute: finalRouteResults[0],
      fastestRoute: finalRouteResults.reduce((fastest, route) => {
        const currentDuration = parseDuration(route.duration);
        const fastestDuration = parseDuration(fastest.duration);
        return currentDuration < fastestDuration ? route : fastest;
      }, finalRouteResults[0]),
      settings: {
        strictMode,
        maxTollDistance,
        enableCrossRouteFiltering
      }
    });

  } catch (error) {
    console.error('Toll calc error:', error.message);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { getTollData };