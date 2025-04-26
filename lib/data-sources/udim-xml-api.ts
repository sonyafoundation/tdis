import type { EnhancedEarthquakeData } from "../types"

export async function fetchFromUdimXmlApi(): Promise<EnhancedEarthquakeData[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch("http://localhost:3000/api/proxy/udim-xml", {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`UDIM XML API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error("Unexpected data format from UDIM XML API")
    }

    return data
  } catch (error) {
    console.error("Error fetching from UDIM XML API:", error)
    return []
  }
}
