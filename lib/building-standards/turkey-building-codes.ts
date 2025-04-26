export interface BuildingCode {
  id: string
  name: string
  year: number
  description: string
  keyFeatures: string[]
  limitations: string[]
  riskLevel: "high" | "medium" | "low"
}

export const turkeyBuildingCodes: BuildingCode[] = [
  {
    id: "pre-1975",
    name: "1975 Öncesi Yapılar",
    year: 1975,
    description: "Modern deprem yönetmeliklerinden önce inşa edilen yapılar. Deprem dayanımı düşüktür.",
    keyFeatures: [
      "Deprem tasarımı yok veya çok yetersiz",
      "Düşük kaliteli malzemeler",
      "Yetersiz donatı detayları",
      "Yumuşak kat problemi yaygın",
    ],
    limitations: [
      "Deprem yüklerine karşı dayanıksız",
      "Yanal rijitlik yetersiz",
      "Süneklik kapasitesi düşük",
      "Kolon-kiriş bağlantıları zayıf",
    ],
    riskLevel: "high",
  },
  {
    id: "afet-1975",
    name: "Afet Yönetmeliği (1975)",
    year: 1975,
    description: "Türkiye'nin ilk kapsamlı deprem yönetmeliği. Temel deprem tasarım prensiplerini içerir.",
    keyFeatures: [
      "Temel deprem kuvveti hesaplamaları",
      "Minimum donatı gereksinimleri",
      "Basit süneklik kuralları",
      "Deprem bölgelerine göre tasarım",
    ],
    limitations: [
      "Modern standartlara göre yetersiz",
      "Süneklik detayları eksik",
      "Zemin etkisi yeterince dikkate alınmamış",
      "Kalite kontrol mekanizmaları zayıf",
    ],
    riskLevel: "high",
  },
  {
    id: "afet-1998",
    name: "Afet Yönetmeliği (1998)",
    year: 1998,
    description: "1999 Marmara Depremi öncesi yürürlüğe giren, önemli iyileştirmeler içeren yönetmelik.",
    keyFeatures: [
      "Geliştirilmiş deprem kuvveti hesaplamaları",
      "Daha detaylı süneklik kuralları",
      "Kolon-kiriş birleşim bölgeleri için özel kurallar",
      "Zemin sınıflandırması",
    ],
    limitations: [
      "Uygulama ve denetim eksiklikleri",
      "Mevcut yapıların güçlendirilmesi için yetersiz",
      "Performans bazlı tasarım eksikliği",
      "Yüksek yapılar için özel hükümler yetersiz",
    ],
    riskLevel: "medium",
  },
  {
    id: "dbybhy-2007",
    name: "Deprem Bölgelerinde Yapılacak Binalar Hakkında Yönetmelik (2007)",
    year: 2007,
    description: "1999 Marmara Depremi sonrası geliştirilen, daha kapsamlı deprem yönetmeliği.",
    keyFeatures: [
      "Performans bazlı tasarım yaklaşımı",
      "Mevcut binaların değerlendirilmesi ve güçlendirilmesi",
      "Gelişmiş süneklik detayları",
      "Daha detaylı zemin sınıflandırması",
    ],
    limitations: [
      "Karmaşık hesap yöntemleri",
      "Uygulama zorlukları",
      "Denetim mekanizması eksiklikleri",
      "Yeni yapı sistemleri için sınırlı hükümler",
    ],
    riskLevel: "medium",
  },
  {
    id: "tbdy-2018",
    name: "Türkiye Bina Deprem Yönetmeliği (2018)",
    year: 2018,
    description: "En güncel ve kapsamlı deprem yönetmeliği. Uluslararası standartlarla uyumlu.",
    keyFeatures: [
      "Risk bazlı deprem tasarımı",
      "Deprem tehlike haritalarının güncellenmesi",
      "Gelişmiş performans bazlı tasarım",
      "Yüksek yapılar için özel hükümler",
      "Yeni yapı sistemleri için detaylı kurallar",
    ],
    limitations: [
      "Karmaşık hesap yöntemleri ve yazılım gereksinimleri",
      "Uygulama ve denetim zorlukları",
      "Maliyet artışı",
      "Uzman mühendis ihtiyacı",
    ],
    riskLevel: "low",
  },
]

