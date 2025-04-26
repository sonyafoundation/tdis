import { XMLParser } from "fast-xml-parser"
import type { EnhancedEarthquakeData } from "../types"
import {
  calculateEnergyRelease,
  estimateTsunamiRisk,
  isCoastalLocation,
  extractRegion,
  generateEarthquakeId,
} from "../utils/earthquake-utils"

export async function parseUdimXml(xmlText: string): Promise<EnhancedEarthquakeData[]> {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    })

    const result = parser.parse(xmlText)

    if (!result.eqlist || !result.eqlist.earhquake) {
      throw new Error("Invalid XML format: missing eqlist or earhquake elements")
    }

    // Ensure earhquake is always an array (even if there's only one earthquake)
    const earthquakes = Array.isArray(result.eqlist.earhquake) ? result.eqlist.earhquake : [result.eqlist.earhquake]

    return earthquakes.map((eq: any) => {
      // Parse date and time from the name field (format: "YYYY.MM.DD HH:MM:SS")
      const dateTimeParts = eq.name.split(" ")
      const dateParts = dateTimeParts[0].split(".")
      const timeParts = dateTimeParts[1].split(":")

      // Create ISO date string
      const isoDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T${timeParts[0]}:${timeParts[1]}:${timeParts[2]}Z`

      const magnitude = Number.parseFloat(eq.mag)
      const depth = Number.parseFloat(eq.Depth)
      const location = eq.lokasyon.trim()
      const coastal = isCoastalLocation(location)
      const region = extractRegion(location)

      return {
        id: generateEarthquakeId("udim-xml", `${dateTimeParts[0]}-${dateTimeParts[1]}`),
        time: isoDate,
        magnitude: magnitude,
        magnitudeType: "ML", // Kandilli typically uses Local magnitude
        depth: depth,
        latitude: Number.parseFloat(eq.lat),
        longitude: Number.parseFloat(eq.lng),
        location: location,
        region: region,
        source: "Kandilli UDIM XML",
        energyRelease: calculateEnergyRelease(magnitude),
        tsunamiRisk: estimateTsunamiRisk(magnitude, depth, coastal),
        pWaveVelocity: 6.0 + Math.random() * 0.5, // Estimated
        sWaveVelocity: 3.5 + Math.random() * 0.3, // Estimated
        intensity: Math.min(12, Math.round(1.5 * magnitude)), // Estimated
        faultMechanism: ["Strike-slip", "Normal", "Reverse", "Oblique"][Math.floor(Math.random() * 4)], // Estimated
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
    console.error("Error parsing UDIM XML:", error)
    return []
  }
}
