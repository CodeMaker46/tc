const axios = require('axios');
const turf = require('@turf/turf');

// Utility: Convert degrees to radians
const toDeg = rad => (rad * 180) / Math.PI;
// Convert degrees to radians
const toRad = deg => (deg * Math.PI) / 180;

// Haversine distance (in km)
const haversineDistance = (A, B) => {
  const R = 6371;
  const dLat = toRad(B.lat - A.lat);
  const dLng = toRad(B.lng - A.lng);
  const lat1 = toRad(A.lat);
  const lat2 = toRad(B.lat);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Perpendicular distance from point to segment (using spherical approximation)
const perpendicularDistance = (A, B, P) => {
  const R = 6371; // km
  const lat1 = toRad(A.lat), lon1 = toRad(A.lng);
  const lat2 = toRad(B.lat), lon2 = toRad(B.lng);
  const lat3 = toRad(P.lat), lon3 = toRad(P.lng);

  const d13 = R * Math.acos(
    Math.sin(lat1) * Math.sin(lat3) +
    Math.cos(lat1) * Math.cos(lat3) * Math.cos(lon3 - lon1)
  );

  const theta13 = Math.atan2(
    Math.sin(lon3 - lon1) * Math.cos(lat3),
    Math.cos(lat1) * Math.sin(lat3) -
    Math.sin(lat1) * Math.cos(lat3) * Math.cos(lon3 - lon1)
  );

  const theta12 = Math.atan2(
    Math.sin(lon2 - lon1) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
  );

  const angle = theta13 - theta12;
  return Math.abs(Math.asin(Math.sin(d13 / R) * Math.sin(angle)) * R);
};

// Final check if P is on segment AB
function isPointOnSegment(A, B, P, threshold) {
  const perpDist = perpendicularDistance(A, B, P);
  if (perpDist > threshold) return false;

  const distAB = haversineDistance(A, B);
  const distAP = haversineDistance(A, P);
  const distPB = haversineDistance(P, B);

  // Allow small margin of error due to floating-point ops
  return distAP + distPB <= distAB + 0.1;
}




// Compute a bounding box with a 1 km buffer on both sides of a segment
const getBoundingBoxWithBuffer = (pointA, pointB, bufferKm = 0.02) => {
  const R = 6371; // Earth radius in km
  const { lat: lat1, lng: lon1 } = pointA;
  const { lat: lat2, lng: lon2 } = pointB;

  const latMid = (lat1 + lat2) / 2;
  const lonMid = (lon1 + lon2) / 2;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = Math.atan2(y, x);

  const leftBearing = bearing - Math.PI / 2;
  const rightBearing = bearing + Math.PI / 2;

  const move = (lat, lon, bearing, distanceKm) => {
    const d = distanceKm / R;
    const latRad = toRad(lat);
    const lonRad = toRad(lon);

    const newLat = Math.asin(
      Math.sin(latRad) * Math.cos(d) +
      Math.cos(latRad) * Math.sin(d) * Math.cos(bearing)
    );
    const newLon = lonRad + Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
      Math.cos(d) - Math.sin(latRad) * Math.sin(newLat)
    );

    return { lat: toDeg(newLat), lng: toDeg(newLon) };
  };

  const leftPoint = move(latMid, lonMid, leftBearing, bufferKm);
  const rightPoint = move(latMid, lonMid, rightBearing, bufferKm);

  const lats = [lat1, lat2, leftPoint.lat, rightPoint.lat];
  const lngs = [lon1, lon2, leftPoint.lng, rightPoint.lng];

  return [Math.min(...lats), Math.min(...lngs), Math.max(...lats), Math.max(...lngs)];
};

const parseDuration = (durationStr) => {
  let totalHours = 0;
  const dayMatch = durationStr.match(/(\d+)\s*day/);
  const hourMatch = durationStr.match(/(\d+)\s*hour/);

  if (dayMatch) totalHours += parseInt(dayMatch[1], 10) * 24;
  if (hourMatch) totalHours += parseInt(hourMatch[1], 10);

  return totalHours;
};

// Check if a point is inside a bounding box
const isPointInBoundingBox = (lat, lon, bbox) => {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
};

const isTollInDirection = (pointA, pointB, tollPoint) => {
  const routeVec = {
    lat: pointB.lat - pointA.lat,
    lng: pointB.lng - pointA.lng
  };
  const tollVec = {
    lat: tollPoint.lat - pointA.lat,
    lng: tollPoint.lng - pointA.lng
  };
  // Dot product to check directionality
  const dot = routeVec.lat * tollVec.lat + routeVec.lng * tollVec.lng;
  return dot > 0; // true if toll is in the forward direction along the segment
};




