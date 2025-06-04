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

// Optimized: decode polyline only
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

// Ultra-precise interpolation for maximum accuracy
const improveRoutePoints = (decodedPath) => {
  const improvedPoints = [decodedPath[0]];
  
  for (let i = 0; i < decodedPath.length - 1; i++) {
    const p1 = decodedPath[i];
    const p2 = decodedPath[i + 1];
    const distance = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    
    // Ultra-fine interpolation - every 100 meters for precision
    if (distance > 0.1) {
      const numPoints = Math.ceil(distance / 0.1);
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

// Calculate perpendicular distance from point to line segment
const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
  const projection = {
    x: x1 + t * dx,
    y: y1 + t * dy
  };
  
  return Math.sqrt((px - projection.x) ** 2 + (py - projection.y) ** 2);
};

// Advanced: Check if toll is on the exact route with direction validation
const isTollOnExactRoute = (tollLat, tollLon, routePoints) => {
  let minPerpendicularDistance = Infinity;
  let bestSegmentIndex = -1;
  let closestPointOnRoute = null;
  
  // Find the closest segment and perpendicular distance
  for (let i = 0; i < routePoints.length - 1; i++) {
    const p1 = routePoints[i];
    const p2 = routePoints[i + 1];
    
    // Convert to meters for accurate calculation
    const scale = 111000; // approximate meters per degree
    const cosLat = Math.cos(toRad((p1.lat + p2.lat) / 2));
    
    const tollLatM = tollLat * scale;
    const tollLonM = tollLon * scale * cosLat;
    const p1LatM = p1.lat * scale;
    const p1LonM = p1.lng * scale * cosLat;
    const p2LatM = p2.lat * scale;
    const p2LonM = p2.lng * scale * cosLat;
    
    const perpDistance = pointToLineDistance(
      tollLatM, tollLonM,
      p1LatM, p1LonM,
      p2LatM, p2LonM
    );
    
    if (perpDistance < minPerpendicularDistance) {
      minPerpendicularDistance = perpDistance;
      bestSegmentIndex = i;
      
      // Calculate closest point on this segment
      const dx = p2.lng - p1.lng;
      const dy = p2.lat - p1.lat;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        const t = Math.max(0, Math.min(1, 
          ((tollLon - p1.lng) * dx + (tollLat - p1.lat) * dy) / (length * length)
        ));
        closestPointOnRoute = {
          lat: p1.lat + t * dy,
          lng: p1.lng + t * dx
        };
      }
    }
  }
  
  // Reject if perpendicular distance > 30 meters
  if (minPerpendicularDistance > 30) return false;
  
  // Additional check: Verify route direction consistency
  if (bestSegmentIndex >= 0 && closestPointOnRoute) {
    const p1 = routePoints[bestSegmentIndex];
    const p2 = routePoints[bestSegmentIndex + 1];
    
    // Calculate route bearing at this segment
    const routeBearing = calculateBearing(p1.lat, p1.lng, p2.lat, p2.lng);
    
    // Calculate bearing from closest route point to toll
    const tollBearing = calculateBearing(closestPointOnRoute.lat, closestPointOnRoute.lng, tollLat, tollLon);
    
    // Check if toll is roughly perpendicular to route (not along it)
    const bearingDiff = Math.abs(routeBearing - tollBearing);
    const normalizedDiff = Math.min(bearingDiff, 360 - bearingDiff);
    
    // Toll should be roughly perpendicular (60-120 degrees) to route direction
    // This helps eliminate tolls on parallel routes
    if (normalizedDiff < 60 || normalizedDiff > 120) {
      return false; // Toll is too aligned with route direction (likely parallel road)
    }
  }
  
  return true;
};

// Route-specific toll validation with parallel route elimination
const validateTollForRoute = (tollLat, tollLon, routePoints, allRoutePoints = []) => {
  // Step 1: Basic distance check
  let minDistanceToRoute = Infinity;
  for (const point of routePoints) {
    const distance = haversineDistance(point.lat, point.lng, tollLat, tollLon);
    minDistanceToRoute = Math.min(minDistanceToRoute, distance);
  }
  
  // Must be within 30m of the specific route
  if (minDistanceToRoute > 0.03) return false;
  
  // Step 2: Check if toll is much closer to another route (parallel route detection)
  if (allRoutePoints.length > 0) {
    for (const otherRoutePoints of allRoutePoints) {
      if (otherRoutePoints === routePoints) continue; // Skip same route
      
      let minDistanceToOtherRoute = Infinity;
      for (const point of otherRoutePoints) {
        const distance = haversineDistance(point.lat, point.lng, tollLat, tollLon);
        minDistanceToOtherRoute = Math.min(minDistanceToOtherRoute, distance);
      }
      
      // If toll is significantly closer to another route, reject it
      if (minDistanceToOtherRoute < minDistanceToRoute * 0.7) {
        return false;
      }
    }
  }
  
  // Step 3: Strict geometric alignment
  return isTollOnExactRoute(tollLat, tollLon, routePoints);
};

// Enhanced: ultra-strict toll detection with parallel route elimination
const findNearbyTolls = (routePoints, nhaiData, vehicleType, allRoutePoints = []) => {
  const nearbyTolls = [];
  const processedTolls = new Set();
  
  for (const toll of nhaiData) {
    if (processedTolls.has(toll.Tollname)) continue;
    
    const tollLat = parseFloat(toll.SnappedLatitude || toll.Latitude);
    const tollLon = parseFloat(toll.SnappedLongitude || toll.Longitude);
    
    if (isNaN(tollLat) || isNaN(tollLon)) continue;
    
    // Ultra-strict validation with parallel route check
    if (validateTollForRoute(tollLat, tollLon, routePoints, allRoutePoints)) {
      nearbyTolls.push({
        name: toll.Tollname,
        location: { lat: tollLat, lng: tollLon },
        rate: getTollRate(toll, vehicleType),
        projectType: toll.Projecttype,
        verified: true
      });
      processedTolls.add(toll.Tollname);
    }
  }
  
  return nearbyTolls;
};

// Enhanced: Cross-route validation to eliminate shared tolls on parallel routes
const filterUniqueRouteatolls = (routeResults) => {
  // Create a map of toll locations to routes
  const tollToRoutes = new Map();
  
  routeResults.forEach((route, routeIndex) => {
    route.tolls.forEach(toll => {
      const key = `${toll.location.lat.toFixed(6)},${toll.location.lng.toFixed(6)}`;
      if (!tollToRoutes.has(key)) {
        tollToRoutes.set(key, []);
      }
      tollToRoutes.get(key).push({ routeIndex, toll });
    });
  });
  
  // Remove tolls that appear on multiple routes (likely parallel route issues)
  tollToRoutes.forEach((routes, tollKey) => {
    if (routes.length > 1) {
      // This toll appears on multiple routes - remove from all except the closest
      let closestRoute = null;
      let minDistance = Infinity;
      
      routes.forEach(({ routeIndex, toll }) => {
        const routePoints = routeResults[routeIndex].improvedPoints || [];
        let distanceToRoute = Infinity;
        
        for (const point of routePoints) {
          const distance = haversineDistance(
            point.lat, point.lng, 
            toll.location.lat, toll.location.lng
          );
          distanceToRoute = Math.min(distanceToRoute, distance);
        }
        
        if (distanceToRoute < minDistance) {
          minDistance = distanceToRoute;
          closestRoute = routeIndex;
        }
      });
      
      // Remove toll from all routes except the closest one
      routes.forEach(({ routeIndex, toll }) => {
        if (routeIndex !== closestRoute) {
          const routeResult = routeResults[routeIndex];
          routeResult.tolls = routeResult.tolls.filter(t => 
            t.location.lat !== toll.location.lat || t.location.lng !== toll.location.lng
          );
          routeResult.tollsVerified = routeResult.tolls;
        }
      });
    }
  });
  
  return routeResults;
};

const getTollData = async (req, res, nhaiData, tfw) => {
  const { origin, destination, vehicleType = 'Car' } = req.body;

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
    
    // Single API call for directions
    const directionsURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&alternatives=true&mode=driving&key=${apiKey}`;
    const googleRes = await axios.get(directionsURL);
    const routes = googleRes.data.routes;

    if (!routes || routes.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Prepare all route points for cross-validation
    const limitedRoutes = routes.slice(0, 3);
    const allImprovedPoints = [];
    
    // First pass: decode and improve all routes
    const routeData = limitedRoutes.map((route, routeIndex) => {
      const decodedPath = decodePolyline(route.overview_polyline.points);
      const improvedPoints = improveRoutePoints(decodedPath);
      allImprovedPoints.push(improvedPoints);
      return { route, improvedPoints, routeIndex };
    });

    // Second pass: find tolls with cross-route validation
    const routeResults = await Promise.all(routeData.map(async ({ route, improvedPoints, routeIndex }) => {
      // Find tolls with parallel route awareness
      const verifiedTolls = findNearbyTolls(improvedPoints, nhaiData, vehicleType, allImprovedPoints);
      
      // Calculate total toll cost
      let totalToll = 0;
      const covered = new Set();
      
      for (let i = 0; i < verifiedTolls.length - 1; i++) {
        const tollA = verifiedTolls[i];
        const tollB = verifiedTolls[i + 1];
        
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
      
      const lastToll = verifiedTolls[verifiedTolls.length - 1];
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
        tollsVerified: verifiedTolls,
        tollsUnverified: [],
        totalToll,
        improvedPoints // Store for cross-validation
      };
    }));

    // Third pass: eliminate shared tolls between routes
    const finalRouteResults = filterUniqueRouteatolls(routeResults);
    
    // Recalculate toll costs after filtering
    finalRouteResults.forEach(route => {
      let totalToll = 0;
      const covered = new Set();
      
      for (let i = 0; i < route.tolls.length - 1; i++) {
        const tollA = route.tolls[i];
        const tollB = route.tolls[i + 1];
        
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
      
      const lastToll = route.tolls[route.tolls.length - 1];
      if (lastToll && !covered.has(lastToll.name)) {
        totalToll += parseFloat(lastToll.rate) || 0;
      }
      
      route.totalToll = totalToll;
      delete route.improvedPoints; // Clean up
    });

    // Sort routes by total toll (ascending)
    finalRouteResults.sort((a, b) => a.totalToll - b.totalToll);

    return res.json({
      vehicleType,
      routes: finalRouteResults,
      cheapestRoute: finalRouteResults[0],
      fastestRoute: finalRouteResults.reduce((fastest, route) => {
        const currentDuration = parseDuration(route.duration);
        const fastestDuration = parseDuration(fastest.duration);
        return currentDuration < fastestDuration ? route : fastest;
      }, finalRouteResults[0])
    });

  } catch (error) {
    console.error('Toll calc error:', error.message);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { getTollData };