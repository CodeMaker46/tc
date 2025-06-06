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

const getTollRate = (toll, vehicleType ) => {
  const rateKeyMap = {
    'Car': 'car',
    'Light Commercial Vehicle': 'lcv',
    'Bus': 'bus',
    '3 Axle Truck': 'threeAxle',
    '4 Axle Truck': 'fourAxle',
    'Heavy Commercial Vehicle': 'hcmEme',
    '5 or More Axle Truck': 'oversized'
  };

  const key = rateKeyMap[vehicleType] ;
  return parseFloat(toll.tolls?.[key]) || 0;
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

// const decodePolyline = (encoded) => {
//   let points = [];
//   let index = 0, len = encoded.length;
//   let lat = 0, lng = 0;
//   while (index < len) {
//     let b, shift = 0, result = 0;
//     do {
//       b = encoded.charCodeAt(index++) - 63;
//       result |= (b & 0x1f) << shift;
//       shift += 5;
//     } while (b >= 0x20);
//     let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
//     lat += dlat;
//     shift = 0;
//     result = 0;
//     do {
//       b = encoded.charCodeAt(index++) - 63;
//       result |= (b & 0x1f) << shift;
//       shift += 5;
//     } while (b >= 0x20);
//     let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
//     lng += dlng;
//     points.push({ lat: lat / 1e5, lng: lng / 1e5 });
//   }
//   return points;
// };
// First decode the polyline to get coordinates
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

// Function to split points into optimal batches for the Roads API
const splitIntoBatches = (points, maxPointsPerBatch = 95) => { // Reduced to 95 to allow for some interpolation
  const batches = [];
  let currentBatch = [];
  let distanceInBatch = 0;
  
  // Calculate average distance between points
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += haversineDistance(
      points[i-1].lat, points[i-1].lng,
      points[i].lat, points[i].lng
    );
  }
  const avgDistance = totalDistance / (points.length - 1);
  
  // Adjust batch size based on average distance
  const effectiveMaxPoints = Math.min(maxPointsPerBatch, 
    Math.max(20, Math.floor(25 / avgDistance))); // More points if they're closer together
  
  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      const distance = haversineDistance(
        points[i-1].lat, points[i-1].lng,
        points[i].lat, points[i].lng
      );
      distanceInBatch += distance;
    }
    
    currentBatch.push(points[i]);
    
    // Create new batch if current one is full or covers too much distance
    // Also ensure we're not splitting in the middle of a tight curve
    const isAtBatchLimit = currentBatch.length >= effectiveMaxPoints;
    const isCoveringTooMuchDistance = distanceInBatch > 25; // Reduced from 50 to 25 km
    
    if (isAtBatchLimit || isCoveringTooMuchDistance) {
      // Add extra points if we're in the middle of a curve
      if (i + 1 < points.length && i > 0) {
        const bearing1 = calculateBearing(
          points[i-1].lat, points[i-1].lng,
          points[i].lat, points[i].lng
        );
        const bearing2 = calculateBearing(
          points[i].lat, points[i].lng,
          points[i+1].lat, points[i+1].lng
        );
        const bearingDiff = Math.abs(bearing1 - bearing2);
        if (bearingDiff > 30) { // If there's a significant turn
          currentBatch.push(points[i+1]); // Include next point to maintain curve
        }
      }
      
      batches.push(currentBatch);
      currentBatch = [points[i]]; // Start new batch with last point
      distanceInBatch = 0;
    }
  }
  
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }
  
  return batches;
};

// Snap points to road using Google's Roads API
const snapToRoads = async (points, apiKey) => {
  try {
    console.log(`🛣️ Starting road snapping for ${points.length} points`);
    
    // Split points into optimal batches
    const batches = splitIntoBatches(points);
   // console.log(`📦 Split into ${batches.length} batches`);
    
    let snappedPoints = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📍 Processing batch ${i + 1}/${batches.length} with ${batch.length} points`);
      
      const pathString = batch.map(p => `${p.lat},${p.lng}`).join('|');
      const snapURL = `https://roads.googleapis.com/v1/snapToRoads?path=${pathString}&interpolate=true&key=${apiKey}`;
      
      try {
        const response = await axios.get(snapURL);
        
        if (response.data && response.data.snappedPoints) {
          const batchSnapped = response.data.snappedPoints.map(sp => ({
            lat: sp.location.latitude,
            lng: sp.location.longitude,
            placeId: sp.placeId
          }));
          
          snappedPoints = snappedPoints.concat(batchSnapped);
          console.log(`✅ Successfully snapped ${batchSnapped.length} points in batch ${i + 1}`);
        } else {
          console.warn(`⚠️ No snapped points returned for batch ${i + 1}, using original points`);
          snappedPoints = snappedPoints.concat(batch);
        }
        
        // Add delay between batches to avoid rate limiting
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (batchError) {
        console.error(`❌ Error in batch ${i + 1}:`, batchError.message);
        snappedPoints = snappedPoints.concat(batch);
      }
    }
    
  
    return snappedPoints;
    
  } catch (error) {
    console.error('Road snapping failed:', error.message);
    return points; // Fallback to original points
  }
};

