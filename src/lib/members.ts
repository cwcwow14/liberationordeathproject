// Illustrative distribution of the LOD membership across the world.
// Counts are representative figures for the reach map, not live account data.
import { project } from './world-map'

export type Region =
  | 'North America'
  | 'Europe'
  | 'South America'
  | 'Oceania'
  | 'Africa'
  | 'Asia'

export type MemberCity = {
  city: string
  country: string
  region: Region
  lat: number
  lon: number
  members: number
}

export const REGIONS: Region[] = [
  'North America',
  'Europe',
  'Oceania',
  'South America',
  'Asia',
  'Africa',
]

export const CITIES: MemberCity[] = [
  // NORTH AMERICA — 216
  { city: 'New York', country: 'United States', region: 'North America', lat: 40.71, lon: -74.01, members: 22 },
  { city: 'Los Angeles', country: 'United States', region: 'North America', lat: 34.05, lon: -118.24, members: 17 },
  { city: 'San Francisco', country: 'United States', region: 'North America', lat: 37.77, lon: -122.42, members: 14 },
  { city: 'Portland', country: 'United States', region: 'North America', lat: 45.52, lon: -122.68, members: 12 },
  { city: 'Chicago', country: 'United States', region: 'North America', lat: 41.88, lon: -87.63, members: 11 },
  { city: 'Seattle', country: 'United States', region: 'North America', lat: 47.61, lon: -122.33, members: 11 },
  { city: 'Austin', country: 'United States', region: 'North America', lat: 30.27, lon: -97.74, members: 10 },
  { city: 'Boston', country: 'United States', region: 'North America', lat: 42.36, lon: -71.06, members: 9 },
  { city: 'Denver', country: 'United States', region: 'North America', lat: 39.74, lon: -104.99, members: 8 },
  { city: 'Philadelphia', country: 'United States', region: 'North America', lat: 39.95, lon: -75.17, members: 7 },
  { city: 'Minneapolis', country: 'United States', region: 'North America', lat: 44.98, lon: -93.27, members: 6 },
  { city: 'Atlanta', country: 'United States', region: 'North America', lat: 33.75, lon: -84.39, members: 6 },
  { city: 'Miami', country: 'United States', region: 'North America', lat: 25.76, lon: -80.19, members: 6 },
  { city: 'Detroit', country: 'United States', region: 'North America', lat: 42.33, lon: -83.05, members: 4 },
  { city: 'Phoenix', country: 'United States', region: 'North America', lat: 33.45, lon: -112.07, members: 4 },
  { city: 'Asheville', country: 'United States', region: 'North America', lat: 35.6, lon: -82.55, members: 4 },
  { city: 'New Orleans', country: 'United States', region: 'North America', lat: 29.95, lon: -90.07, members: 3 },
  { city: 'Salt Lake City', country: 'United States', region: 'North America', lat: 40.76, lon: -111.89, members: 3 },
  { city: 'Pittsburgh', country: 'United States', region: 'North America', lat: 40.44, lon: -79.996, members: 3 },
  { city: 'Toronto', country: 'Canada', region: 'North America', lat: 43.65, lon: -79.38, members: 11 },
  { city: 'Vancouver', country: 'Canada', region: 'North America', lat: 49.28, lon: -123.12, members: 9 },
  { city: 'Montreal', country: 'Canada', region: 'North America', lat: 45.5, lon: -73.57, members: 7 },
  { city: 'Mexico City', country: 'Mexico', region: 'North America', lat: 19.43, lon: -99.13, members: 10 },
  { city: 'Guadalajara', country: 'Mexico', region: 'North America', lat: 20.67, lon: -103.35, members: 2 },
  { city: 'Washington', country: 'United States', region: 'North America', lat: 38.91, lon: -77.04, members: 5 },
  { city: 'Burlington', country: 'United States', region: 'North America', lat: 44.48, lon: -73.21, members: 3 },
  { city: 'Madison', country: 'United States', region: 'North America', lat: 43.07, lon: -89.4, members: 2 },
  { city: 'Ottawa', country: 'Canada', region: 'North America', lat: 45.42, lon: -75.7, members: 3 },
  { city: 'Calgary', country: 'Canada', region: 'North America', lat: 51.05, lon: -114.07, members: 2 },
  { city: 'Oaxaca', country: 'Mexico', region: 'North America', lat: 17.07, lon: -96.73, members: 2 },

  // EUROPE — 204
  { city: 'London', country: 'United Kingdom', region: 'Europe', lat: 51.51, lon: -0.13, members: 26 },
  { city: 'Berlin', country: 'Germany', region: 'Europe', lat: 52.52, lon: 13.4, members: 23 },
  { city: 'Paris', country: 'France', region: 'Europe', lat: 48.86, lon: 2.35, members: 15 },
  { city: 'Amsterdam', country: 'Netherlands', region: 'Europe', lat: 52.37, lon: 4.9, members: 13 },
  { city: 'Barcelona', country: 'Spain', region: 'Europe', lat: 41.39, lon: 2.17, members: 12 },
  { city: 'Madrid', country: 'Spain', region: 'Europe', lat: 40.42, lon: -3.7, members: 8 },
  { city: 'Manchester', country: 'United Kingdom', region: 'Europe', lat: 53.48, lon: -2.24, members: 7 },
  { city: 'Copenhagen', country: 'Denmark', region: 'Europe', lat: 55.68, lon: 12.57, members: 7 },
  { city: 'Stockholm', country: 'Sweden', region: 'Europe', lat: 59.33, lon: 18.07, members: 7 },
  { city: 'Lisbon', country: 'Portugal', region: 'Europe', lat: 38.72, lon: -9.14, members: 6 },
  { city: 'Dublin', country: 'Ireland', region: 'Europe', lat: 53.35, lon: -6.26, members: 6 },
  { city: 'Bristol', country: 'United Kingdom', region: 'Europe', lat: 51.45, lon: -2.59, members: 6 },
  { city: 'Oslo', country: 'Norway', region: 'Europe', lat: 59.91, lon: 10.75, members: 6 },
  { city: 'Hamburg', country: 'Germany', region: 'Europe', lat: 53.55, lon: 9.99, members: 6 },
  { city: 'Vienna', country: 'Austria', region: 'Europe', lat: 48.21, lon: 16.37, members: 5 },
  { city: 'Glasgow', country: 'United Kingdom', region: 'Europe', lat: 55.86, lon: -4.25, members: 4 },
  { city: 'Helsinki', country: 'Finland', region: 'Europe', lat: 60.17, lon: 24.94, members: 4 },
  { city: 'Leipzig', country: 'Germany', region: 'Europe', lat: 51.34, lon: 12.37, members: 4 },
  { city: 'Zurich', country: 'Switzerland', region: 'Europe', lat: 47.38, lon: 8.54, members: 4 },
  { city: 'Milan', country: 'Italy', region: 'Europe', lat: 45.46, lon: 9.19, members: 4 },
  { city: 'Rome', country: 'Italy', region: 'Europe', lat: 41.9, lon: 12.5, members: 4 },
  { city: 'Prague', country: 'Czechia', region: 'Europe', lat: 50.08, lon: 14.44, members: 4 },
  { city: 'Warsaw', country: 'Poland', region: 'Europe', lat: 52.23, lon: 21.01, members: 4 },
  { city: 'Gothenburg', country: 'Sweden', region: 'Europe', lat: 57.71, lon: 11.97, members: 3 },
  { city: 'Budapest', country: 'Hungary', region: 'Europe', lat: 47.5, lon: 19.04, members: 2 },
  { city: 'Athens', country: 'Greece', region: 'Europe', lat: 37.98, lon: 23.73, members: 2 },
  { city: 'Brussels', country: 'Belgium', region: 'Europe', lat: 50.85, lon: 4.35, members: 2 },
  { city: 'Valencia', country: 'Spain', region: 'Europe', lat: 39.47, lon: -0.38, members: 2 },
  { city: 'Edinburgh', country: 'United Kingdom', region: 'Europe', lat: 55.95, lon: -3.19, members: 3 },
  { city: 'Munich', country: 'Germany', region: 'Europe', lat: 48.14, lon: 11.58, members: 3 },
  { city: 'Lyon', country: 'France', region: 'Europe', lat: 45.76, lon: 4.84, members: 2 },

  // OCEANIA — 40
  { city: 'Melbourne', country: 'Australia', region: 'Oceania', lat: -37.81, lon: 144.96, members: 11 },
  { city: 'Sydney', country: 'Australia', region: 'Oceania', lat: -33.87, lon: 151.21, members: 10 },
  { city: 'Auckland', country: 'New Zealand', region: 'Oceania', lat: -36.85, lon: 174.76, members: 7 },
  { city: 'Brisbane', country: 'Australia', region: 'Oceania', lat: -27.47, lon: 153.03, members: 4 },
  { city: 'Wellington', country: 'New Zealand', region: 'Oceania', lat: -41.29, lon: 174.78, members: 3 },
  { city: 'Perth', country: 'Australia', region: 'Oceania', lat: -31.95, lon: 115.86, members: 2 },
  { city: 'Adelaide', country: 'Australia', region: 'Oceania', lat: -34.93, lon: 138.6, members: 2 },
  { city: 'Hobart', country: 'Australia', region: 'Oceania', lat: -42.88, lon: 147.33, members: 1 },

  // SOUTH AMERICA — 28
  { city: 'Buenos Aires', country: 'Argentina', region: 'South America', lat: -34.6, lon: -58.38, members: 7 },
  { city: 'São Paulo', country: 'Brazil', region: 'South America', lat: -23.55, lon: -46.63, members: 7 },
  { city: 'Bogotá', country: 'Colombia', region: 'South America', lat: 4.71, lon: -74.07, members: 5 },
  { city: 'Santiago', country: 'Chile', region: 'South America', lat: -33.45, lon: -70.67, members: 3 },
  { city: 'Quito', country: 'Ecuador', region: 'South America', lat: -0.18, lon: -78.47, members: 2 },
  { city: 'Lima', country: 'Peru', region: 'South America', lat: -12.05, lon: -77.04, members: 2 },
  { city: 'Montevideo', country: 'Uruguay', region: 'South America', lat: -34.9, lon: -56.16, members: 1 },
  { city: 'Rio de Janeiro', country: 'Brazil', region: 'South America', lat: -22.91, lon: -43.17, members: 1 },

  // ASIA — 25
  { city: 'Tokyo', country: 'Japan', region: 'Asia', lat: 35.68, lon: 139.69, members: 5 },
  { city: 'Bengaluru', country: 'India', region: 'Asia', lat: 12.97, lon: 77.59, members: 4 },
  { city: 'Seoul', country: 'South Korea', region: 'Asia', lat: 37.57, lon: 126.98, members: 3 },
  { city: 'Manila', country: 'Philippines', region: 'Asia', lat: 14.6, lon: 120.98, members: 3 },
  { city: 'Jakarta', country: 'Indonesia', region: 'Asia', lat: -6.21, lon: 106.85, members: 2 },
  { city: 'Tel Aviv', country: 'Israel', region: 'Asia', lat: 32.08, lon: 34.78, members: 1 },
  { city: 'Hong Kong', country: 'Hong Kong', region: 'Asia', lat: 22.32, lon: 114.17, members: 2 },
  { city: 'Bangkok', country: 'Thailand', region: 'Asia', lat: 13.76, lon: 100.5, members: 2 },
  { city: 'Taipei', country: 'Taiwan', region: 'Asia', lat: 25.03, lon: 121.57, members: 2 },
  { city: 'Mumbai', country: 'India', region: 'Asia', lat: 19.08, lon: 72.88, members: 1 },

  // AFRICA — 17
  { city: 'Cape Town', country: 'South Africa', region: 'Africa', lat: -33.92, lon: 18.42, members: 6 },
  { city: 'Nairobi', country: 'Kenya', region: 'Africa', lat: -1.29, lon: 36.82, members: 5 },
  { city: 'Lagos', country: 'Nigeria', region: 'Africa', lat: 6.52, lon: 3.38, members: 2 },
  { city: 'Accra', country: 'Ghana', region: 'Africa', lat: 5.6, lon: -0.19, members: 1 },
  { city: 'Johannesburg', country: 'South Africa', region: 'Africa', lat: -26.2, lon: 28.05, members: 2 },
  { city: 'Kampala', country: 'Uganda', region: 'Africa', lat: 0.35, lon: 32.58, members: 1 },
]

