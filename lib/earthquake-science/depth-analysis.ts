export interface DepthAnalysis {
  depthCategory: "shallow" | "intermediate" | "deep"
  depthRange: {
    min: number // km
    max: number // km
  }
  characteristics: string[]
  typicalMechanisms: string[]
  damagePattern: string
  waveCharacteristics: string
  tsunamiRisk: "none" | "low" | "medium" | "high"
  aftershockPattern: string
  examples: string[]
}

export const depthAnalysisData: Record<"shallow" | "intermediate" | "deep", DepthAnalysis> = {
  shallow: {
    depthCategory: "shallow",
    depthRange: {
      min: 0,
      max: 70,
    },
    characteristics: [
      "Yüzeye yakın",
      "Genellikle daha şiddetli hissedilir",
      "Daha küçük etki alanı",
      "Yüksek frekans içeriği",
      "Daha fazla yüzey dalgası",
    ],
    typicalMechanisms: ["Normal faylanma", "Ters faylanma", "Doğrultu atımlı faylanma"],
    damagePattern: "Lokalize ancak şiddetli hasar. Yüksek frekans içeriği nedeniyle alçak yapılarda daha etkili.",
    waveCharacteristics: "Yüksek frekanslı dalgalar baskın. P ve S dalgaları arasındaki zaman farkı az.",
    tsunamiRisk: "high",
    aftershockPattern: "Çok sayıda ve yüzeye yakın artçı depremler. Ana şoktan sonra hızla azalır.",
    examples: [
      "1999 İzmit Depremi (7.6 Mw, 15 km)",
      "2020 İzmir Depremi (6.9 Mw, 10 km)",
      "2023 Kahramanmaraş Depremi (7.8 Mw, 10 km)",
    ],
  },
  intermediate: {
    depthCategory: "intermediate",
    depthRange: {
      min: 70,
      max: 300,
    },
    characteristics: [
      "Orta derinlikte",
      "Daha geniş bir alanda hissedilir",
      "Orta frekans içeriği",
      "Daha az yüzey hasarı",
      "Daha uzun süreli sarsıntı",
    ],
    typicalMechanisms: ["Dalma-batma zonları", "İntra-plaka deformasyonu", "Levha içi gerilmeler"],
    damagePattern:
      "Daha geniş alana yayılmış ancak daha az şiddetli hasar. Orta frekanslı dalgalar nedeniyle orta yükseklikteki yapılarda daha etkili.",
    waveCharacteristics: "Orta frekanslı dalgalar baskın. P ve S dalgaları arasında belirgin zaman farkı.",
    tsunamiRisk: "medium",
    aftershockPattern: "Daha az sayıda ancak daha geniş alana yayılmış artçı depremler. Daha uzun süre devam edebilir.",
    examples: [
      "2010 Şili Depremi (8.8 Mw, 30 km)",
      "2005 Sumatra Depremi (8.6 Mw, 30 km)",
      "1995 Kobe Depremi (6.9 Mw, 17 km)",
    ],
  },
  deep: {
    depthCategory: "deep",
    depthRange: {
      min: 300,
      max: 700,
    },
    characteristics: [
      "Çok derinde",
      "Çok geniş bir alanda hissedilir",
      "Düşük frekans içeriği",
      "Minimal yüzey hasarı",
      "Çok uzun süreli sarsıntı",
    ],
    typicalMechanisms: ["Derin dalma-batma zonları", "Levha kopmaları", "Derin faz değişimleri"],
    damagePattern:
      "Çok geniş alana yayılmış ancak genellikle hafif hasar. Düşük frekanslı dalgalar nedeniyle yüksek yapılarda daha etkili.",
    waveCharacteristics: "Düşük frekanslı dalgalar baskın. P ve S dalgaları arasında çok belirgin zaman farkı.",
    tsunamiRisk: "none",
    aftershockPattern: "Az sayıda artçı deprem. Geniş alana yayılmış ve uzun süre devam edebilir.",
    examples: [
      "1994 Bolivya Depremi (8.2 Mw, 637 km)",
      "2013 Denizi Okhotsk Depremi (8.3 Mw, 609 km)",
      "2015 Peru Depremi (7.5 Mw, 606 km)",
    ],
  },
}

/**
 * Derinlik kategorisini belirler
 * @param depth Deprem derinliği (km)
 * @returns Derinlik kategorisi
 */
export function determineDepthCategory(depth: number): "shallow" | "intermediate" | "deep" {
  if (depth < 70) return "shallow"
  if (depth < 300) return "intermediate"
  return "deep"
}