// Interpolate between points to ensure smooth road alignment
const interpolatePoints = (points, maxDistance = 0.5) => {
  const result = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    result.push(p1);
    
    const distance = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    if (distance > maxDistance) {
      const segments = Math.ceil(distance / maxDistance);
      for (let j = 1; j < segments; j++) {
        const ratio = j / segments;
        result.push({
          lat: p1.lat + (p2.lat - p1.lat) * ratio,
          lng: p1.lng + (p2.lng - p1.lng) * ratio
        });
      }
    }
  }
  
  result.push(points[points.length - 1]); // Add last point
  return result;
};

// Process polyline with enhanced road snapping
const processPolyline = async (encodedPolyline, apiKey) => {
  try {
    // First decode the polyline
    const decodedPoints = decodePolyline(encodedPolyline);
   // console.log(`📍 Decoded ${decodedPoints.length} points from polyline`);
    
    // Initial interpolation for better coverage
    const interpolatedPoints = interpolatePoints(decodedPoints, 0.3); // 300m between points
   // console.log(`📊 Interpolated to ${interpolatedPoints.length} points`);
    
    // Smart sampling based on route characteristics
    let sampledPoints = [];
    let lastPoint = null;
    let bearingChange = 0;
    
    for (let i = 0; i < interpolatedPoints.length; i++) {
      const point = interpolatedPoints[i];
      
      // Always include first and last points
      if (i === 0 || i === interpolatedPoints.length - 1) {
        sampledPoints.push(point);
        lastPoint = point;
        continue;
      }
      
      // Calculate bearing change if we have enough points
      if (lastPoint && i < interpolatedPoints.length - 1) {
        const bearing1 = calculateBearing(
          lastPoint.lat, lastPoint.lng,
          point.lat, point.lng
        );
        const bearing2 = calculateBearing(
          point.lat, point.lng,
          interpolatedPoints[i + 1].lat, interpolatedPoints[i + 1].lng
        );
        bearingChange = Math.abs(bearing1 - bearing2);
      }
      
      // Include points based on various criteria
      const distance = lastPoint ? 
        haversineDistance(lastPoint.lat, lastPoint.lng, point.lat, point.lng) : 0;
      
      if (bearingChange > 15 || // Significant turn
          distance > 0.5 || // More than 500m from last point
          sampledPoints.length < 3 || // Ensure minimum points
          i % Math.max(1, Math.floor(interpolatedPoints.length / 80)) === 0) { // Regular sampling
        sampledPoints.push(point);
        lastPoint = point;
      }
    }
    
    console.log(`📊 Sampled to ${sampledPoints.length} strategic points`);
    
    // Snap the sampled points to roads
    const snappedPoints = await snapToRoads(sampledPoints, apiKey);
    
    if (snappedPoints && snappedPoints.length > 0) {
      // Final interpolation for smooth visualization
      const finalPoints = interpolatePoints(snappedPoints, 0.2); // 200m between points
      console.log(` Final route has ${finalPoints.length} road-aligned points`);
      return finalPoints;
    } else {
      console.warn(' Road snapping failed, using original points');
      return interpolatedPoints; // Return interpolated points as fallback
    }
    
  } catch (error) {
    console.error('❌ Error processing polyline:', error.message);
    const decodedPoints = decodePolyline(encodedPolyline);
    return interpolatePoints(decodedPoints, 0.3); // Fallback with interpolation
  }
};

