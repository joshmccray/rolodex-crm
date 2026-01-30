import { GeocodingResult } from '../types/index.js';

// Uses Nominatim (OpenStreetMap) for geocoding - free but rate limited
// For production, consider using Google Maps Geocoding API
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${NOMINATIM_BASE_URL}/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RolodexCRM/1.0 (contact@example.com)', // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Convert miles to meters (for Spark API proximity queries)
export function milesToMeters(miles: number): number {
  return miles * 1609.344;
}
