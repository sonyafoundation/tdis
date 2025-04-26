export interface FaultLine {
  id: string
  name: string
  type: "transform" | "normal" | "reverse" | "oblique"
  length: number // km
  segments: {
    name: string
    length: number // km
    slipRate: number // mm/yıl
    lastMajorEarthquake?: {
      year: number
      magnitude: number
    }
    recurrenceInterval: number // yıl
    maxPotentialMagnitude: number
    stressAccumulation: number // 0-1 arası, 1 en yüksek
  }[]
  description: string
  riskLevel: "high" | "medium" | "low"
}

export const turkeyFaultLines: FaultLine[] = [
  {
    id: 'naf',
    name: 'Kuzey Anadolu Fayı (KAF)',
    type: 'transform',
    length: 1500,
    segments: [
      {
        name: 'Marmara Segmenti',
        length: 160,
        slipRate: 20,
        lastMajorEarthquake: {
          year: 1999,
          magnitude: 7.6,
        },
        recurrenceInterval: 250,
        maxPotentialMagnitude: 7.6,
        stressAccumulation: 0.9,
      },
      {
        name: 'İstanbul Segmenti',
        length: 70,
        slipRate: 20,
        lastMajorEarthquake: {
          year: 1766,
          magnitude: 7.5,
        },
        recurrenceInterval: 250,
        maxPotentialMagnitude: 7.4,
        stressAccumulation: 0.95,
      },
      {
        name: 'Düzce Segmenti',
        length: 40,
        slipRate: 20,
        lastMajorEarthquake: {
          year: 1999,
          magnitude: 7.2,
        },
        recurrenceInterval: 200,
        maxPotentialMagnitude: 7.2,
        stressAccumulation: 0.1,
      },
      {
        name: 'Erzincan Segmenti',
        length: 100,
        slipRate: 15,
        lastMajorEarthquake: {
          year: 1939,
          magnitude: 7.9,
        },
        recurrenceInterval: 300,
        maxPotentialMagnitude: 7.9,
        stressAccumulation: 0.7,
      },
    ],
    description: 'Türkiye\'nin en aktif ve tehlikeli fay hattı. Sağ yanal doğrultu atımlı bir fay olup, Karadeniz\'den Marmara\'ya uzanır.',
    riskLevel: 'high',
  },
  {
    id: 'eaf',
    name: 'Doğu Anadolu Fayı (DAF)',
    type: 'transform',
    length: 700,
    segments: [
      {
        name: 'Palu-Hazar Segmenti',
        length: 80,
        slipRate: 10,
        lastMajorEarthquake: {
          year: 1971,
          magnitude: 6.8,
        },
        recurrenceInterval: 200,
        maxPotentialMagnitude: 7.2,
        stressAccumulation: 0.7,
      },
      {
        name: 'Pütürge Segmenti',
        length: 55,
        slipRate: 10,
        lastMajorEarthquake: {
          year: 2023,
          magnitude: 7.8,
        },
        recurrenceInterval: 250,
        maxPotentialMagnitude: 7.5,
        stressAccumulation: 0.1,
      },
      {
        name: 'Erkenek Segmenti',
        length: 60,
        slipRate: 10,
        lastMajorEarthquake: {
          year: 2023,
          magnitude: 7.5,
        },
        recurrenceInterval: 250,
        maxPotentialMagnitude: 7.4,
        stressAccumulation: 0.1,
      },
    ],
    description: 'Türkiye\'nin ikinci büyük transform fayı. Sol yanal doğrultu atımlı bir fay olup, Kahramanmaraş'tan Bingöl'e uzanır.',\
    riskLevel: 'high',
  },
  {
    id: 'waf',
    name: 'Batı Anadolu Fay Sistemi',
    type: 'normal',
    length: 600,
    segments: [
      {
        name: 'Gediz Grabeni',
        length: 120,
        slipRate: 5,
        lastMajorEarthquake: {
          year: 1969,
          magnitude: 6.9,
        },
        recurrenceInterval: 200,
        maxPotentialMagnitude: 7.0,
        stressAccumulation: 0.8,
      },
      {
        name: 'Büyük Menderes Grabeni',
        length: 140,
        slipRate: 5,
        lastMajorEarthquake: {
          year: 1899,
          magnitude: 6.9,
        },
        recurrenceInterval: 200,
        maxPotentialMagnitude: 7.0,
        stressAccumulation: 0.85,
      },
      {
        name: 'İzmir Fayı',
        length: 40,
        slipRate: 3,
        lastMajorEarthquake: {
          year: 2020,
          magnitude: 6.9,
        },
        recurrenceInterval: 150,
        maxPotentialMagnitude: 6.9,
        stressAccumulation: 0.1,
      },
    ],
    description: 'Batı Anadolu\'da yer alan normal fay sistemi. Bölgede genişleme tektoniği hakimdir.',
    riskLevel: 'medium',
  },
  {
    id: 'eafs',
    name: 'Doğu Anadolu Sıkışma Bölgesi',
    type: 'reverse',
    length: 400,
    segments: [
      {
        name: 'Bitlis Bindirme Kuşağı',
        length: 200,
        slipRate: 2,
        lastMajorEarthquake: {
          year: 2011,
          magnitude: 7.1,
        },
        recurrenceInterval: 300,
        maxPotentialMagnitude: 7.3,
        stressAccumulation: 0.5,
      },
      {
        name: 'Van Fayı',
        length: 80,
        slipRate: 2,
        lastMajorEarthquake: {
          year: 2011,
          magnitude: 7.1,
        },
        recurrenceInterval: 300,
        maxPotentialMagnitude: 7.2,
        stressAccumulation: 0.2,
      },
    ],
    description: 'Doğu Anadolu\'da yer alan bindirme fayları. Afrika-Arap ve Avrasya plakalarının çarpışma bölgesi.',
    riskLevel: 'medium',
  },
];

