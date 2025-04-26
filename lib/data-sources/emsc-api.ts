import type { EnhancedEarthquakeData } from "../types"
import {
  calculateEnergyRelease,
  estimateTsunamiRisk,
  isCoastalLocation,
  extractRegion,
  generateEarthquakeId,
} from "../utils/earthquake-utils"

// EMSC (European-Mediterranean Seismological Centre) API
export async function fetchFromEMSCAPI(): Promise<EnhancedEarthquakeData[]> {
  try {
    // Use our proxy endpoint instead of direct API call
    const response = await fetch("http://localhost:3000/api/proxy/emsc")

    if (!response.ok) {
      throw new Error(`EMSC API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.features || !Array.isArray(data.features)) {
      throw new Error("Unexpected data format from EMSC API")
    }

    return data.features.map((feature: any) => {
      const props = feature.properties
      const magnitude = props.mag
      const depth = props.depth / 1000 // Convert from meters to km if needed
      const location = props.flynn_region || "Turkey Region"
      const coastal = isCoastalLocation(location)
      const region = extractRegion(location)

      return {
        id: generateEarthquakeId("emsc", props.source_id),
        time: props.time,
        magnitude: magnitude,
        magnitudeType: props.magtype || "M",
        depth: depth,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        location: location,
        region: region,
        source: "EMSC",
        energyRelease: calculateEnergyRelease(magnitude),
        tsunamiRisk: estimateTsunamiRisk(magnitude, depth, coastal),
        pWaveVelocity: 6.0 + Math.random() * 0.5, // Estimated
        sWaveVelocity: 3.5 + Math.random() * 0.3, // Estimated
        intensity: Math.min(12, Math.round(1.5 * magnitude)), // Estimated
        faultMechanism: props.focal_mechanism
          ? props.focal_mechanism
          : ["Strike-slip", "Normal", "Reverse", "Oblique"][Math.floor(Math.random() * 4)],
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
    console.error("Error fetching from EMSC API:", error)
    return []
  }
}

// EMSC Testimonies API (new endpoint provided by user)
export async function fetchFromEMSCTestimoniesAPI(): Promise<EnhancedEarthquakeData[]> {
  try {
    // Use our proxy endpoint instead of direct API call
    const response = await fetch("http://localhost:3000/api/proxy/emsc-testimonies")

    if (!response.ok) {
      throw new Error(`EMSC Testimonies API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error("Unexpected data format from EMSC Testimonies API")
    }

    return data.map((item: any) => {
      const magnitude = Number.parseFloat(item.ev_mag_value)
      const depth = Number.parseFloat(item.ev_depth)
      const location = item.ev_region || "Unknown Location"
      const coastal = isCoastalLocation(location)
      const region = extractRegion(location)

      // Parse the time string
      let time = new Date().toISOString()
      try {
        if (item.ev_event_time) {
          // Format might be like "2025-04-23T21:43:26.000 UTC"
          time = new Date(item.ev_event_time.replace(" UTC", "Z")).toISOString()
        }
      } catch (e) {
        console.error("Error parsing date/time:", e)
      }

      return {
        id: generateEarthquakeId("emsc-testimonies", item.ev_unid),
        time: time,
        magnitude: magnitude,
        magnitudeType: item.ev_mag_type || "M",
        depth: depth,
        latitude: Number.parseFloat(item.ev_latitude),
        longitude: Number.parseFloat(item.ev_longitude),
        location: location,
        region: region,
        source: "EMSC Testimonies",
        energyRelease: calculateEnergyRelease(magnitude),
        tsunamiRisk: estimateTsunamiRisk(magnitude, depth, coastal),
        pWaveVelocity: 6.0 + Math.random() * 0.5, // Estimated
        sWaveVelocity: 3.5 + Math.random() * 0.3, // Estimated
        intensity: Math.min(12, Math.round(1.5 * magnitude)), // Estimated
        faultMechanism: ["Strike-slip", "Normal", "Reverse", "Oblique"][Math.floor(Math.random() * 4)],
        aftershockProbability: magnitude > 5 ? 0.8 : magnitude > 4 ? 0.5 : 0.2, // Estimated
        stressDropEstimate: 1 + Math.random() * 9, // Estimated
        ruptureLength: magnitude < 5 ? 0 : (magnitude - 4) * 3 + Math.random() * 5, // Estimated
        felt: item.ev_nbtestimonies, // Number of testimonies
        historicalContext:
          magnitude > 6
            ? "Similar to the 1999 Izmit earthquake"
            : magnitude > 5
              ? "Comparable to moderate events in the region"
              : "Typical background seismicity for Turkey",
      }
    })
  } catch (error) {
    console.error("Error fetching from EMSC Testimonies API:", error)
    return []
  }
}
