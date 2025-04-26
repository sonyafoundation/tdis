export interface EarlyWarningSystem {
  id: string
  name: string
  coverage: {
    country: string
    regions: string[]
    stations: number
    area: number // km²
  }
  capabilities: {
    detectionTime: number // seconds
    processingTime: number // seconds
    warningTime: number // seconds
    minimumMagnitude: number
    accuracyRate: number // 0-1
    falseAlarmRate: number // 0-1
  }
  warningMethods: string[]
  implementation: {
    cost: number // million $
    timeframe: number // months
    technicalRequirements: string[]
    challenges: string[]
  }
  benefits: {
    livesaved: number // estimated
    economicBenefit: number // million $
    costBenefitRatio: number
  }
}

export const earlyWarningSystems: EarlyWarningSystem[] = [
  {
    id: "ews-001",
    name: "Türkiye Ulusal Deprem Erken Uyarı Sistemi",
    coverage: {
      country: "Türkiye",
      regions: ["Marmara", "Ege", "İç Anadolu", "Doğu Anadolu", "Güneydoğu Anadolu"],
      stations: 1200,
      area: 783562, // Türkiye yüzölçümü (km²)
    },
    capabilities: {
      detectionTime: 3, // seconds
      processingTime: 2, // seconds
      warningTime: 5, // seconds
      minimumMagnitude: 4.5,
      accuracyRate: 0.9,
      falseAlarmRate: 0.05,
    },
    warningMethods: [
      "Cep telefonu uyarıları",
      "TV ve radyo yayınları",
      "Siren sistemleri",
      "Akıllı şehir sistemleri",
      "Otomatik gaz/elektrik kesme sistemleri",
    ],
    implementation: {
      cost: 150, // million $
      timeframe: 36, // months
      technicalRequirements: [
        "Sismik sensör ağı",
        "Yüksek hızlı veri iletim altyapısı",
        "Merkezi işlem sunucuları",
        "Uyarı dağıtım sistemleri",
        "Yedekli güç sistemleri",
      ],
      challenges: [
        "Coğrafi zorluklar",
        "Altyapı eksiklikleri",
        "Finansman sorunları",
        "Kurumlar arası koordinasyon",
        "Halkın bilinçlendirilmesi",
      ],
    },
    benefits: {
      livesaved: 50000, // estimated
      economicBenefit: 5000, // million $
      costBenefitRatio: 33.3, // 5000/150
    },
  },
  {
    id: "ews-002",
    name: "İstanbul Deprem Erken Uyarı Sistemi",
    coverage: {
      country: "Türkiye",
      regions: ["İstanbul", "Marmara Bölgesi"],
      stations: 300,
      area: 5461, // İstanbul yüzölçümü (km²)
    },
    capabilities: {
      detectionTime: 2, // seconds
      processingTime: 1, // seconds
      warningTime: 3, // seconds
      minimumMagnitude: 4.0,
      accuracyRate: 0.95,
      falseAlarmRate: 0.03,
    },
    warningMethods: [
      "Cep telefonu uyarıları",
      "Akıllı şehir ekranları",
      "Toplu taşıma sistemleri",
      "Kritik altyapı otomatik durdurma",
      "Bina içi uyarı sistemleri",
    ],
    implementation: {
      cost: 50, // million $
      timeframe: 24, // months
      technicalRequirements: [
        "Yoğun sismik sensör ağı",
        "Fiber optik iletişim altyapısı",
        "Bulut tabanlı işlem sistemleri",
        "Mobil uygulama altyapısı",
        "IoT entegrasyonu",
      ],
      challenges: ["Yoğun yerleşim", "Eski bina stoku", "Trafik sorunları", "Teknolojik altyapı eksiklikleri"],
    },
    benefits: {
      livesaved: 30000, // estimated
      economicBenefit: 3000, // million $
      costBenefitRatio: 60, // 3000/50
    },
  },
]

export interface EarlyWarningMessage {
  id: string
  eventTime: string
  detectionTime: string
  magnitude: number
  depth: number
  location: {
    lat: number
    lon: number
    description: string
  }
  intensity: {
    mmi: number
    description: string
  }
  arrivalTimes: {
    pWave: number // seconds from now
    sWave: number // seconds from now
  }
  actions: string[]
  updateFrequency: number // seconds
  confidence: number // 0-1
  source: string
}

/**
 * Deprem erken uyarı mesajı oluşturur
 * @param magnitude Deprem büyüklüğü
 * @param depth Deprem derinliği (km)
 * @param lat Enlem
 * @param lon Boylam
 * @param distance Kullanıcıya mesafe (km)
 * @returns Erken uyarı mesajı
 */
