// Places supporters can pin themselves to on the reach map. Counts are NOT stored
// here — they come from real "put yourself on the map" submissions (map_pins table).
// To offer another city, add a row; the key is "City|Country".
import { project } from './world-map'

export type Region =
  | 'North America'
  | 'Europe'
  | 'South America'
  | 'Oceania'
  | 'Africa'
  | 'Asia'

export type Place = {
  city: string
  country: string
  region: Region
  lat: number
  lon: number
}

export const REGIONS: Region[] = [
  'North America',
  'Europe',
  'Oceania',
  'South America',
  'Asia',
  'Africa',
]

export const PLACES: Place[] = [
  // NORTH AMERICA
  { city: 'New York', country: 'United States', region: 'North America', lat: 40.71, lon: -74.01 },
  { city: 'Los Angeles', country: 'United States', region: 'North America', lat: 34.05, lon: -118.24 },
  { city: 'San Francisco', country: 'United States', region: 'North America', lat: 37.77, lon: -122.42 },
  { city: 'Portland', country: 'United States', region: 'North America', lat: 45.52, lon: -122.68 },
  { city: 'Chicago', country: 'United States', region: 'North America', lat: 41.88, lon: -87.63 },
  { city: 'Seattle', country: 'United States', region: 'North America', lat: 47.61, lon: -122.33 },
  { city: 'Austin', country: 'United States', region: 'North America', lat: 30.27, lon: -97.74 },
  { city: 'Boston', country: 'United States', region: 'North America', lat: 42.36, lon: -71.06 },
  { city: 'Denver', country: 'United States', region: 'North America', lat: 39.74, lon: -104.99 },
  { city: 'Philadelphia', country: 'United States', region: 'North America', lat: 39.95, lon: -75.17 },
  { city: 'Minneapolis', country: 'United States', region: 'North America', lat: 44.98, lon: -93.27 },
  { city: 'Atlanta', country: 'United States', region: 'North America', lat: 33.75, lon: -84.39 },
  { city: 'Miami', country: 'United States', region: 'North America', lat: 25.76, lon: -80.19 },
  { city: 'Detroit', country: 'United States', region: 'North America', lat: 42.33, lon: -83.05 },
  { city: 'Phoenix', country: 'United States', region: 'North America', lat: 33.45, lon: -112.07 },
  { city: 'Asheville', country: 'United States', region: 'North America', lat: 35.6, lon: -82.55 },
  { city: 'New Orleans', country: 'United States', region: 'North America', lat: 29.95, lon: -90.07 },
  { city: 'Salt Lake City', country: 'United States', region: 'North America', lat: 40.76, lon: -111.89 },
  { city: 'Pittsburgh', country: 'United States', region: 'North America', lat: 40.44, lon: -79.996 },
  { city: 'Toronto', country: 'Canada', region: 'North America', lat: 43.65, lon: -79.38 },
  { city: 'Vancouver', country: 'Canada', region: 'North America', lat: 49.28, lon: -123.12 },
  { city: 'Montreal', country: 'Canada', region: 'North America', lat: 45.5, lon: -73.57 },
  { city: 'Mexico City', country: 'Mexico', region: 'North America', lat: 19.43, lon: -99.13 },
  { city: 'Guadalajara', country: 'Mexico', region: 'North America', lat: 20.67, lon: -103.35 },
  { city: 'Washington', country: 'United States', region: 'North America', lat: 38.91, lon: -77.04 },
  { city: 'Burlington', country: 'United States', region: 'North America', lat: 44.48, lon: -73.21 },
  { city: 'Madison', country: 'United States', region: 'North America', lat: 43.07, lon: -89.4 },
  { city: 'Ottawa', country: 'Canada', region: 'North America', lat: 45.42, lon: -75.7 },
  { city: 'Calgary', country: 'Canada', region: 'North America', lat: 51.05, lon: -114.07 },
  { city: 'Oaxaca', country: 'Mexico', region: 'North America', lat: 17.07, lon: -96.73 },
  { city: 'Houston', country: 'United States', region: 'North America', lat: 29.76, lon: -95.37 },
  { city: 'Dallas', country: 'United States', region: 'North America', lat: 32.78, lon: -96.8 },
  { city: 'San Antonio', country: 'United States', region: 'North America', lat: 29.42, lon: -98.49 },
  { city: 'San Diego', country: 'United States', region: 'North America', lat: 32.72, lon: -117.16 },
  { city: 'Sacramento', country: 'United States', region: 'North America', lat: 38.58, lon: -121.49 },
  { city: 'Las Vegas', country: 'United States', region: 'North America', lat: 36.17, lon: -115.14 },
  { city: 'Nashville', country: 'United States', region: 'North America', lat: 36.16, lon: -86.78 },
  { city: 'Charlotte', country: 'United States', region: 'North America', lat: 35.23, lon: -80.84 },
  { city: 'Raleigh', country: 'United States', region: 'North America', lat: 35.78, lon: -78.64 },
  { city: 'Columbus', country: 'United States', region: 'North America', lat: 39.96, lon: -83.0 },
  { city: 'Cleveland', country: 'United States', region: 'North America', lat: 41.5, lon: -81.69 },
  { city: 'Cincinnati', country: 'United States', region: 'North America', lat: 39.1, lon: -84.51 },
  { city: 'Indianapolis', country: 'United States', region: 'North America', lat: 39.77, lon: -86.16 },
  { city: 'Milwaukee', country: 'United States', region: 'North America', lat: 43.04, lon: -87.91 },
  { city: 'Kansas City', country: 'United States', region: 'North America', lat: 39.1, lon: -94.58 },
  { city: 'St. Louis', country: 'United States', region: 'North America', lat: 38.63, lon: -90.2 },
  { city: 'Orlando', country: 'United States', region: 'North America', lat: 28.54, lon: -81.38 },
  { city: 'Tampa', country: 'United States', region: 'North America', lat: 27.95, lon: -82.46 },
  { city: 'Baltimore', country: 'United States', region: 'North America', lat: 39.29, lon: -76.61 },
  { city: 'Richmond', country: 'United States', region: 'North America', lat: 37.54, lon: -77.44 },
  { city: 'Louisville', country: 'United States', region: 'North America', lat: 38.25, lon: -85.76 },
  { city: 'Oklahoma City', country: 'United States', region: 'North America', lat: 35.47, lon: -97.52 },
  { city: 'Omaha', country: 'United States', region: 'North America', lat: 41.26, lon: -95.93 },
  { city: 'Albuquerque', country: 'United States', region: 'North America', lat: 35.08, lon: -106.65 },
  { city: 'Tucson', country: 'United States', region: 'North America', lat: 32.22, lon: -110.97 },
  { city: 'Boise', country: 'United States', region: 'North America', lat: 43.62, lon: -116.2 },
  { city: 'Honolulu', country: 'United States', region: 'North America', lat: 21.31, lon: -157.86 },
  { city: 'Anchorage', country: 'United States', region: 'North America', lat: 61.22, lon: -149.9 },
  { city: 'Edmonton', country: 'Canada', region: 'North America', lat: 53.55, lon: -113.49 },
  { city: 'Winnipeg', country: 'Canada', region: 'North America', lat: 49.9, lon: -97.14 },
  { city: 'Halifax', country: 'Canada', region: 'North America', lat: 44.65, lon: -63.57 },
  { city: 'Monterrey', country: 'Mexico', region: 'North America', lat: 25.69, lon: -100.32 },

  // EUROPE
  { city: 'London', country: 'United Kingdom', region: 'Europe', lat: 51.51, lon: -0.13 },
  { city: 'Berlin', country: 'Germany', region: 'Europe', lat: 52.52, lon: 13.4 },
  { city: 'Paris', country: 'France', region: 'Europe', lat: 48.86, lon: 2.35 },
  { city: 'Amsterdam', country: 'Netherlands', region: 'Europe', lat: 52.37, lon: 4.9 },
  { city: 'Barcelona', country: 'Spain', region: 'Europe', lat: 41.39, lon: 2.17 },
  { city: 'Madrid', country: 'Spain', region: 'Europe', lat: 40.42, lon: -3.7 },
  { city: 'Manchester', country: 'United Kingdom', region: 'Europe', lat: 53.48, lon: -2.24 },
  { city: 'Copenhagen', country: 'Denmark', region: 'Europe', lat: 55.68, lon: 12.57 },
  { city: 'Stockholm', country: 'Sweden', region: 'Europe', lat: 59.33, lon: 18.07 },
  { city: 'Lisbon', country: 'Portugal', region: 'Europe', lat: 38.72, lon: -9.14 },
  { city: 'Dublin', country: 'Ireland', region: 'Europe', lat: 53.35, lon: -6.26 },
  { city: 'Bristol', country: 'United Kingdom', region: 'Europe', lat: 51.45, lon: -2.59 },
  { city: 'Oslo', country: 'Norway', region: 'Europe', lat: 59.91, lon: 10.75 },
  { city: 'Hamburg', country: 'Germany', region: 'Europe', lat: 53.55, lon: 9.99 },
  { city: 'Vienna', country: 'Austria', region: 'Europe', lat: 48.21, lon: 16.37 },
  { city: 'Glasgow', country: 'United Kingdom', region: 'Europe', lat: 55.86, lon: -4.25 },
  { city: 'Helsinki', country: 'Finland', region: 'Europe', lat: 60.17, lon: 24.94 },
  { city: 'Leipzig', country: 'Germany', region: 'Europe', lat: 51.34, lon: 12.37 },
  { city: 'Zurich', country: 'Switzerland', region: 'Europe', lat: 47.38, lon: 8.54 },
  { city: 'Milan', country: 'Italy', region: 'Europe', lat: 45.46, lon: 9.19 },
  { city: 'Rome', country: 'Italy', region: 'Europe', lat: 41.9, lon: 12.5 },
  { city: 'Prague', country: 'Czechia', region: 'Europe', lat: 50.08, lon: 14.44 },
  { city: 'Warsaw', country: 'Poland', region: 'Europe', lat: 52.23, lon: 21.01 },
  { city: 'Gothenburg', country: 'Sweden', region: 'Europe', lat: 57.71, lon: 11.97 },
  { city: 'Budapest', country: 'Hungary', region: 'Europe', lat: 47.5, lon: 19.04 },
  { city: 'Athens', country: 'Greece', region: 'Europe', lat: 37.98, lon: 23.73 },
  { city: 'Brussels', country: 'Belgium', region: 'Europe', lat: 50.85, lon: 4.35 },
  { city: 'Valencia', country: 'Spain', region: 'Europe', lat: 39.47, lon: -0.38 },
  { city: 'Edinburgh', country: 'United Kingdom', region: 'Europe', lat: 55.95, lon: -3.19 },
  { city: 'Munich', country: 'Germany', region: 'Europe', lat: 48.14, lon: 11.58 },
  { city: 'Lyon', country: 'France', region: 'Europe', lat: 45.76, lon: 4.84 },
  { city: 'Birmingham', country: 'United Kingdom', region: 'Europe', lat: 52.49, lon: -1.89 },
  { city: 'Leeds', country: 'United Kingdom', region: 'Europe', lat: 53.8, lon: -1.55 },
  { city: 'Liverpool', country: 'United Kingdom', region: 'Europe', lat: 53.41, lon: -2.98 },
  { city: 'Cardiff', country: 'United Kingdom', region: 'Europe', lat: 51.48, lon: -3.18 },
  { city: 'Belfast', country: 'United Kingdom', region: 'Europe', lat: 54.6, lon: -5.93 },
  { city: 'Cork', country: 'Ireland', region: 'Europe', lat: 51.9, lon: -8.47 },
  { city: 'Cologne', country: 'Germany', region: 'Europe', lat: 50.94, lon: 6.96 },
  { city: 'Frankfurt', country: 'Germany', region: 'Europe', lat: 50.11, lon: 8.68 },
  { city: 'Marseille', country: 'France', region: 'Europe', lat: 43.3, lon: 5.37 },
  { city: 'Naples', country: 'Italy', region: 'Europe', lat: 40.85, lon: 14.27 },

  // OCEANIA
  { city: 'Melbourne', country: 'Australia', region: 'Oceania', lat: -37.81, lon: 144.96 },
  { city: 'Sydney', country: 'Australia', region: 'Oceania', lat: -33.87, lon: 151.21 },
  { city: 'Auckland', country: 'New Zealand', region: 'Oceania', lat: -36.85, lon: 174.76 },
  { city: 'Brisbane', country: 'Australia', region: 'Oceania', lat: -27.47, lon: 153.03 },
  { city: 'Wellington', country: 'New Zealand', region: 'Oceania', lat: -41.29, lon: 174.78 },
  { city: 'Perth', country: 'Australia', region: 'Oceania', lat: -31.95, lon: 115.86 },
  { city: 'Adelaide', country: 'Australia', region: 'Oceania', lat: -34.93, lon: 138.6 },
  { city: 'Hobart', country: 'Australia', region: 'Oceania', lat: -42.88, lon: 147.33 },
  { city: 'Christchurch', country: 'New Zealand', region: 'Oceania', lat: -43.53, lon: 172.64 },

  // SOUTH AMERICA
  { city: 'Buenos Aires', country: 'Argentina', region: 'South America', lat: -34.6, lon: -58.38 },
  { city: 'São Paulo', country: 'Brazil', region: 'South America', lat: -23.55, lon: -46.63 },
  { city: 'Bogotá', country: 'Colombia', region: 'South America', lat: 4.71, lon: -74.07 },
  { city: 'Santiago', country: 'Chile', region: 'South America', lat: -33.45, lon: -70.67 },
  { city: 'Quito', country: 'Ecuador', region: 'South America', lat: -0.18, lon: -78.47 },
  { city: 'Lima', country: 'Peru', region: 'South America', lat: -12.05, lon: -77.04 },
  { city: 'Montevideo', country: 'Uruguay', region: 'South America', lat: -34.9, lon: -56.16 },
  { city: 'Rio de Janeiro', country: 'Brazil', region: 'South America', lat: -22.91, lon: -43.17 },
  { city: 'Brasília', country: 'Brazil', region: 'South America', lat: -15.79, lon: -47.88 },

  // ASIA
  { city: 'Tokyo', country: 'Japan', region: 'Asia', lat: 35.68, lon: 139.69 },
  { city: 'Bengaluru', country: 'India', region: 'Asia', lat: 12.97, lon: 77.59 },
  { city: 'Seoul', country: 'South Korea', region: 'Asia', lat: 37.57, lon: 126.98 },
  { city: 'Manila', country: 'Philippines', region: 'Asia', lat: 14.6, lon: 120.98 },
  { city: 'Jakarta', country: 'Indonesia', region: 'Asia', lat: -6.21, lon: 106.85 },
  { city: 'Tel Aviv', country: 'Israel', region: 'Asia', lat: 32.08, lon: 34.78 },
  { city: 'Hong Kong', country: 'Hong Kong', region: 'Asia', lat: 22.32, lon: 114.17 },
  { city: 'Bangkok', country: 'Thailand', region: 'Asia', lat: 13.76, lon: 100.5 },
  { city: 'Taipei', country: 'Taiwan', region: 'Asia', lat: 25.03, lon: 121.57 },
  { city: 'Mumbai', country: 'India', region: 'Asia', lat: 19.08, lon: 72.88 },
  { city: 'Singapore', country: 'Singapore', region: 'Asia', lat: 1.35, lon: 103.82 },
  { city: 'Delhi', country: 'India', region: 'Asia', lat: 28.61, lon: 77.21 },

  // AFRICA
  { city: 'Cape Town', country: 'South Africa', region: 'Africa', lat: -33.92, lon: 18.42 },
  { city: 'Nairobi', country: 'Kenya', region: 'Africa', lat: -1.29, lon: 36.82 },
  { city: 'Lagos', country: 'Nigeria', region: 'Africa', lat: 6.52, lon: 3.38 },
  { city: 'Accra', country: 'Ghana', region: 'Africa', lat: 5.6, lon: -0.19 },
  { city: 'Johannesburg', country: 'South Africa', region: 'Africa', lat: -26.2, lon: 28.05 },
  { city: 'Kampala', country: 'Uganda', region: 'Africa', lat: 0.35, lon: 32.58 },
  { city: 'Durban', country: 'South Africa', region: 'Africa', lat: -29.86, lon: 31.02 },
  { city: 'Cairo', country: 'Egypt', region: 'Africa', lat: 30.04, lon: 31.24 },
  { city: 'Casablanca', country: 'Morocco', region: 'Africa', lat: 33.57, lon: -7.59 },
]