export interface MarmaraEnergyAccumulation {
  segment: string
  lastReleaseYear: number
  annualStressRate: number // MPa/yıl
  currentAccumulatedStress: number // MPa
  estimatedThreshold: number // MPa
  percentageToThreshold: number // %
  estimatedTimeToRelease: number // yıl
  potentialMagnitude: number
  affectedPopulation: number // milyon
  economicImpact: number // milyar $
}

export const marmaraEnergyAccumulation: MarmaraEnergyAccumulation[] = [
  {
    segment: "İstanbul Segmenti",
    lastReleaseYear: 1766,
    annualStressRate: 0.01, // MPa/yıl
    currentAccumulatedStress: 2.58, // MPa
    estimatedThreshold: 3.0, // MPa
    percentageToThreshold: 86,
    estimatedTimeToRelease: 42, // yıl
    potentialMagnitude: 7.4,
    affectedPopulation: 15.5, // milyon
    economicImpact: 120, // milyar $
  },
  {
    segment: "Adalar Segmenti",
    lastReleaseYear: 1894,
    annualStressRate: 0.01, // MPa/yıl
    currentAccumulatedStress: 1.31, // MPa
    estimatedThreshold: 2.5, // MPa
    percentageToThreshold: 52,
    estimatedTimeToRelease: 119, // yıl
    potentialMagnitude: 7.2,
    affectedPopulation: 12.0, // milyon
    economicImpact: 90, // milyar $
  },
  {
    segment: "Çınarcık Segmenti",
    lastReleaseYear: 1963,
    annualStressRate: 0.01, // MPa/yıl
    currentAccumulatedStress: 0.62, // MPa
    estimatedThreshold: 2.0, // MPa
    percentageToThreshold: 31,
    estimatedTimeToRelease: 138, // yıl
    potentialMagnitude: 7.1,
    affectedPopulation: 8.0, // milyon
    economicImpact: 70, // milyar $
  },
  {
    segment: "Orta Marmara Segmenti",
    lastReleaseYear: 1509,
    annualStressRate: 0.01, // MPa/yıl
    currentAccumulatedStress: 5.16, // MPa
    estimatedThreshold: 5.5, // MPa
    percentageToThreshold: 94,
    estimatedTimeToRelease: 34, // yıl
    potentialMagnitude: 7.6,
    affectedPopulation: 18.0, // milyon
    economicImpact: 150, // milyar $
  },
]

/**
 * Fay segmentinin kırılma olasılığını hesaplar
 * @param segment Fay segmenti
 * @param timeWindow Zaman penceresi (yıl)
 * @returns Kırılma olasılığı (0-1 arası)
 */
export function calculateRuptureProb(segment: FaultLine["segments"][0], timeWindow: number): number {
  const currentYear = new Date().getFullYear()
  const yearsSinceLastEQ = segment.lastMajorEarthquake ? currentYear - segment.lastMajorEarthquake.year : 0

  // Basitleştirilmiş olasılık modeli (Poisson dağılımı)
  const annualProb = 1 / segment.recurrenceInterval
  const probInTimeWindow = 1 - Math.exp(-annualProb * timeWindow)

  // Geçen süreyi dikkate alan düzeltme faktörü
  const timeFactor = Math.min(1.5, yearsSinceLastEQ / (segment.recurrenceInterval * 0.5))

  return Math.min(0.99, probInTimeWindow * timeFactor)
}

/**
 * Belirli bir konumun en yakın fay hatlarını bulur
 * @param lat Enlem
 * @param lon Boylam
 * @param maxDistance Maksimum mesafe (km)
 * @returns En yakın fay hatları ve mesafeleri
 */
export function findNearestFaults(
  lat: number,
  lon: number,
  maxDistance = 100,
): {
  fault: FaultLine
  segment: FaultLine["segments"][0]
  distance: number
  ruptureProb30Years: number
}[] {
  // Bu fonksiyon gerçek bir uygulamada coğrafi hesaplamalar gerektirir
  // Burada basitleştirilmiş bir örnek sunuyoruz

  // Örnek veri - gerçek uygulamada harita verileri ve mesafe hesaplamaları kullanılmalıdır
  const nearestFaults = [
    {
      fault: turkeyFaultLines[0], // KAF
      segment: turkeyFaultLines[0].segments[0], // Marmara Segmenti
      distance: 15, // km
      ruptureProb30Years: calculateRuptureProb(turkeyFaultLines[0].segments[0], 30),
    },
    {
      fault: turkeyFaultLines[0], // KAF
      segment: turkeyFaultLines[0].segments[1], // İstanbul Segmenti
      distance: 25, // km
      ruptureProb30Years: calculateRuptureProb(turkeyFaultLines[0].segments[1], 30),
    },
    {
      fault: turkeyFaultLines[2], // Batı Anadolu
      segment: turkeyFaultLines[2].segments[2], // İzmir Fayı
      distance: 80, // km
      ruptureProb30Years: calculateRuptureProb(turkeyFaultLines[2].segments[2], 30),
    },
  ]

  return nearestFaults.filter((item) => item.distance <= maxDistance)
}