export const TOTAL_MEMBERS = CITIES.reduce((sum, c) => sum + c.members, 0)
export const TOTAL_COUNTRIES = new Set(CITIES.map(c => c.country)).size
export const TOTAL_CITIES = CITIES.length

export type RegionStat = { region: Region; members: number; cities: number; share: number }

export const REGION_STATS: RegionStat[] = REGIONS.map(region => {
  const cities = CITIES.filter(c => c.region === region)
  const members = cities.reduce((sum, c) => sum + c.members, 0)
  return {
    region,
    members,
    cities: cities.length,
    share: Math.round((members / TOTAL_MEMBERS) * 100),
  }
})

/** One red dot on the map — a single member, scattered around their city. */
export type MemberDot = { x: number; y: number; city: MemberCity; delay: number }

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
function scatter(city: MemberCity, rand: () => number): MemberDot[] {
  const [cx, cy] = project(city.lon, city.lat)
  const radius = 1.6 + Math.sqrt(city.members) * 2.1
  return Array.from({ length: city.members }, (_, i) => {
    const r = radius * Math.sqrt((i + 0.4) / city.members)
    const theta = i * 2.399963 + rand() * 0.9
    return {
      x: cx + Math.cos(theta) * r + (rand() - 0.5) * 1.2,
      y: cy + Math.sin(theta) * r * 0.85 + (rand() - 0.5) * 1.2,
      city,
      delay: rand() * 3,
    }
  })
}

export const MEMBER_DOTS: MemberDot[] = (() => {
  const rand = mulberry32(20260809)
  return CITIES.flatMap(city => scatter(city, rand))
})()