// Enhanced route point improvement with smart interpolation
const improveRoutePoints = (points, intervalKm = 0.1) => {
  if (!points || points.length < 2) return points;
  
  const improvedPoints = [points[0]];
  let currentPoint = points[0];
  
  for (let i = 1; i < points.length; i++) {
    const nextPoint = points[i];
    const distance = haversineDistance(
      currentPoint.lat, currentPoint.lng,
      nextPoint.lat, nextPoint.lng
    );
    
    // Calculate bearing for current segment
    const bearing = calculateBearing(
      currentPoint.lat, currentPoint.lng,
      nextPoint.lat, nextPoint.lng
    );
    
    // Check for sharp turns
    let isSharpTurn = false;
    if (i < points.length - 1) {
      const nextBearing = calculateBearing(
        nextPoint.lat, nextPoint.lng,
        points[i + 1].lat, points[i + 1].lng
      );
      const bearingDiff = Math.abs(bearing - nextBearing);
      isSharpTurn = bearingDiff > 30;
    }
    
    // Add interpolated points if needed
    if (distance > intervalKm) {
      const numPoints = Math.ceil(distance / intervalKm);
      const actualInterval = distance / numPoints;
      
      for (let j = 1; j < numPoints; j++) {
        const ratio = j / numPoints;
        
        // Use great circle interpolation for better accuracy
        const lat1 = toRad(currentPoint.lat);
        const lon1 = toRad(currentPoint.lng);
        const lat2 = toRad(nextPoint.lat);
        const lon2 = toRad(nextPoint.lng);
        
        const d = 2 * Math.asin(Math.sqrt(
          Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.pow(Math.sin((lon2 - lon1) / 2), 2)
        ));
        
        const A = Math.sin((1 - ratio) * d) / Math.sin(d);
        const B = Math.sin(ratio * d) / Math.sin(d);
        
        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);
        
        const lat = toDeg(Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))));
        const lng = toDeg(Math.atan2(y, x));
        
        improvedPoints.push({ lat, lng });
      }
    }
    
    // Add extra points near sharp turns for better accuracy
    if (isSharpTurn) {
      const turnPoints = 3; // Add points before the turn
      for (let k = 1; k <= turnPoints; k++) {
        const ratio = 1 - (k / (turnPoints + 1));
        improvedPoints.push({
          lat: nextPoint.lat + (currentPoint.lat - nextPoint.lat) * ratio,
          lng: nextPoint.lng + (currentPoint.lng - nextPoint.lng) * ratio
        });
      }
    }
    
    improvedPoints.push(nextPoint);
    currentPoint = nextPoint;
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
    maxPerpendicularDistanceKm = 0.1,  // 50 meters perpendicular distance
    maxParallelDistanceKm = 0.1,        // 100 meters parallel distance for interpolation
  } = config;
  
  let minPerpendicularDistance = Infinity;
  let isNearRoute = false;
  
  // Check each segment of the route
  for (let i = 0; i < routePoints.length - 1; i++) {
    const p1 = routePoints[i];
    const p2 = routePoints[i + 1];
    
    // Calculate perpendicular distance from toll to this segment
    const perpendicularDist = pointToLineSegmentDistance(
      tollLat, tollLon,
      p1.lat, p1.lng,
      p2.lat, p2.lng
    );
    
    // If perpendicular distance is within threshold
    if (perpendicularDist <= maxPerpendicularDistanceKm) {
      // Calculate bearing of route segment
      const segmentBearing = calculateBearing(p1.lat, p1.lng, p2.lat, p2.lng);
      
      // Calculate bearing from segment start to toll
      const tollBearing = calculateBearing(p1.lat, p1.lng, tollLat, tollLon);
      
      // Calculate bearing difference
      const bearingDiff = Math.abs(segmentBearing - tollBearing);
      
      // If bearing difference is close to 90 degrees (±60°), it's considered perpendicular
      if (Math.abs(bearingDiff - 90) <= 40) {  // More flexible angle check
        minPerpendicularDistance = Math.min(minPerpendicularDistance, perpendicularDist);
        isNearRoute = true;
      }
    }
  }
  
  if (isNearRoute) {
    // High confidence if very close to route
    if (minPerpendicularDistance <= maxPerpendicularDistanceKm / 2) {
      return { valid: true, confidence: 'high', distance: minPerpendicularDistance };
    }
    // Medium confidence if within max distance
    return { valid: true, confidence: 'medium', distance: minPerpendicularDistance };
  }
  
  return { valid: false, confidence: 'low', distance: minPerpendicularDistance };
};

