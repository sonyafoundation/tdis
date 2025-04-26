// Common utility functions for earthquake data processing

// Calculate energy release in joules based on magnitude
export function calculateEnergyRelease(magnitude: number): number {
  // Energy (joules) = 10^(1.5*magnitude + 4.8)
  return Math.pow(10, 1.5 * magnitude + 4.8)
}

// Estimate tsunami risk based on magnitude, depth, and coastal location
export function estimateTsunamiRisk(magnitude: number, depth: number, isCoastal: boolean): number {
  if (!isCoastal) return 0

  // Basic tsunami risk model
  // Higher magnitude, shallower depth, and coastal location increase risk
  if (magnitude < 6.5) return 0

  let risk = (magnitude - 6.5) * 0.2 // Base risk from magnitude

  // Depth factor (shallower = higher risk)
  const depthFactor = Math.max(0, 1 - depth / 100)
  risk *= depthFactor

  return Math.min(1, risk) // Cap at 100%
}

// Check if a location is coastal based on keywords
export function isCoastalLocation(location: string): boolean {
  const coastalKeywords = [
    "sea",
    "deniz",
    "coast",
    "kıyı",
    "shore",
    "sahil",
    "aegean",
    "ege",
    "mediterranean",
    "akdeniz",
    "black sea",
    "karadeniz",
    "marmara",
  ]

  const lowerLocation = location.toLowerCase()
  return coastalKeywords.some((keyword) => lowerLocation.includes(keyword))
}

// Extract city/region from location string
export function extractRegion(location: string): string {
  // Common Turkish city names and regions
  const turkishCities = [
    "Adana",
    "Adıyaman",
    "Afyonkarahisar",
    "Ağrı",
    "Amasya",
    "Ankara",
    "Antalya",
    "Artvin",
    "Aydın",
    "Balıkesir",
    "Bilecik",
    "Bingöl",
    "Bitlis",
    "Bolu",
    "Burdur",
    "Bursa",
    "Çanakkale",
    "Çankırı",
    "Çorum",
    "Denizli",
    "Diyarbakır",
    "Edirne",
    "Elazığ",
    "Erzincan",
    "Erzurum",
    "Eskişehir",
    "Gaziantep",
    "Giresun",
    "Gümüşhane",
    "Hakkari",
    "Hatay",
    "Isparta",
    "Mersin",
    "İstanbul",
    "İzmir",
    "Kars",
    "Kastamonu",
    "Kayseri",
    "Kırklareli",
    "Kırşehir",
    "Kocaeli",
    "Konya",
    "Kütahya",
    "Malatya",
    "Manisa",
    "Kahramanmaraş",
    "Mardin",
    "Muğla",
    "Muş",
    "Nevşehir",
    "Niğde",
    "Ordu",
    "Rize",
    "Sakarya",
    "Samsun",
    "Siirt",
    "Sinop",
    "Sivas",
    "Tekirdağ",
    "Tokat",
    "Trabzon",
    "Tunceli",
    "Şanlıurfa",
    "Uşak",
    "Van",
    "Yozgat",
    "Zonguldak",
    "Aksaray",
    "Bayburt",
    "Karaman",
    "Kırıkkale",
    "Batman",
    "Şırnak",
    "Bartın",
    "Ardahan",
    "Iğdır",
    "Yalova",
    "Karabük",
    "Kilis",
    "Osmaniye",
    "Düzce",
  ]

  // Regions of Turkey
  const turkishRegions = [
    "Marmara",
    "Ege",
    "Akdeniz",
    "İç Anadolu",
    "Karadeniz",
    "Doğu Anadolu",
    "Güneydoğu Anadolu",
    "Marmara Region",
    "Aegean Region",
    "Mediterranean Region",
    "Central Anatolia",
    "Black Sea Region",
    "Eastern Anatolia",
    "Southeastern Anatolia",
  ]

  // Check for cities first
  for (const city of turkishCities) {
    if (location.includes(city)) {
      return city
    }
  }

  // Then check for regions
  for (const region of turkishRegions) {
    if (location.includes(region)) {
      return region
    }
  }

  // If no match, try to extract the first part before a comma or parenthesis
  const parts = location.split(/[,()]/)
  if (parts.length > 0 && parts[0].trim()) {
    return parts[0].trim()
  }

  return "Unknown Region"
}

// Generate a unique ID for an earthquake
export function generateEarthquakeId(source: string, uniqueIdentifier?: string): string {
  return `${source.toLowerCase().replace(/\s+/g, "-")}-${uniqueIdentifier || Date.now()}-${Math.random().toString(36).substring(2, 10)}`
}