export function generateEarlyWarningMessage(
  magnitude: number,
  depth: number,
  lat: number,
  lon: number,
  distance: number,
): EarlyWarningMessage {
  const now = new Date()
  const eventTime = new Date(now.getTime() - 5000) // 5 saniye önce
  const detectionTime = new Date(now.getTime() - 2000) // 2 saniye önce

  // P ve S dalgası hızları (km/s)
  const pWaveVelocity = 6.0
  const sWaveVelocity = 3.5

  // Dalga varış süreleri (saniye)
  const pWaveArrival = distance / pWaveVelocity
  const sWaveArrival = distance / sWaveVelocity

  // Kalan süre (saniye)
  const pWaveRemaining = Math.max(0, pWaveArrival - 5) // 5 saniye geçti
  const sWaveRemaining = Math.max(0, sWaveArrival - 5) // 5 saniye geçti

  // MMI şiddeti tahmini (basitleştirilmiş)
  const mmi = estimateMMI(magnitude, depth, distance)

  // Şiddet açıklaması
  let intensityDescription = ""
  if (mmi >= 8) intensityDescription = "Şiddetli sarsıntı, ağır hasar riski"
  else if (mmi >= 6) intensityDescription = "Güçlü sarsıntı, orta hasar riski"
  else if (mmi >= 4) intensityDescription = "Orta şiddette sarsıntı, hafif hasar riski"
  else intensityDescription = "Hafif sarsıntı, hasar riski düşük"

  // Önerilen eylemler
  const actions = generateActions(mmi, sWaveRemaining)

  // Güven seviyesi (büyüklük ve derinliğe göre)
  const confidence = Math.min(0.95, 0.7 + (magnitude - 4.0) * 0.05)

  return {
    id: `ew-${Date.now()}`,
    eventTime: eventTime.toISOString(),
    detectionTime: detectionTime.toISOString(),
    magnitude,
    depth,
    location: {
      lat,
      lon,
      description: "Marmara Denizi, Silivri açıkları",
    },
    intensity: {
      mmi,
      description: intensityDescription,
    },
    arrivalTimes: {
      pWave: pWaveRemaining,
      sWave: sWaveRemaining,
    },
    actions,
    updateFrequency: 5, // 5 saniyede bir güncelleme
    confidence,
    source: "Kandilli Rasathanesi",
  }
}

/**
 * MMI şiddetini tahmin eder
 */
function estimateMMI(magnitude: number, depth: number, distance: number): number {
  // Basitleştirilmiş MMI hesaplama formülü
  const baseMMI = 2.5 * magnitude - 1.0

  // Mesafe ve derinlik düzeltmesi
  const attenuation = 1.5 * Math.log10(Math.sqrt(distance * distance + depth * depth))

  // Sonuç (1-12 arasında sınırla)
  return Math.max(1, Math.min(12, Math.round(baseMMI - attenuation)))
}

/**
 * Önerilen eylemleri oluşturur
 */
function generateActions(mmi: number, timeRemaining: number): string[] {
  const actions = []

  if (timeRemaining < 5) {
    actions.push("HEMEN KORUNMA POZİSYONU ALIN!")
    actions.push("Çök-Kapan-Tutun hareketini uygulayın.")
    actions.push("Başınızı ve boynunuzu koruyun.")
  } else if (timeRemaining < 15) {
    actions.push("Hızlıca güvenli bir yer bulun.")
    actions.push("Pencerelerden ve dış duvarlardan uzaklaşın.")
    actions.push("Sağlam bir masa altına girin veya iç duvar dibine çökün.")
  } else {
    actions.push("Sakin olun ve binayı güvenli şekilde terk edin.")
    actions.push("Asansör kullanmayın, merdivenleri tercih edin.")
    actions.push("Açık bir alana gidin, binalardan uzak durun.")
  }

  if (mmi >= 8) {
    actions.push("Şiddetli sarsıntıya hazırlanın, yere yakın pozisyon alın.")
  }

  return actions
}

/**
 * Erken uyarı sistemi projesi maliyet hesaplaması
 * @param coverage Kapsama alanı (km²)
 * @param population Nüfus
 * @param stationDensity İstasyon yoğunluğu (istasyon/km²)
 * @returns Maliyet ve fayda analizi
 */
export function calculateEarlyWarningSystemCost(
  coverage: number,
  population: number,
  stationDensity: number,
): {
  initialCost: number // million $
  annualMaintenanceCost: number // million $
  stationCount: number
  implementationTime: number // months
  benefitCostRatio: number
  livesavedEstimate: number
  economicBenefitEstimate: number // million $
} {
  // İstasyon sayısı
  const stationCount = Math.ceil(coverage * stationDensity)

  // İstasyon başına maliyet (ortalama $50,000)
  const stationCost = stationCount * 0.05 // million $

  // Altyapı maliyeti
  const infrastructureCost = Math.sqrt(coverage) * 0.2 // million $

  // Yazılım ve işlem merkezi maliyeti
  const softwareCost = 10 + (population / 10000000) * 5 // million $

  // Toplam başlangıç maliyeti
  const initialCost = stationCost + infrastructureCost + softwareCost

  // Yıllık bakım maliyeti (başlangıç maliyetinin %10'u)
  const annualMaintenanceCost = initialCost * 0.1

  // Uygulama süresi
  const implementationTime = Math.max(12, Math.min(48, Math.ceil(stationCount / 100) * 6))

  // Kurtarılan can tahmini (her 1 milyon kişi için 500 can)
  const livesavedEstimate = Math.ceil((population / 1000000) * 500)

  // Ekonomik fayda tahmini (kurtarılan can başına $2 milyon + altyapı koruması)
  const economicBenefitEstimate = livesavedEstimate * 2 + (population / 1000000) * 100

  // Fayda/maliyet oranı
  const benefitCostRatio = economicBenefitEstimate / initialCost

  return {
    initialCost,
    annualMaintenanceCost,
    stationCount,
    implementationTime,
    benefitCostRatio,
    livesavedEstimate,
    economicBenefitEstimate,
  }
}
