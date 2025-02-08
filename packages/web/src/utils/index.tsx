type LatLng = {
  lat: number;
  lng: number;
}

export function haversineDistance(mk1: LatLng, mk2: LatLng) {
  const R = 6371.0710; // Radius of the Earth in kilometers
  const radiansLat1 = mk1.lat * (Math.PI / 180); // Convert degrees to radians
  const radiansLat2 = mk2.lat * (Math.PI / 180); // Convert degrees to radians
  const diffLat = radiansLat2 - radiansLat1; // Radian difference (latitudes)
  const diffLng = (mk2.lng - mk1.lng) * (Math.PI / 180); // Radian difference (longitudes)

  const distanceInKM = 2 * R * Math.asin(Math.sqrt(Math.sin(diffLat / 2) * Math.sin(diffLat / 2) + Math.cos(radiansLat1) * Math.cos(radiansLat2) * Math.sin(diffLng / 2) * Math.sin(diffLng / 2)));
  return distanceInKM * 1000; // meters
}