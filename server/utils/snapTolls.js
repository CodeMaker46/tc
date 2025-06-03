const axios = require('axios');

const snapToRoad = async (lat, lng, apiKey) => {
  try {
    const url = `https://roads.googleapis.com/v1/snapToRoads?path=${lat},${lng}&key=${apiKey}`;
    const res = await axios.get(url);
    if (res.data.snappedPoints && res.data.snappedPoints.length > 0) {
      return {
        lat: res.data.snappedPoints[0].location.latitude,
        lng: res.data.snappedPoints[0].location.longitude,
      };
    }
    return { lat, lng };
  } catch (err) {
    console.error("Snap to road failed:", err.message);
    return { lat, lng };
  }
};


const snapAllTollsToRoads = async (nhaiData, apiKey) => {
  return Promise.all(nhaiData.map(async (toll) => {
    const snapped = await snapToRoad(parseFloat(toll.Latitude), parseFloat(toll.Longitude), apiKey);
    return {
      ...toll,
      SnappedLatitude: snapped.lat,
      SnappedLongitude: snapped.lng,
    };
  }));
};

module.exports = { snapAllTollsToRoads };
