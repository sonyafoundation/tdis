export interface TsunamiRiskParams {
  magnitude: number
  depth: number // km
  distance: number // km from coast
  location: string
  underwaterLandslide: boolean
  coastalTopography: "bay" | "open" | "peninsula"
  waterDepth: number // m
}

export interface TsunamiRiskResult {
  riskLevel: "none" | "low" | "medium" | "high" | "very-high"
  riskScore: number // 0-100
  estimatedWaveHeight: number // m
  estimatedArrivalTime: number // minutes
  inundationDistance: number // km
  warningTime: number // minutes
  evacuationRecommendation: string
  affectedCoastline: number // km
  historicalTsunamis: {
    year: number
    magnitude: number
    waveHeight: number
    casualties: number
  }[]
}

/**
 * Tsunami riskini hesaplar
 * @param params Tsunami risk parametreleri
 * @returns Tsunami risk sonucu
 */
export function calculateTsunamiRisk(params: TsunamiRiskParams): TsunamiRiskResult {
  // Tsunami oluşma koşulları
  // 1. Deniz altı depremi (genellikle Mw >= 7.0)
  // 2. Sığ odaklı (genellikle < 50 km)
  // 3. Deniz tabanında düşey hareket

  let riskScore = 0

  // Büyüklük faktörü
  if (params.magnitude >= 8.0) riskScore += 40
  else if (params.magnitude >= 7.5) riskScore += 30
  else if (params.magnitude >= 7.0) riskScore += 20
  else if (params.magnitude >= 6.5) riskScore += 10
  else riskScore += 0

  // Derinlik faktörü
  if (params.depth < 10) riskScore += 30
  else if (params.depth < 20) riskScore += 25
  else if (params.depth < 30) riskScore += 20
  else if (params.depth < 50) riskScore += 10
  else riskScore += 0

  // Kıyıya mesafe faktörü
  if (params.distance < 50) riskScore += 20
  else if (params.distance < 100) riskScore += 15
  else if (params.distance < 200) riskScore += 10
  else if (params.distance < 300) riskScore += 5
  else riskScore += 0

  // Denizaltı heyelanı faktörü
  if (params.underwaterLandslide) riskScore += 15

  // Kıyı topografyası faktörü
  if (params.coastalTopography === "bay") riskScore += 15
  else if (params.coastalTopography === "peninsula") riskScore -= 5

  // Su derinliği faktörü
  if (params.waterDepth > 3000) riskScore += 10
  else if (params.waterDepth > 2000) riskScore += 7
  else if (params.waterDepth > 1000) riskScore += 5

  // Risk seviyesi belirleme
  let riskLevel: "none" | "low" | "medium" | "high" | "very-high"
  if (riskScore >= 80) riskLevel = "very-high"
  else if (riskScore >= 60) riskLevel = "high"
  else if (riskScore >= 40) riskLevel = "medium"
  else if (riskScore >= 20) riskLevel = "low"
  else riskLevel = "none"

  // Dalga yüksekliği tahmini (basitleştirilmiş)
  const estimatedWaveHeight = calculateWaveHeight(
    params.magnitude,
    params.depth,
    params.distance,
    params.coastalTopography,
  )

  // Varış süresi tahmini (basitleştirilmiş)
  const estimatedArrivalTime = calculateArrivalTime(params.distance)

  // Su basma mesafesi tahmini (basitleştirilmiş)
  const inundationDistance = estimateInundationDistance(estimatedWaveHeight, params.coastalTopography)

  return {
    riskLevel,
    riskScore,
    estimatedWaveHeight,
    estimatedArrivalTime,
    inundationDistance,
    warningTime: Math.max(0, estimatedArrivalTime - 5), // 5 dakika uyarı sistemi gecikmesi
    evacuationRecommendation: getEvacuationRecommendation(riskLevel, estimatedArrivalTime),
    affectedCoastline: estimateAffectedCoastline(params.magnitude, params.coastalTopography),
    historicalTsunamis: [
      {
        year: 1999,
        magnitude: 7.6,
        waveHeight: 2.5,
        casualties: 150,
      },
      {
        year: 1509,
        magnitude: 7.2,
        waveHeight: 3.0,
        casualties: 500,
      },
    ],
  }
}

/**
 * Dalga yüksekliğini hesaplar
 */
function calculateWaveHeight(
  magnitude: number,
  depth: number,
  distance: number,
  coastalTopography: "bay" | "open" | "peninsula",
): number {
  // Basitleştirilmiş formül
  const baseHeight = Math.pow(10, magnitude - 6.5) * 0.2

  // Derinlik faktörü
  const depthFactor = Math.max(0.2, 1 - depth / 100)

  // Mesafe faktörü
  const distanceFactor = Math.max(0.1, 1 - distance / 500)

  // Kıyı faktörü
  let coastFactor = 1.0
  if (coastalTopography === "bay") coastFactor = 1.5
  else if (coastalTopography === "peninsula") coastFactor = 0.7

  return baseHeight * depthFactor * distanceFactor * coastFactor
}

/**
 * Tsunami varış süresini hesaplar
 */
function calculateArrivalTime(distance: number): number {
  // Derin denizde tsunami hızı yaklaşık 800 km/saat
  // Sığ sularda yavaşlar
  const deepWaterSpeed = 800 // km/saat

  // Basitleştirilmiş hesaplama (dakika cinsinden)
  return (distance / deepWaterSpeed) * 60
}

/**
 * Su basma mesafesini tahmin eder
 */
function estimateInundationDistance(waveHeight: number, coastalTopography: "bay" | "open" | "peninsula"): number {
  // Basitleştirilmiş formül
  const baseDistance = waveHeight * 10 // Her 1m dalga yüksekliği için 10m içeri

  // Kıyı faktörü
  let coastFactor = 1.0
  if (coastalTopography === "bay") coastFactor = 1.3
  else if (coastalTopography === "peninsula") coastFactor = 0.8

  return (baseDistance * coastFactor) / 1000 // km'ye çevir
}

/**
 * Tahliye önerisi oluşturur
 */
function getEvacuationRecommendation(
  riskLevel: "none" | "low" | "medium" | "high" | "very-high",
  arrivalTime: number,
): string {
  if (riskLevel === "none") return "Tahliye gerekmez."
  if (riskLevel === "low") return "Kıyı bölgelerinden uzaklaşın, yüksek bölgelere çıkın."

  if (arrivalTime < 15) {
    return "ACİL TAHLİYE! Hemen kıyıdan uzaklaşın, en az 2 km içeri veya 30m yüksekliğe çıkın!"
  } else if (arrivalTime < 30) {
    return "Hızlı tahliye! Kıyıdan en az 2 km içeri veya 30m yüksekliğe çıkın."
  } else {
    return "Düzenli tahliye. Kıyıdan uzaklaşın, yüksek bölgelere çıkın ve yetkililerin talimatlarını bekleyin."
  }
}

/**
 * Etkilenen kıyı şeridi uzunluğunu tahmin eder
 */
function estimateAffectedCoastline(magnitude: number, coastalTopography: "bay" | "open" | "peninsula"): number {
  // Basitleştirilmiş formül
  const baseLength = Math.pow(10, magnitude - 6.0) * 10 // km

  // Kıyı faktörü
  let coastFactor = 1.0
  if (coastalTopography === "bay")
    coastFactor = 0.8 // Körfezde daha sınırlı etki
  else if (coastalTopography === "peninsula") coastFactor = 1.2 // Yarımadada daha geniş etki

  return baseLength * coastFactor
}