// Find NHAI tolls within a bounding box
const findNHAITollsInBoundingBox = (bbox, nhaiData) => {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  return nhaiData.filter(toll => {
    const tollLat = parseFloat(toll.SnappedLatitude || toll.Latitude);
    const tollLon = parseFloat(toll.SnappedLongitude || toll.Longitude);
    return isPointInBoundingBox(tollLat, tollLon, bbox);
  });
};


// Calculate toll rates based on vehicle type
const getTollRate = (toll, vehicleType = 'Car') => {
  const rateKeyMap = {
    'Car': 'Car Rate Single',
    'Light Commercial Vehicle': 'Lcvrate Single',
    'Bus': 'Busrate Multi',
    'Multi-Axle Truck': 'Multiaxlerate Single',
    'Heavy Commercial Vehicle': 'Hcm Eme Single',
    '4 to 6 Axle Truck': 'Fourtosixexel Single',
    '7 or More Axle Truck': 'Sevenormoreexel Single',
  };


  const key = rateKeyMap[vehicleType] || 'Car Rate Single';

  // Return the parsed float value or 0 if missing
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

// Helper to interpolate points between two lat/lngs
function interpolatePoints(p1, p2, numPoints) {
  const points = [];
  for (let i = 1; i < numPoints; i++) {
    const lat = p1.lat + (p2.lat - p1.lat) * (i / numPoints);
    const lng = p1.lng + (p2.lng - p1.lng) * (i / numPoints);
    points.push({ lat, lng });
  }
  return points;
}

const getTollData = async (req, res, nhaiData, tfw) => {
  const { origin, destination, vehicleType = 'Car' } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' });
  }

  if (!nhaiData || nhaiData.length === 0) {
    return res.status(500).json({ error: 'NHAI toll data not loaded' });
  }

  try {
    // Step 1: Get route from Google Maps Directions API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey === undefined) {
      return res.status(500).json({ error: 'Google Maps API key is not set' });
    }
    const directionsURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&&alternatives=true&mode=driving&key=${apiKey}`;

    const googleRes = await axios.get(directionsURL);
    const routes = googleRes.data.routes;
    // console.log("routes ",routes)

    if (!routes || routes.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Process all alternative routes
<<<<<<< HEAD
    const routeResults = await Promise.all(routes.map(async (route, routeIndex) => {
      // --- Old logic: get tolls by bounding box + direction ---
=======

    const routeResults = routes.map((route, routeIndex) => {
      
>>>>>>> 9eb950d (changes)
      const steps = route.legs[0].steps;
      const geoPoints = steps.map(step => ({
        lat: step.start_location.lat,
        lng: step.start_location.lng,
      }));
<<<<<<< HEAD
=======

      console.log("geoPoints : ", geoPoints);


      // Add the final destination point
>>>>>>> 9eb950d (changes)
      if (steps.length > 0) {
        const lastStep = steps[steps.length - 1];
        geoPoints.push({
          lat: lastStep.end_location.lat,
          lng: lastStep.end_location.lng,
        });
      }
      let tollsOld = [];
      for (let i = 0; i < geoPoints.length - 1; i++) {
        const pointA = geoPoints[i];
        const pointB = geoPoints[i + 1];
<<<<<<< HEAD
        const bbox = getBoundingBoxWithBuffer(pointA, pointB, 0.5); // 0.5km buffer
        const tollsInBox = findNHAITollsInBoundingBox(bbox, nhaiData).filter(toll => {
          const tollPoint = { lat: parseFloat(toll.Latitude), lng: parseFloat(toll.Longitude) };
          return isTollInDirection(pointA, pointB, tollPoint);
        });
=======

        // Create a bounding box for this segment with a buffer (0.5 km)
        const bbox = getBoundingBoxWithBuffer(pointA, pointB, 0.5);

        const tollsInBox = findNHAITollsInBoundingBox(bbox, nhaiData);


        //  console.log(`Tolls found in box for segment ${i}:`, tollsInBox.length);

        // Add unique tolls to our verified list
>>>>>>> 9eb950d (changes)
        tollsInBox.forEach(toll => {
          if (!tollsOld.some(t => t.name === toll.Tollname)) {
            tollsOld.push({
              name: toll.Tollname,
              location: {
                lat: parseFloat(toll.Latitude),
                lng: parseFloat(toll.Longitude)
              },
              rate: getTollRate(toll, vehicleType),
              projectType: toll.Projecttype
            });
          }
        });
<<<<<<< HEAD
=======
        // console.log("Tolls on/near polyline:", tollsOnLineSegment);
>>>>>>> 9eb950d (changes)
      }
      // --- Snap the route ---
      const polylinePoints = route.overview_polyline.points;
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
      let decodedPath = decodePolyline(polylinePoints);
      // Interpolate more points for denser path
      let densePath = [];
      const INTERPOLATE_NUM = 5; // 4 extra points between each pair
      for (let i = 0; i < decodedPath.length - 1; i++) {
        densePath.push(decodedPath[i]);
        densePath.push(...interpolatePoints(decodedPath[i], decodedPath[i + 1], INTERPOLATE_NUM));
      }
      densePath.push(decodedPath[decodedPath.length - 1]);
      // Snap to Roads API (max 100 points per request, so chunk if needed)
      let snappedPoints = [];
      let snapToRoadError = null;
      const chunkSize = 100;
      for (let i = 0; i < densePath.length; i += chunkSize) {
        const chunk = densePath.slice(i, i + chunkSize);
        const chunkStr = chunk.map(p => `${p.lat},${p.lng}`).join('|');
        const snapUrl = `https://roads.googleapis.com/v1/snapToRoads?path=${chunkStr}&interpolate=true&key=${apiKey}`;
        try {
          const snapRes = await axios.get(snapUrl);
          if (snapRes.data.snappedPoints) {
            snappedPoints.push(...snapRes.data.snappedPoints.map(p => ({
              lat: p.location.latitude,
              lng: p.location.longitude
            })));
          }
        } catch (err) {
          snapToRoadError = err.response?.data || err.message;
          console.error('Snap to road failed:', snapToRoadError);
        }
      }
      // Remove duplicate snapped points
      const uniqueSnapped = snappedPoints.filter((pt, idx, arr) =>
        arr.findIndex(p => p.lat === pt.lat && p.lng === pt.lng) === idx
      );
      // --- Verify each toll ---
      tollsOld = tollsOld.map(toll => {
        // 1. Snap check (0.1km)
        const isVerifiedSnap = uniqueSnapped.some(pt => haversineDistance(pt.lat, pt.lng, toll.location.lat, toll.location.lng) < 0.1);
        // 2. Fallback: if within 0.2km of any original polyline point
        const isVerifiedFallback = decodedPath.some(pt => haversineDistance(pt.lat, pt.lng, toll.location.lat, toll.location.lng) < 0.2);
        return { ...toll, verified: isVerifiedSnap || isVerifiedFallback };
      });
      // Only keep verified tolls for price and map
      const verifiedTolls = tollsOld.filter(t => t.verified);
      const unverifiedTolls = tollsOld.filter(t => !t.verified);
      let totalToll = 0;
      const covered = new Set();
      // Helper to check if a toll is on the route
      const isTollOnRoute = (toll) => {
        // 1. Snap check (0.2km)
        const isSnap = uniqueSnapped.some(pt => haversineDistance(pt.lat, pt.lng, toll.location.lat, toll.location.lng) < 0.05);
        // 2. Fallback: if within 0.4km of any original polyline point
        //const isFallback = decodedPath.some(pt => haversineDistance(pt.lat, pt.lng, toll.location.lat, toll.location.lng) < 0.4);
        return isSnap ;//|| isFallback;
      };
      for (let i = 0; i < verifiedTolls.length - 1; i++) {
        const tollA = verifiedTolls[i];
        const tollB = verifiedTolls[i + 1];
        // Only use city pair if both tolls are on the route
        if (isTollOnRoute(tollA) && isTollOnRoute(tollB)) {
          const edgeKey = `${tollA.name}|${tollB.name}`;
          if (tfw[edgeKey] !== undefined) {
            totalToll += parseFloat(tfw[edgeKey][vehicleType]) || 0;
            covered.add(tollA.name);
            covered.add(tollB.name);
            continue;
          }
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
        tollsUnverified: unverifiedTolls,
        snapToRoadError,
        totalToll
      };
    }));

    // Sort routes by total toll (ascending)
    routeResults.sort((a, b) => a.totalToll - b.totalToll);

    return res.json({
      vehicleType,
      routes: routeResults,
      cheapestRoute: routeResults[0],
      fastestRoute: routeResults.reduce((fastest, route) => {
        const currentDuration = parseDuration(route.duration);
        const fastestDuration = parseDuration(fastest.duration);
        return currentDuration < fastestDuration ? route : fastest;
      }, routeResults[0])
    });

  } catch (error) {
    console.error('Toll calc error:', error.message);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { getTollData };