/**
 * Derinliğe göre deprem analizi yapar
 * @param depth Deprem derinliği (km)
 * @returns Derinlik analizi
 */
export function analyzeDepth(depth: number): DepthAnalysis {
  const category = determineDepthCategory(depth)
  return depthAnalysisData[category]
}

export interface EnergyRelease {
  magnitude: number
  energyJoules: number
  energyTNT: number // ton TNT eşdeğeri
  energyHiroshima: number // Hiroşima atom bombası eşdeğeri
  energyDescription: string
  comparisons: string[]
}

/**
 * Deprem enerjisini hesaplar ve karşılaştırır
 * @param magnitude Deprem büyüklüğü (Mw)
 * @returns Enerji salınımı analizi
 */
export function calculateEnergyRelease(magnitude: number): EnergyRelease {
  // Enerji (Joule) = 10^(1.5*M + 4.8)
  const energyJoules = Math.pow(10, 1.5 * magnitude + 4.8)

  // TNT eşdeğeri (1 ton TNT = 4.184 × 10^9 Joule)
  const energyTNT = energyJoules / (4.184 * Math.pow(10, 9))

  // Hiroşima atom bombası eşdeğeri (15 kiloton TNT)
  const energyHiroshima = energyTNT / 15000

  let energyDescription = ""
  const comparisons = []

  if (magnitude < 3.0) {
    energyDescription = "Çok düşük enerji. Genellikle sadece sismik cihazlarla tespit edilebilir."
    comparisons.push("Küçük bir dinamit patlamasına eşdeğer")
    comparisons.push(`${(energyJoules / 1000000).toFixed(2)} megajoule enerji`)
  } else if (magnitude < 4.0) {
    energyDescription = "Düşük enerji. Yakın çevrede hissedilebilir, nadiren hasar verir."
    comparisons.push(`${energyTNT.toFixed(2)} ton TNT patlamasına eşdeğer`)
    comparisons.push("Küçük bir askeri bombanın enerjisine yakın")
  } else if (magnitude < 5.0) {
    energyDescription = "Orta düzeyde enerji. Yerel olarak hissedilir, hafif hasara neden olabilir."
    comparisons.push(`${energyTNT.toFixed(2)} ton TNT patlamasına eşdeğer`)
    comparisons.push(`${(energyJoules / 1000000000).toFixed(2)} gigajoule enerji`)
  } else if (magnitude < 6.0) {
    energyDescription = "Yüksek enerji. Geniş bir alanda hissedilir, orta düzeyde hasara neden olabilir."
    comparisons.push(`${(energyTNT / 1000).toFixed(2)} kiloton TNT patlamasına eşdeğer`)
    comparisons.push(`${energyHiroshima.toFixed(3)} Hiroşima atom bombası enerjisi`)
  } else if (magnitude < 7.0) {
    energyDescription = "Çok yüksek enerji. Büyük bir alanda ciddi hasara neden olabilir."
    comparisons.push(`${(energyTNT / 1000).toFixed(2)} kiloton TNT patlamasına eşdeğer`)
    comparisons.push(`${energyHiroshima.toFixed(2)} Hiroşima atom bombası enerjisi`)
    comparisons.push(`${(energyJoules / Math.pow(10, 15)).toFixed(2)} petajoule enerji`)
  } else if (magnitude < 8.0) {
    energyDescription = "Muazzam enerji. Geniş bir bölgede yıkıcı hasara neden olur."
    comparisons.push(`${(energyTNT / 1000000).toFixed(2)} megaton TNT patlamasına eşdeğer`)
    comparisons.push(`${energyHiroshima.toFixed(1)} Hiroşima atom bombası enerjisi`)
    comparisons.push("Büyük bir hidrojen bombası enerjisine yakın")
  } else {
    energyDescription = "Olağanüstü enerji. Çok geniş bir bölgede felaket düzeyinde yıkıma neden olur."
    comparisons.push(`${(energyTNT / 1000000).toFixed(2)} megaton TNT patlamasına eşdeğer`)
    comparisons.push(`${energyHiroshima.toFixed(0)} Hiroşima atom bombası enerjisi`)
    comparisons.push(
      `Dünya'nın günlük enerji tüketiminin ${((energyJoules / (5.5 * Math.pow(10, 20))) * 365).toFixed(2)} günlük kısmına eşdeğer`,
    )
  }

  return {
    magnitude,
    energyJoules,
    energyTNT,
    energyHiroshima,
    energyDescription,
    comparisons,
  }
}
