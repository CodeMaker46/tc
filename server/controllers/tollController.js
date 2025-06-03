const axios = require('axios');


// Utility: Convert degrees to radians
const toRad = deg => (deg * Math.PI) / 180;
const toDeg = rad => (rad * 180) / Math.PI;

// Compute a bounding box with a 1 km buffer on both sides of a segment
const getBoundingBoxWithBuffer = (pointA, pointB, bufferKm = 1) => {
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

// Find NHAI tolls within a bounding box
const findNHAITollsInBoundingBox = (bbox, nhaiData) => {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  return nhaiData.filter(toll => {
    const tollLat = parseFloat(toll.Latitude);
    const tollLon = parseFloat(toll.Longitude);
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

    // console.log("Routes : ", routes);

    if (!routes || routes.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Process all alternative routes

    const routeResults = routes.map((route, routeIndex) => {
      // Extract path as geoPoints
      const steps = route.legs[0].steps;
      const geoPoints = steps.map(step => ({
        lat: step.start_location.lat,
        lng: step.start_location.lng,
      }));


      // Add the final destination point
      if (steps.length > 0) {
        const lastStep = steps[steps.length - 1];
        geoPoints.push({
          lat: lastStep.end_location.lat,
          lng: lastStep.end_location.lng,
        });
      }


      const tollsVerified = [];

      // Step 2: For each segment between two points, check for tolls
      for (let i = 0; i < geoPoints.length - 1; i++) {
        const pointA = geoPoints[i];
        const pointB = geoPoints[i + 1];

        // Create a bounding box for this segment with a buffer
        const bbox = getBoundingBoxWithBuffer(pointA, pointB, 5); // 1km buffer

        // Find NHAI tolls within this bounding box
        const tollsInBox = findNHAITollsInBoundingBox(bbox, nhaiData);
        //  console.log(`Tolls found in box for segment ${i}:`, tollsInBox.length);

        // Add unique tolls to our verified list
        tollsInBox.forEach(toll => {
          // Check if this toll is already in our list
          if (!tollsVerified.some(t => t.name === toll.Tollname)) {
            tollsVerified.push({
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
        // console.log("Tolls Verified: ", tollsVerified);
      }

let totalToll = 0;
const covered = new Set(); 


for (let i = 0; i < tollsVerified.length - 1; i++) {
  const tollA = tollsVerified[i];
  const tollB = tollsVerified[i + 1];
  const edgeKey = `${tollA.name}|${tollB.name}`;

  if (tfw[edgeKey] !== undefined) {
    // console.log("price", tfw[edgeKey][vehicleType]);
    totalToll += parseFloat(tfw[edgeKey][vehicleType]) || 0;
    covered.add(tollA.name);
    // console.log(`Using TFW pair: ${tollA.name} - ${tollB.name} with rate ${parseFloat(tfw[edgeKey][vehicleType])}`);
    covered.add(tollB.name);
  //  f[edgeKey] = true;
  } else if(!covered.has(tollA.name)) {
    // console.log(`Using single toll: ${tollA.name} with rate ${parseFloat(tollA.rate)}`);
    totalToll += parseFloat(tollA.rate) || 0;
    covered.add(tollA.name);
  }
}


const lastToll = tollsVerified[tollsVerified.length - 1];
if (!covered.has(lastToll.name)) {
  totalToll += parseFloat(lastToll.rate) || 0;
}

     // const totalToll = tollsVerified.reduce((sum, toll) => sum + toll.rate, 0);

      return {
        routeIndex,
        
        polyline: route.overview_polyline,
        legs: route.legs,
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        tolls: tollsVerified,
        totalToll
      };
    });
    

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
