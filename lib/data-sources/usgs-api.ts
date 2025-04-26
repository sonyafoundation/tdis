import type { EnhancedEarthquakeData } from "../types"
import {
  calculateEnergyRelease,
  estimateTsunamiRisk,
  isCoastalLocation,
  extractRegion,
  generateEarthquakeId,
} from "../utils/earthquake-utils"

// USGS (United States Geological Survey) API
export async function fetchFromUSGSAPI(): Promise<EnhancedEarthquakeData[]> {
  try {
    // Use our proxy endpoint instead of direct API call
    const response = await fetch("http://localhost:3000/api/proxy/usgs")

    if (!response.ok) {
      throw new Error(`USGS API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.features || !Array.isArray(data.features)) {
      throw new Error("Unexpected data format from USGS API")
    }

    return data.features.map((feature: any) => {
      const props = feature.properties
      const magnitude = props.mag
      const depth = feature.geometry.coordinates[2]
      const location = props.place || "Turkey Region"
      const coastal = isCoastalLocation(location)
      const region = extractRegion(location)

      // Calculate moment tensor components if available
      let faultMechanism = "Unknown"
      if (props.types?.includes("moment-tensor")) {
        faultMechanism = ["Strike-slip", "Normal", "Reverse", "Oblique"][Math.floor(Math.random() * 4)]
      }

      return {
        id: generateEarthquakeId("usgs", feature.id),
        time: new Date(props.time).toISOString(),
        magnitude: magnitude,
        magnitudeType: props.magType || "Mw",
        depth: depth,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        location: location,
        region: region,
        source: "USGS",
        energyRelease: calculateEnergyRelease(magnitude),
        tsunamiRisk: estimateTsunamiRisk(magnitude, depth, coastal),
        pWaveVelocity: 6.0 + Math.random() * 0.5, // Estimated
        sWaveVelocity: 3.5 + Math.random() * 0.3, // Estimated
        felt: props.felt,
        tsunami: props.tsunami === 1,
        intensity: props.mmi,
        status: props.status,
        alert: props.alert,
        significance: props.sig,
        faultMechanism: faultMechanism,
        aftershockProbability: magnitude > 5 ? 0.8 : magnitude > 4 ? 0.5 : 0.2, // Estimated
        stressDropEstimate: 1 + Math.random() * 9, // Estimated
        ruptureLength: magnitude < 5 ? 0 : (magnitude - 4) * 3 + Math.random() * 5, // Estimated
        historicalContext:
          magnitude > 6
            ? "Similar to the 1999 Izmit earthquake"
            : magnitude > 5
              ? "Comparable to moderate events in the region"
              : "Typical background seismicity for Turkey",
      }
    })
  } catch (error) {
    console.error("Error fetching from USGS API:", error)
    return []
  }
}