export interface RegionConstructionPeriod {
  region: string
  city: string
  rapidGrowthPeriods: {
    period: string
    years: [number, number]
    buildingCount: number
    riskLevel: "high" | "medium" | "low"
    dominantBuildingCode: string
    notes: string
  }[]
}

export const turkeyRegionConstructionPeriods: RegionConstructionPeriod[] = [
  {
    region: "Marmara",
    city: "İstanbul",
    rapidGrowthPeriods: [
      {
        period: "Erken Sanayileşme Dönemi",
        years: [1950, 1975],
        buildingCount: 250000,
        riskLevel: "high",
        dominantBuildingCode: "pre-1975",
        notes: "Hızlı göç ve plansız kentleşme dönemi. Yapı kalitesi düşük, kaçak yapılaşma yaygın.",
      },
      {
        period: "Orta Dönem Kentleşme",
        years: [1975, 1999],
        buildingCount: 350000,
        riskLevel: "medium",
        dominantBuildingCode: "afet-1975",
        notes: "1999 depremi öncesi dönem. Yönetmelik var ancak uygulama ve denetim eksiklikleri mevcut.",
      },
      {
        period: "Deprem Sonrası Dönem",
        years: [2000, 2018],
        buildingCount: 400000,
        riskLevel: "medium",
        dominantBuildingCode: "dbybhy-2007",
        notes: "1999 depremi sonrası artan bilinç. Daha iyi yapı kalitesi ancak kentsel dönüşüm yetersiz.",
      },
      {
        period: "Modern Dönem",
        years: [2018, 2023],
        buildingCount: 150000,
        riskLevel: "low",
        dominantBuildingCode: "tbdy-2018",
        notes: "En güncel yönetmelikler. Kentsel dönüşüm projeleri ve yüksek yapı standartları.",
      },
    ],
  },
  {
    region: "Ege",
    city: "İzmir",
    rapidGrowthPeriods: [
      {
        period: "Erken Kentleşme",
        years: [1960, 1975],
        buildingCount: 120000,
        riskLevel: "high",
        dominantBuildingCode: "pre-1975",
        notes: "Plansız kentleşme ve düşük yapı kalitesi. Kıyı bölgelerinde zemin problemleri.",
      },
      {
        period: "Orta Dönem",
        years: [1975, 1998],
        buildingCount: 180000,
        riskLevel: "medium",
        dominantBuildingCode: "afet-1975",
        notes: "Yönetmelik uygulamaları başlamış ancak denetim eksiklikleri mevcut.",
      },
      {
        period: "Gelişme Dönemi",
        years: [1998, 2018],
        buildingCount: 220000,
        riskLevel: "medium",
        dominantBuildingCode: "afet-1998",
        notes: "Artan yapı kalitesi. 2020 İzmir depremi öncesi dönem.",
      },
      {
        period: "Modern Dönem",
        years: [2018, 2023],
        buildingCount: 80000,
        riskLevel: "low",
        dominantBuildingCode: "tbdy-2018",
        notes: "2020 depremi sonrası artan bilinç ve daha sıkı denetimler.",
      },
    ],
  },
  {
    region: "Doğu Anadolu",
    city: "Van",
    rapidGrowthPeriods: [
      {
        period: "Geleneksel Yapılaşma",
        years: [1950, 1980],
        buildingCount: 60000,
        riskLevel: "high",
        dominantBuildingCode: "pre-1975",
        notes: "Geleneksel yapım teknikleri, kerpiç ve yığma yapılar yaygın. Deprem dayanımı çok düşük.",
      },
      {
        period: "Geçiş Dönemi",
        years: [1980, 2000],
        buildingCount: 85000,
        riskLevel: "high",
        dominantBuildingCode: "afet-1975",
        notes: "Betonarme yapılara geçiş ancak kalite ve denetim sorunları. Malzeme kalitesi düşük.",
      },
      {
        period: "Deprem Sonrası Dönem",
        years: [2011, 2018],
        buildingCount: 40000,
        riskLevel: "medium",
        dominantBuildingCode: "dbybhy-2007",
        notes: "2011 Van depremi sonrası yeniden yapılanma. Artan yapı kalitesi ve denetimler.",
      },
      {
        period: "Güncel Dönem",
        years: [2018, 2023],
        buildingCount: 25000,
        riskLevel: "low",
        dominantBuildingCode: "tbdy-2018",
        notes: "Modern yapı standartları ve daha sıkı denetimler.",
      },
    ],
  },
  {
    region: "Güneydoğu Anadolu",
    city: "Kahramanmaraş",
    rapidGrowthPeriods: [
      {
        period: "Erken Dönem",
        years: [1960, 1980],
        buildingCount: 45000,
        riskLevel: "high",
        dominantBuildingCode: "pre-1975",
        notes: "Geleneksel yapım teknikleri ve düşük kaliteli betonarme. Deprem dayanımı çok düşük.",
      },
      {
        period: "Gelişme Dönemi",
        years: [1980, 2000],
        buildingCount: 70000,
        riskLevel: "high",
        dominantBuildingCode: "afet-1975",
        notes: "Hızlı kentleşme, denetim eksiklikleri ve düşük yapı kalitesi.",
      },
      {
        period: "Modern Öncesi",
        years: [2000, 2018],
        buildingCount: 90000,
        riskLevel: "medium",
        dominantBuildingCode: "dbybhy-2007",
        notes: "İyileşen standartlar ancak uygulama sorunları. 2023 depremi öncesi dönem.",
      },
      {
        period: "Deprem Sonrası",
        years: [2023, 2025],
        buildingCount: 30000,
        riskLevel: "low",
        dominantBuildingCode: "tbdy-2018",
        notes: "2023 depremi sonrası yeniden yapılanma. Sıkı denetim ve yüksek standartlar.",
      },
    ],
  },
]

