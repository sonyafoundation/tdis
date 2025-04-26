import type { EnhancedEarthquakeData, SourceInfo, MergeInfo } from "../types"

/**
 * Groups similar earthquakes from different sources into single entries
 * @param earthquakes Array of earthquake data from different sources
 * @returns Array of grouped earthquake data
 */
export function groupSimilarEarthquakes(earthquakes: EnhancedEarthquakeData[]): EnhancedEarthquakeData[] {
  // Create a map to group similar earthquakes
  const earthquakeGroups: Map<string, EnhancedEarthquakeData[]> = new Map()

  // Group earthquakes by similar time and location
  earthquakes.forEach((quake) => {
    // Create a key based on approximate time and location
    const quakeTime = new Date(quake.time)
    // Round to nearest 3 minutes for grouping (more precise than before)
    const roundedTime = new Date(Math.round(quakeTime.getTime() / (3 * 60 * 1000)) * (3 * 60 * 1000))

    // Round coordinates to 2 decimal places for more precise grouping
    const roundedLat = Math.round(quake.latitude * 100) / 100
    const roundedLon = Math.round(quake.longitude * 100) / 100

    // Create a key that combines time and location
    const key = `${roundedTime.toISOString()}_${roundedLat}_${roundedLon}`

    // Add to group
    if (!earthquakeGroups.has(key)) {
      earthquakeGroups.set(key, [])
    }
    earthquakeGroups.get(key)?.push(quake)
  })

  // Process each group to create merged earthquake data
  const mergedEarthquakes: EnhancedEarthquakeData[] = []

  earthquakeGroups.forEach((group) => {
    if (group.length === 1) {
      // If only one source reported this earthquake, add source info but don't merge
      const singleQuake = { ...group[0] }
      singleQuake.sources = [
        {
          name: singleQuake.source,
          magnitude: singleQuake.magnitude,
          magnitudeType: singleQuake.magnitudeType,
          time: singleQuake.time,
          depth: singleQuake.depth,
          location: singleQuake.location,
        },
      ]
      singleQuake.confidenceLevel = "single-source"
      mergedEarthquakes.push(singleQuake)
    } else {
      // Multiple sources reported this earthquake, merge them
      mergedEarthquakes.push(mergeEarthquakes(group))
    }
  })

  // Sort by time (newest first)
  return mergedEarthquakes.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

/**
 * Merges multiple earthquake entries from different sources into a single entry
 * @param earthquakes Array of earthquake data for the same event from different sources
 * @returns Merged earthquake data
 */
function mergeEarthquakes(earthquakes: EnhancedEarthquakeData[]): EnhancedEarthquakeData {
  // Sort by reliability (some sources are more reliable than others)
  const sortedQuakes = [...earthquakes].sort((a, b) => {
    // Prioritize sources in this order: USGS, EMSC, AFAD, Kandilli, others
    const sourceReliability = (source: string): number => {
      if (source.includes("USGS")) return 5
      if (source.includes("EMSC")) return 4
      if (source.includes("AFAD")) return 3
      if (source.includes("Kandilli")) return 2
      return 1
    }

    return sourceReliability(b.source) - sourceReliability(a.source)
  })

  // Use the most reliable source as the base
  const baseQuake = sortedQuakes[0]

  // Calculate average values and variances
  const magnitudes = sortedQuakes.map((q) => q.magnitude)
  const depths = sortedQuakes.map((q) => q.depth)
  const times = sortedQuakes.map((q) => new Date(q.time).getTime())
  const lats = sortedQuakes.map((q) => q.latitude)
  const lons = sortedQuakes.map((q) => q.longitude)

  // Calculate weighted averages based on source reliability
  const weights = sortedQuakes.map((q) => {
    const sourceReliability = (source: string): number => {
      if (source.includes("USGS")) return 5
      if (source.includes("EMSC")) return 4
      if (source.includes("AFAD")) return 3
      if (source.includes("Kandilli")) return 2
      return 1
    }
    return sourceReliability(q.source)
  })

  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  const weightedMagnitude = magnitudes.reduce((sum, mag, i) => sum + mag * weights[i], 0) / totalWeight
  const weightedDepth = depths.reduce((sum, depth, i) => sum + depth * weights[i], 0) / totalWeight
  const weightedTime = times.reduce((sum, time, i) => sum + time * weights[i], 0) / totalWeight
  const weightedLat = lats.reduce((sum, lat, i) => sum + lat * weights[i], 0) / totalWeight
  const weightedLon = lons.reduce((sum, lon, i) => sum + lon * weights[i], 0) / totalWeight

  // Calculate variances
  const magnitudeVariance = calculateVariance(magnitudes)
  const depthVariance = calculateVariance(depths)
  const timeVariance = calculateVariance(times) / (1000 * 60) // Convert to minutes
  const locationVariance = calculateLocationVariance(lats, lons)

  // Determine confidence level based on variances
  let confidenceLevel: "high" | "medium" | "low" = "high"

  if (
    magnitudeVariance > 0.5 ||
    depthVariance > 10 ||
    timeVariance > 30 || // 30 minutes
    locationVariance > 50 // 50 km
  ) {
    confidenceLevel = "low"
  } else if (
    magnitudeVariance > 0.2 ||
    depthVariance > 5 ||
    timeVariance > 10 || // 10 minutes
    locationVariance > 20 // 20 km
  ) {
    confidenceLevel = "medium"
  }

  // Create source info array
  const sources: SourceInfo[] = sortedQuakes.map((quake) => ({
    name: quake.source,
    magnitude: quake.magnitude,
    magnitudeType: quake.magnitudeType,
    time: quake.time,
    depth: quake.depth,
    location: quake.location,
  }))

  // Create merge info
  const mergeInfo: MergeInfo = {
    mergedCount: sortedQuakes.length,
    sourceNames: sortedQuakes.map((q) => q.source),
    magnitudeVariance,
    depthVariance,
    locationVariance,
    timeVariance,
  }

  // Create merged earthquake
  return {
    ...baseQuake,
    // Use weighted averages for key properties
    magnitude: weightedMagnitude,
    depth: weightedDepth,
    time: new Date(weightedTime).toISOString(),
    latitude: weightedLat,
    longitude: weightedLon,
    // Add metadata about sources and confidence
    sources,
    confidenceLevel,
    mergeInfo,
    // Update ID to reflect that it's a merged entry
    id: `merged-${baseQuake.id}`,
  }
}

/**
 * Calculates the variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length
  const squareDiffs = values.map((val) => Math.pow(val - avg, 2))
  return squareDiffs.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Calculates the average distance variance between coordinates in kilometers
 */
function calculateLocationVariance(lats: number[], lons: number[]): number {
  const avgLat = lats.reduce((sum, val) => sum + val, 0) / lats.length
  const avgLon = lons.reduce((sum, val) => sum + val, 0) / lons.length

  // Calculate distances from average point
  const distances = lats.map((lat, i) => haversineDistance(lat, lons[i], avgLat, avgLon))

  // Return average distance
  return distances.reduce((sum, val) => sum + val, 0) / distances.length
}

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @returns Distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}