export const placeKey = (p: Place) => `${p.city}|${p.country}`

export const PLACE_BY_KEY: Map<string, Place> = new Map(PLACES.map(p => [placeKey(p), p]))

/** A place with at least one supporter pinned to it. */
export type PinnedPlace = Place & { key: string; count: number }

export type RegionStat = { region: Region; count: number; share: number }

/** One dot on the map — a single supporter, scattered around their city. */
export type MapDot = { x: number; y: number; place: PinnedPlace; delay: number }

// Deterministic PRNG so the server-rendered scatter matches the client and the
// map never reshuffles between visits.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Vogel spiral placement keeps clusters evenly packed instead of clumping in
// the middle; the jitter stops them from reading as a perfect flower.
function scatter(place: PinnedPlace, rand: () => number): MapDot[] {
  const [cx, cy] = project(place.lon, place.lat)
  const radius = 1.6 + Math.sqrt(place.count) * 2.1
  return Array.from({ length: place.count }, (_, i) => {
    const r = radius * Math.sqrt((i + 0.4) / place.count)
    const theta = i * 2.399963 + rand() * 0.9
    return {
      x: cx + Math.cos(theta) * r + (rand() - 0.5) * 1.2,
      y: cy + Math.sin(theta) * r * 0.85 + (rand() - 0.5) * 1.2,
      place,
      delay: rand() * 3,
    }
  })
}

/** Turn raw pin counts (by place key) into everything the reach map shows. */
export function buildMap(counts: Record<string, number>) {
  const pinned: PinnedPlace[] = []
  for (const [key, count] of Object.entries(counts)) {
    const place = PLACE_BY_KEY.get(key)
    if (place && count > 0) pinned.push({ ...place, key, count })
  }
  pinned.sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))

  const total = pinned.reduce((sum, p) => sum + p.count, 0)
  const countries = new Set(pinned.map(p => p.country)).size
  const regions: RegionStat[] = REGIONS.map(region => {
    const count = pinned.filter(p => p.region === region).reduce((sum, p) => sum + p.count, 0)
    return { region, count, share: total ? Math.round((count / total) * 100) : 0 }
  })

  const rand = mulberry32(20260809)
  // Cap the dots drawn per city so a huge cluster can't swamp the SVG.
  const dots = pinned.flatMap(p => scatter({ ...p, count: Math.min(p.count, 400) }, rand).map(d => ({ ...d, place: p })))

  return { pinned, total, countries, cities: pinned.length, regions, dots }
}
