export interface RiskAnalysisResult {
  location: {
    lat: number
    lon: number
    address: string
    city: string
    district: string
  }
  riskLevel: "very-high" | "high" | "medium" | "low" | "very-low"
  riskScore: number // 0-100 arası
  nearbyFaults: {
    name: string
    distance: number // km
    maxMagnitude: number
    ruptureProb30Years: number
  }[]
  soilCondition: {
    type: string
    amplification: number
    liquefactionRisk: "high" | "medium" | "low" | "none"
    vs30: number // m/s
  }
  buildingVulnerability: {
    constructionYear: number
    buildingType: string
    heightCategory: string
    vulnerabilityScore: number // 0-100 arası
    estimatedCollapseRate: number // 0-1 arası
  }
  historicalEarthquakes: {
    year: number
    magnitude: number
    distance: number // km
    impact: string
  }[]
  expectedIntensity: {
    mmi: number // Modified Mercalli Intensity
    pga: number // Peak Ground Acceleration (g)
    pgv: number // Peak Ground Velocity (cm/s)
  }
  recommendations: string[]
}

export interface SafeZone {
  id: string
  name: string
  type: "park" | "stadium" | "school" | "government" | "other"
  location: {
    lat: number
    lon: number
    address: string
    city: string
    district: string
  }
  capacity: number
  facilities: {
    water: boolean
    electricity: boolean
    shelter: boolean
    medicalAid: boolean
    toilets: boolean
    kitchen: boolean
  }
  accessRoutes: number
  distanceFromFaults: number // km
  soilCondition: string
  notes: string
}

export const sampleSafeZones: SafeZone[] = [
  {
    id: "sz-001",
    name: "Yıldız Parkı",
    type: "park",
    location: {
      lat: 41.0518,
      lon: 29.0153,
      address: "Yıldız Mh., Beşiktaş",
      city: "İstanbul",
      district: "Beşiktaş",
    },
    capacity: 5000,
    facilities: {
      water: true,
      electricity: true,
      shelter: false,
      medicalAid: false,
      toilets: true,
      kitchen: false,
    },
    accessRoutes: 3,
    distanceFromFaults: 12,
    soilCondition: "Sağlam zemin, kayalık",
    notes: "Geniş açık alanlar, ağaçlık bölgelerden uzak durulmalı.",
  },
  {
    id: "sz-002",
    name: "Atatürk Olimpiyat Stadyumu",
    type: "stadium",
    location: {
      lat: 41.0745,
      lon: 28.7633,
      address: "İkitelli, Başakşehir",
      city: "İstanbul",
      district: "Başakşehir",
    },
    capacity: 80000,
    facilities: {
      water: true,
      electricity: true,
      shelter: true,
      medicalAid: true,
      toilets: true,
      kitchen: true,
    },
    accessRoutes: 5,
    distanceFromFaults: 18,
    soilCondition: "Orta sağlamlıkta zemin",
    notes: "Büyük ölçekli afet durumunda ana toplanma alanı.",
  },
  {
    id: "sz-003",
    name: "Kültürpark",
    type: "park",
    location: {
      lat: 38.4326,
      lon: 27.1442,
      address: "Kültürpark, Konak",
      city: "İzmir",
      district: "Konak",
    },
    capacity: 20000,
    facilities: {
      water: true,
      electricity: true,
      shelter: true,
      medicalAid: true,
      toilets: true,
      kitchen: true,
    },
    accessRoutes: 4,
    distanceFromFaults: 8,
    soilCondition: "Alüvyon zemin, orta risk",
    notes: "İzmir Fuarı alanı, geniş açık alanlar mevcut.",
  },
]

export interface EvacuationPlan {
  id: string
  city: string
  district: string
  primaryRoutes: {
    name: string
    startPoint: string
    endPoint: string
    length: number // km
    capacity: number // araç/saat
    vulnerablePoints: string[]
  }[]
  alternativeRoutes: {
    name: string
    startPoint: string
    endPoint: string
    length: number // km
    notes: string
  }[]
  evacuationZones: {
    id: string
    name: string
    capacity: number
    distance: number // km
  }[]
  specialNeeds: {
    hospitals: number
    schools: number
    elderlyFacilities: number
    criticalInfrastructure: string[]
  }
  estimatedEvacuationTime: {
    bestCase: number // saat
    worstCase: number // saat
    bottlenecks: string[]
  }
  notes: string
}

export const sampleEvacuationPlans: EvacuationPlan[] = [
  {
    id: "ep-001",
    city: "İstanbul",
    district: "Kadıköy",
    primaryRoutes: [
      {
        name: "D-100 Karayolu",
        startPoint: "Kadıköy Merkez",
        endPoint: "Kartal",
        length: 15,
        capacity: 8000,
        vulnerablePoints: ["Fikirtepe Kavşağı", "Göztepe Köprüsü"],
      },
      {
        name: "Sahil Yolu",
        startPoint: "Kadıköy İskele",
        endPoint: "Tuzla",
        length: 25,
        capacity: 5000,
        vulnerablePoints: ["Bostancı Köprüsü", "Maltepe Sahili"],
      },
    ],
    alternativeRoutes: [
      {
        name: "Minibüs Yolu",
        startPoint: "Kadıköy Merkez",
        endPoint: "Bostancı",
        length: 8,
        notes: "Dar yol, trafik sıkışıklığı riski yüksek",
      },
    ],
    evacuationZones: [
      {
        id: "sz-004",
        name: "Fenerbahçe Parkı",
        capacity: 10000,
        distance: 2,
      },
      {
        id: "sz-005",
        name: "Göztepe Parkı",
        capacity: 5000,
        distance: 3,
      },
    ],
    specialNeeds: {
      hospitals: 3,
      schools: 25,
      elderlyFacilities: 5,
      criticalInfrastructure: ["Haydarpaşa Limanı", "Kadıköy İskelesi", "ISKI Tesisleri"],
    },
    estimatedEvacuationTime: {
      bestCase: 3,
      worstCase: 12,
      bottlenecks: ["Kadıköy Merkez", "D-100 Bağlantı Noktaları", "Sahil Yolu Darboğazları"],
    },
    notes: "Deniz yoluyla tahliye alternatif olarak değerlendirilmeli.",
  },
]