/**
 * Bina yapım yılına göre risk seviyesini hesaplar
 * @param constructionYear Yapım yılı
 * @param region Bölge (opsiyonel)
 * @returns Risk seviyesi ve açıklama
 */
export function calculateBuildingRiskByYear(
  constructionYear: number,
  region?: string,
): {
  riskLevel: "high" | "medium" | "low"
  description: string
  buildingCode: string
} {
  // Yapım yılına göre uygulanan yönetmeliği bul
  let applicableCode = turkeyBuildingCodes[0] // Varsayılan olarak en eski yönetmelik

  for (const code of turkeyBuildingCodes) {
    if (constructionYear >= code.year) {
      applicableCode = code
    } else {
      break
    }
  }

  // Bölgeye özgü faktörleri dikkate al
  let regionFactor = 1.0
  if (region) {
    const regionLower = region.toLowerCase()
    if (regionLower.includes("marmara") || regionLower.includes("istanbul")) {
      regionFactor = 1.2 // Marmara bölgesi için risk faktörü
    } else if (regionLower.includes("doğu") || regionLower.includes("van")) {
      regionFactor = 1.3 // Doğu Anadolu için risk faktörü
    } else if (regionLower.includes("ege") || regionLower.includes("izmir")) {
      regionFactor = 1.1 // Ege bölgesi için risk faktörü
    }
  }

  // Risk seviyesini belirle
  const riskLevel: "high" | "medium" | "low" = applicableCode.riskLevel
  let description = ""

  if (constructionYear < 1975) {
    description = "Modern deprem yönetmeliklerinden önce inşa edilmiş, yüksek riskli yapı."
  } else if (constructionYear < 1998) {
    description = "Eski deprem yönetmeliğine göre inşa edilmiş, orta-yüksek riskli yapı."
  } else if (constructionYear < 2007) {
    description = "1998 yönetmeliğine göre inşa edilmiş, orta riskli yapı."
  } else if (constructionYear < 2018) {
    description = "2007 yönetmeliğine göre inşa edilmiş, düşük-orta riskli yapı."
  } else {
    description = "Modern deprem yönetmeliğine göre inşa edilmiş, düşük riskli yapı."
  }

  return {
    riskLevel,
    description,
    buildingCode: applicableCode.id,
  }
}
