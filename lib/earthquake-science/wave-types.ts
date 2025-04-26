export interface WaveType {
  id: string
  name: string
  nameEn: string
  description: string
  velocity: {
    min: number // km/s
    max: number // km/s
    avg: number // km/s
  }
  characteristics: string[]
  damageLevel: "low" | "medium" | "high"
  arrivalOrder: number
  propagation: "body" | "surface"
}

export const wavesTypes: Record<string, WaveType> = {
  p: {
    id: "p",
    name: "P-Dalgası (Primer)",
    nameEn: "P-Wave (Primary)",
    description:
      "İlk gelen sismik dalga türüdür. Sıkıştırma ve genleşme hareketi yapar, katı ve sıvı ortamlarda ilerleyebilir.",
    velocity: {
      min: 5.5,
      max: 8.0,
      avg: 6.5,
    },
    characteristics: [
      "Sıkıştırma ve genleşme hareketi",
      "En hızlı sismik dalga",
      "Katı ve sıvı ortamlarda ilerleyebilir",
      "Düşük genlikli",
      "Yüksek frekanslı",
    ],
    damageLevel: "low",
    arrivalOrder: 1,
    propagation: "body",
  },
  s: {
    id: "s",
    name: "S-Dalgası (Sekonder)",
    nameEn: "S-Wave (Secondary)",
    description:
      "P-dalgasından sonra gelen ikinci dalga türüdür. Yanal hareket yapar, sadece katı ortamlarda ilerleyebilir.",
    velocity: {
      min: 3.0,
      max: 4.5,
      avg: 3.7,
    },
    characteristics: [
      "Yanal (kesme) hareketi",
      "P-dalgasından daha yavaş",
      "Sadece katı ortamlarda ilerleyebilir",
      "Orta genlikli",
      "Orta frekanslı",
    ],
    damageLevel: "medium",
    arrivalOrder: 2,
    propagation: "body",
  },
  love: {
    id: "love",
    name: "Love Dalgası",
    nameEn: "Love Wave",
    description: "Yüzey dalgası türüdür. Yatay düzlemde yanal hareket yapar, yüzeye yakın bölgelerde etkilidir.",
    velocity: {
      min: 2.0,
      max: 4.5,
      avg: 3.3,
    },
    characteristics: [
      "Yatay düzlemde yanal hareket",
      "Yüzey dalgası",
      "S-dalgasından daha yavaş",
      "Yüksek genlikli",
      "Düşük frekanslı",
    ],
    damageLevel: "high",
    arrivalOrder: 3,
    propagation: "surface",
  },
  rayleigh: {
    id: "rayleigh",
    name: "Rayleigh Dalgası",
    nameEn: "Rayleigh Wave",
    description: "Yüzey dalgası türüdür. Eliptik hareket yapar, deniz dalgalarına benzer şekilde ilerler.",
    velocity: {
      min: 1.5,
      max: 4.0,
      avg: 3.0,
    },
    characteristics: [
      "Eliptik hareket",
      "Yüzey dalgası",
      "En yavaş sismik dalga",
      "En yüksek genlikli",
      "En düşük frekanslı",
    ],
    damageLevel: "high",
    arrivalOrder: 4,
    propagation: "surface",
  },
}

/**
 * P ve S dalgaları arasındaki varış süresi farkını hesaplar
 * @param distance Mesafe (km)
 * @returns Varış süresi farkı (saniye)
 */
export function calculatePSArrivalTimeDifference(distance: number): number {
  const pVelocity = wavesTypes.p.velocity.avg // km/s
  const sVelocity = wavesTypes.s.velocity.avg // km/s

  const pTravelTime = distance / pVelocity // saniye
  const sTravelTime = distance / sVelocity // saniye

  return sTravelTime - pTravelTime // saniye
}

/**
 * Deprem merkez üssüne olan mesafeyi P ve S dalgaları arasındaki varış süresi farkından hesaplar
 * @param timeDifference P ve S dalgaları arasındaki varış süresi farkı (saniye)
 * @returns Mesafe (km)
 */
export function calculateDistanceFromPSTimeDifference(timeDifference: number): number {
  const pVelocity = wavesTypes.p.velocity.avg // km/s
  const sVelocity = wavesTypes.s.velocity.avg // km/s

  // Mesafe = Zaman Farkı / (1/S Hızı - 1/P Hızı)
  return timeDifference / (1 / sVelocity - 1 / pVelocity)
}

/**
 * Dalga varış süresini hesaplar
 * @param distance Mesafe (km)
 * @param waveType Dalga tipi ('p', 's', 'love', 'rayleigh')
 * @returns Varış süresi (saniye)
 */
export function calculateWaveArrivalTime(distance: number, waveType: keyof typeof wavesTypes): number {
  const velocity = wavesTypes[waveType].velocity.avg // km/s
  return distance / velocity // saniye
}
