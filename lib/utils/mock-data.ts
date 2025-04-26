import type { EnhancedEarthquakeData } from "../types"
import {
  calculateEnergyRelease,
  estimateTsunamiRisk,
  isCoastalLocation,
  extractRegion,
  generateEarthquakeId,
} from "./earthquake-utils"

/**
 * Generates mock earthquake data when APIs fail
 * @returns Array of mock earthquake data
 */
export function generateMockEarthquakeData(): EnhancedEarthquakeData[] {
  const now = new Date()
  const mockData: EnhancedEarthquakeData[] = []

  // Generate 10 mock earthquakes
  for (let i = 0; i < 10; i++) {
    // Random time within the last 7 days
    const time = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)

    // Random magnitude between 2.0 and 6.0
    const magnitude = 2.0 + Math.random() * 4.0

    // Random depth between 5 and 50 km
    const depth = 5 + Math.random() * 45

    // Random location in Turkey
    const locations = [
      "Marmara Region, Turkey",
      "Aegean Region, Turkey",
      "Central Anatolia, Turkey",
      "Eastern Anatolia, Turkey",
      "Black Sea Region, Turkey",
      "Mediterranean Region, Turkey",
      "Southeastern Anatolia, Turkey",
    ]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const region = extractRegion(location)
    const coastal = isCoastalLocation(location)

    // Random coordinates in Turkey
    const latitude = 36 + Math.random() * 6
    const longitude = 26 + Math.random() * 19

    mockData.push({
      id: generateEarthquakeId("mock", `${i}-${Date.now()}`),
      time: time.toISOString(),
      magnitude: magnitude,
      magnitudeType: "ML",
      depth: depth,
      latitude: latitude,
      longitude: longitude,
      location: location,
      region: region,
      source: "Mock Data (API Fallback)",
      energyRelease: calculateEnergyRelease(magnitude),
      tsunamiRisk: estimateTsunamiRisk(magnitude, depth, coastal),
      pWaveVelocity: 6.0 + Math.random() * 0.5,
      sWaveVelocity: 3.5 + Math.random() * 0.3,
      intensity: Math.min(12, Math.round(1.5 * magnitude)),
      faultMechanism: ["Strike-slip", "Normal", "Reverse", "Oblique"][Math.floor(Math.random() * 4)],
      aftershockProbability: magnitude > 5 ? 0.8 : magnitude > 4 ? 0.5 : 0.2,
      stressDropEstimate: 1 + Math.random() * 9,
      ruptureLength: magnitude < 5 ? 0 : (magnitude - 4) * 3 + Math.random() * 5,
      historicalContext: "Mock data for testing purposes",
    })
  }

  return mockData
}
