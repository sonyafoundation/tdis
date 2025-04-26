import type { EnhancedEarthquakeData, ApiSource } from "./types"
import { groupSimilarEarthquakes } from "./utils/data-merger"

// Import all data sources
import { fetchFromEMSCAPI, fetchFromEMSCTestimoniesAPI } from "./data-sources/emsc-api"
import { fetchFromUSGSAPI } from "./data-sources/usgs-api"
import { fetchFromDirectAFAD } from "./data-sources/direct-afad"
import { fetchFromDirectKandilli } from "./data-sources/direct-kandilli"
import { fetchFromUdimXmlApi } from "./data-sources/udim-xml-api"

// API sources array with all data providers
const apiSources: ApiSource[] = [
  { name: "Kandilli UDIM XML", fetchFunction: fetchFromUdimXmlApi }, // En yüksek öncelikli kaynak
  { name: "EMSC", fetchFunction: fetchFromEMSCAPI },
  { name: "EMSC Testimonies", fetchFunction: fetchFromEMSCTestimoniesAPI },
  { name: "AFAD Official", fetchFunction: fetchFromDirectAFAD },
  { name: "Kandilli Observatory Direct", fetchFunction: fetchFromDirectKandilli },
  // USGS API geçici olarak devre dışı bırakıldı
  // { name: "USGS", fetchFunction: fetchFromUSGSAPI },
]

// Update the fetchAllEarthquakeData function to add more error handling and retry logic
export async function fetchAllEarthquakeData(): Promise<EnhancedEarthquakeData[]> {
  // Fetch data from all sources in parallel
  const promises = apiSources.map((source) => {
    // Add retry logic for each source
    return fetchWithRetry(source)
  })

  const results = await Promise.allSettled(promises)

  // Combine all successful results
  const allData: EnhancedEarthquakeData[] = []
  let successCount = 0

  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.length > 0) {
      allData.push(...result.value)
      successCount++
    } else {
      console.error(
        `Error fetching from ${apiSources[index].name}:`,
        result.status === "rejected" ? result.reason : "No data returned",
      )
    }
  })

  // If no data was returned, return empty array
  if (successCount === 0) {
    console.warn("All APIs failed, no data available")
    return []
  }

  // Sort by time (newest first)
  allData.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  // Group similar earthquakes from different sources
  const groupedData = groupSimilarEarthquakes(allData)

  return groupedData
}

// Helper function to retry API calls
async function fetchWithRetry(source: ApiSource, maxRetries = 2): Promise<EnhancedEarthquakeData[]> {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Berkealp ve Ferdiozer API'leri için hemen boş dizi döndür
      if (source.name === "Berkealp Kandilli API" || source.name === "Ferdiozer Earthquake API") {
        console.log(`Skipping deprecated API: ${source.name}`)
        return []
      }

      const data = await source.fetchFunction()

      // Check if we got valid data
      if (Array.isArray(data) && data.length > 0) {
        console.log(`Successfully fetched ${data.length} records from ${source.name}`)
        return data
      } else {
        console.warn(`Source ${source.name} returned empty data`)
        // If we got an empty array, treat it as a retriable error
        throw new Error(`Empty data from ${source.name}`)
      }
    } catch (error) {
      console.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed for ${source.name}:`, error)
      lastError = error

      // Wait a bit before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 200 * Math.pow(2, attempt)))
      }
    }
  }

  console.error(`All attempts failed for ${source.name}`)
  return [] // Return empty array after all retries fail
}

// Filter earthquakes by region
export function filterByRegion(data: EnhancedEarthquakeData[], region: string): EnhancedEarthquakeData[] {
  if (!region || region === "All Regions") {
    return data
  }

  return data.filter(
    (quake) =>
      quake.region.toLowerCase().includes(region.toLowerCase()) ||
      quake.location.toLowerCase().includes(region.toLowerCase()),
  )
}

// Filter earthquakes by magnitude range
export function filterByMagnitude(
  data: EnhancedEarthquakeData[],
  minMag: number,
  maxMag: number,
): EnhancedEarthquakeData[] {
  return data.filter((quake) => quake.magnitude >= minMag && quake.magnitude <= maxMag)
}

// Filter earthquakes by time range
export function filterByTimeRange(
  data: EnhancedEarthquakeData[],
  startTime: Date,
  endTime: Date,
): EnhancedEarthquakeData[] {
  return data.filter((quake) => {
    const quakeTime = new Date(quake.time)
    return quakeTime >= startTime && quakeTime <= endTime
  })
}

// Get unique regions from earthquake data
export function getUniqueRegions(data: EnhancedEarthquakeData[]): string[] {
  const regions = new Set<string>()

  data.forEach((quake) => {
    if (quake.region && quake.region !== "Unknown Region") {
      regions.add(quake.region)
    }
  })

  return ["All Regions", ...Array.from(regions).sort()]
}