// Enhanced toll finding with precise perpendicular distance checking
const findNearbyTolls = (routePoints, nhaiData, vehicleType, config = {}) => {
  const {
    strictMode = false,
    includeMediumConfidence = true,
    maxDistanceKm = 0.05, // 50 meters by default
  } = config;

  const nearbyTolls = [];
  const processedTolls = new Set();

  // Add cumulative distance to route points if needed
  let orderedPoints = routePoints;
  if (routePoints.length > 2) {
    let cumulativeDistance = 0;
    orderedPoints = routePoints.map((point, index) => {
      if (index > 0) {
        cumulativeDistance += haversineDistance(
          routePoints[index - 1].lat,
          routePoints[index - 1].lng,
          point.lat,
          point.lng
        );
      }
      return { ...point, distance: cumulativeDistance };
    });
  }

  for (const toll of nhaiData) {
    if (processedTolls.has(toll.name)) continue;

    const tollLat = parseFloat(toll.lat);
    const tollLng = parseFloat(toll.lng);

    if (isNaN(tollLat) || isNaN(tollLng)) {
      console.warn(`⚠️ Skipping toll ${toll.name} - invalid coordinates`);
      continue;
    }

    const validation = validateTollForRoute(tollLat, tollLng, orderedPoints, {
      maxPerpendicularDistanceKm: strictMode ? 0.025 : maxDistanceKm,
      maxParallelDistanceKm: 0.1,
    });

    if (
      validation.valid &&
      (validation.confidence === 'high' ||
        (includeMediumConfidence && validation.confidence === 'medium'))
    ) {
      // Find nearest segment index on the route
      let nearestSegmentIndex = 0;
      let minDist = Infinity;

      for (let i = 0; i < orderedPoints.length - 1; i++) {
        const dist = pointToLineSegmentDistance(
          tollLat,
          tollLng,
          orderedPoints[i].lat,
          orderedPoints[i].lng,
          orderedPoints[i + 1].lat,
          orderedPoints[i + 1].lng
        );

        if (dist < minDist) {
          minDist = dist;
          nearestSegmentIndex = i;
        }
      }

      nearbyTolls.push({
        name: toll.name,
        location: { lat: tollLat, lng: tollLng },
        rate: getTollRate(toll, vehicleType),
        projectType: toll.projectType || '', // adjust if you have this field or else ''
        confidence: validation.confidence,
        distance: validation.distance,
        verified: validation.confidence === 'high',
        routeDistance: orderedPoints[nearestSegmentIndex].distance || 0,
        perpendicular_distance: minDist * 1000, // meters
      });

      processedTolls.add(toll.name);

     
    }
  };
  return nearbyTolls;
}

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
      // console.log(`Removing toll that appears on all routes: ${routes[0].toll.name}`);
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
  console.log("nhaisize",nhaiData.length)
  console.log("tfwsize",tfw.length)
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
    
   // console.log(`Processing route from ${origin} to ${destination}`);
    
    // Get directions with maximum precision and detail
    const directionsURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&alternatives=true&mode=driving&key=${apiKey}&units=metric&avoid=ferries&traffic_model=best_guess&departure_time=now`;
    const googleRes = await axios.get(directionsURL);
    const routes = googleRes.data.routes;

    if (!routes || routes.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // console.log(`Found ${routes.length} alternative routes`);

    // Process up to 3 routes
    const limitedRoutes = routes.slice(0, 3);
    
    const routeResults = await Promise.all(limitedRoutes.map(async (route, routeIndex) => {
      console.log(`🛣️ Processing route ${routeIndex + 1}`);
      
      // Get all steps from all legs of the route
      const allSteps = route.legs.flatMap(leg => leg.steps);
      console.log(`📍 Route ${routeIndex + 1} has ${allSteps.length} steps`);
      
      // Combine all polylines from steps for more accuracy
      let routePoints = [];
      for (const step of allSteps) {
        const stepPoints = decodePolyline(step.polyline.points);
        if (routePoints.length > 0 && stepPoints.length > 0) {
          // Avoid duplicate points at step boundaries
          if (haversineDistance(
            routePoints[routePoints.length-1].lat, routePoints[routePoints.length-1].lng,
            stepPoints[0].lat, stepPoints[0].lng
          ) < 0.001) {
            stepPoints.shift();
          }
        }
        routePoints = routePoints.concat(stepPoints);
      }
      
      console.log(`📍 Route ${routeIndex + 1}: ${routePoints.length} points from steps`);
      
            // Find tolls with relaxed validation using the route points
      const verifiedTolls = findNearbyTolls(routePoints, nhaiData, vehicleType, {
        strictMode,
        includeMediumConfidence: true,
        maxDistanceKm: maxTollDistance
      });
     // console.log("vt",verifiedTolls)
      
      // Encode points back to polyline format that Google Maps expects
      const encodePolyline = (points) => {
        let result = '';
        let lat = 0, lng = 0;
        
        const encode = (current, previous) => {
          current = Math.round(current * 1e5);
          previous = Math.round(previous * 1e5);
          let coordinate = current - previous;
          coordinate <<= 1;
          if (current - previous < 0) {
            coordinate = ~coordinate;
          }
          let output = '';
          while (coordinate >= 0x20) {
            output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
            coordinate >>= 5;
          }
          output += String.fromCharCode(coordinate + 63);
          return output;
        };

        for (const point of points) {
          result += encode(point.lat, lat);
          result += encode(point.lng, lng);
          lat = point.lat;
          lng = point.lng;
        }
        return result;
      };

      // Create route details object for frontend with encoded polyline
      const routeDetails = {
        points: encodePolyline(routePoints),
        bounds: {
          north: Math.max(...routePoints.map(p => p.lat)),
          south: Math.min(...routePoints.map(p => p.lat)),
          east: Math.max(...routePoints.map(p => p.lng)),
          west: Math.min(...routePoints.map(p => p.lng))
        }
      };
      
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
        //console.log(edgeKey)
        
        if (tfw[edgeKey] !== undefined) {
          totalToll += parseFloat(tfw[edgeKey][vehicleType]) || 0;
          covered.add(tollA.name);
       //   console.log(`Using TFW edge for ${edgeKey}: ${tfw[edgeKey][vehicleType]}`);
          covered.add(tollB.name);
          continue;
        }
        
        if (!covered.has(tollA.name)) {
          totalToll += parseFloat(tollA.rate) || 0;
         // console.log(`Adding tollA: ${tollA.name} with rate ${tollA.rate}`);
          covered.add(tollA.name);
        }
      }
      
      const lastToll = tollsInOrder[tollsInOrder.length - 1];
      if (lastToll && !covered.has(lastToll.name)) {
        totalToll += parseFloat(lastToll.rate) || 0;
      }
    //  console.log("Tolls in order:", tollsInOrder);
      return {
        routeIndex,
        polyline: {
          points: routeDetails.points // This is now an encoded polyline string
        },
        legs: route.legs,
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        tolls: tollsInOrder,
        tollsVerified: verifiedTolls.filter(t => t.confidence === 'high'),
        tollsUnverified: verifiedTolls.filter(t => t.confidence === 'medium'),
        totalToll,
        summary: route.summary || `Route ${routeIndex + 1}`,
        bounds: routeDetails.bounds
      };
    }));

    // Apply cross-route filtering if enabled
    const finalRouteResults = filterUniqueRouteTolls(routeResults, { enableCrossRouteFiltering });
    
    // Recalculate toll costs after filtering - MAINTAIN ORIGINAL ORDER
    finalRouteResults.forEach(route => {
  let totalToll = 0;
  const covered = new Set();

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
      //console.log(`Using TFW edge for ${edgeKey}: ${tfw[edgeKey][vehicleType]}`);
      // Ensure both tolls are in the list (only if not already present)
      if (!tollsInOrder.find(t => t.name === tollA.name)) {
        tollsInOrder.push(tollA);
      }
      if (!tollsInOrder.find(t => t.name === tollB.name)) {
        tollsInOrder.push(tollB);
      }

      // Do NOT use continue here — allow fallback tollA addition if needed
    }

    // Fallback: Add tollA rate if not already covered
    if (!covered.has(tollA.name)) {
     // console.log(`Adding tollA: ${tollA.name} with rate ${tollA.rate}`);
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

    //console.log("nfdf",finalRouteResults);

    // Sort routes by total toll (ascending)
    finalRouteResults.sort((a, b) => a.totalToll - b.totalToll);
   // console.log("finalrds",finalRouteResults);

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