/**
 * Deprem anında yapılması gerekenler
 */
export const earthquakeSafetyGuidelines = {
  during: [
    "Panik yapmayın, sakin kalmaya çalışın.",
    "Çök-Kapan-Tutun hareketini uygulayın: Yere çökün, başınızı ve boynunuzu koruyun, sağlam bir mobilyaya tutunun.",
    "Mümkünse sağlam bir masa altına girin ve masanın ayağını sıkıca tutun.",
    "Pencerelerden, dış duvarlardan, cam eşyalardan uzak durun.",
    "Bina içindeyseniz, dışarı çıkmaya çalışmayın.",
    "Yataktaysanız, bir yastıkla başınızı koruyun ve yerinizden kalkmayın.",
    "Dışarıdaysanız, binalardan, ağaçlardan, elektrik direklerinden uzak, açık bir alana gidin.",
    "Araç kullanıyorsanız, güvenli bir yerde durun, köprü ve viyadüklerden uzak durun.",
  ],
  after: [
    "Deprem durduğunda, etrafınızı kontrol edin ve güvenli bir şekilde binayı terk edin.",
    "Asansör kullanmayın, merdivenleri tercih edin.",
    "Gaz, su ve elektrik vanalarını/şalterlerini kapatın.",
    "Yangın çıkma ihtimaline karşı dikkatli olun.",
    "Hafif yaralanmalar için ilk yardım uygulayın, ağır yaralıları hareket ettirmeyin.",
    "Radyo veya diğer iletişim araçlarıyla resmi duyuruları takip edin.",
    "Telefon hatlarını meşgul etmeyin, sadece acil durumlar için kullanın.",
    "Güvenli bir bölgeye gidin ve yetkililerin talimatlarını bekleyin.",
    "Artçı sarsıntılara karşı hazırlıklı olun, hasarlı binalara girmeyin.",
    "Çevrenizdeki yaralılara yardım edin ve arama kurtarma çalışmalarına destek olun.",
  ],
  preparation: [
    "Acil durum planı hazırlayın ve aile üyeleriyle paylaşın.",
    "Acil durum çantası hazırlayın (su, gıda, ilaç, el feneri, radyo, pil, düdük, nakit para, önemli belgeler).",
    "Evinizde güvenli ve tehlikeli alanları belirleyin.",
    "Gaz, su ve elektrik vanalarının/şalterlerinin yerlerini öğrenin.",
    "Mobilyaları sabitleyin, ağır eşyaları alt raflara yerleştirin.",
    "Bina dayanıklılığını kontrol ettirin ve gerekirse güçlendirme yapın.",
    "Deprem sigortası yaptırın.",
    "Düzenli tatbikatlar yapın ve ilk yardım eğitimi alın.",
    "Yakın çevredeki toplanma alanlarını ve güvenli bölgeleri öğrenin.",
  ],
}

/**
 * Belirli bir konum için deprem risk analizi yapar
 * @param lat Enlem
 * @param lon Boylam
 * @param buildingYear Bina yapım yılı
 * @param buildingType Bina tipi
 * @returns Risk analizi sonucu
 */
export function performRiskAnalysis(
  lat: number,
  lon: number,
  buildingYear: number,
  buildingType: string,
): RiskAnalysisResult {
  // Gerçek bir uygulamada bu fonksiyon çok daha karmaşık olacaktır
  // Burada basitleştirilmiş bir örnek sunuyoruz

  // Örnek veri
  return {
    location: {
      lat,
      lon,
      address: "Örnek Mahallesi, Örnek Sokak No:1",
      city: "İstanbul",
      district: "Kadıköy",
    },
    riskLevel: "high",
    riskScore: 75,
    nearbyFaults: [
      {
        name: "Kuzey Anadolu Fayı - Marmara Segmenti",
        distance: 15,
        maxMagnitude: 7.6,
        ruptureProb30Years: 0.65,
      },
      {
        name: "Kuzey Anadolu Fayı - İstanbul Segmenti",
        distance: 25,
        maxMagnitude: 7.4,
        ruptureProb30Years: 0.72,
      },
    ],
    soilCondition: {
      type: "Alüvyon",
      amplification: 1.8,
      liquefactionRisk: "medium",
      vs30: 320,
    },
    buildingVulnerability: {
      constructionYear: buildingYear,
      buildingType,
      heightCategory: "5-8 kat",
      vulnerabilityScore: 65,
      estimatedCollapseRate: 0.3,
    },
    historicalEarthquakes: [
      {
        year: 1999,
        magnitude: 7.6,
        distance: 80,
        impact: "Orta şiddette hissedildi, hafif hasar",
      },
      {
        year: 1894,
        magnitude: 7.0,
        distance: 30,
        impact: "Şiddetli hissedildi, ağır hasar",
      },
    ],
    expectedIntensity: {
      mmi: 8,
      pga: 0.35,
      pgv: 45,
    },
    recommendations: [
      "Bina güçlendirme çalışması yapılmalı",
      "Acil durum planı hazırlanmalı",
      "Deprem sigortası yaptırılmalı",
      "Yakın çevredeki güvenli alanlar belirlenmeli",
      "Düzenli deprem tatbikatları yapılmalı",
    ],
  }
}
