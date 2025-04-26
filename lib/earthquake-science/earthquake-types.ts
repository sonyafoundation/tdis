export interface EarthquakeType {
  id: string
  name: string
  nameEn: string
  description: string
  characteristics: string[]
  causes: string[]
  examples?: string[]
}

export const earthquakeTypes: Record<string, EarthquakeType> = {
  tectonic: {
    id: "tectonic",
    name: "Tektonik Deprem",
    nameEn: "Tectonic Earthquake",
    description: "Tektonik plakaların hareketinden kaynaklanan en yaygın deprem türüdür.",
    characteristics: [
      "Fay hatları boyunca oluşur",
      "Genellikle daha büyük magnitüdlü olur",
      "Geniş alanlarda hissedilebilir",
      "Artçı şoklar görülür",
    ],
    causes: ["Tektonik plaka hareketleri", "Fay hatlarındaki gerilim birikimi", "Kırılma ve enerji salınımı"],
    examples: ["1999 İzmit Depremi (Mw 7.6)", "2011 Tohoku Depremi (Mw 9.0)", "2023 Kahramanmaraş Depremi (Mw 7.8)"],
  },
  volcanic: {
    id: "volcanic",
    name: "Volkanik Deprem",
    nameEn: "Volcanic Earthquake",
    description: "Volkanik aktivite sonucu oluşan depremlerdir.",
    characteristics: [
      "Volkan çevresinde lokalize",
      "Genellikle daha küçük magnitüdlü",
      "Volkanik püskürme öncesi artabilir",
      "Sığ odaklı",
    ],
    causes: ["Magma hareketleri", "Volkanik gaz basıncı", "Hidrotermal aktivite"],
    examples: ["Etna Yanardağı depremleri", "Hawaii Kilauea depremleri"],
  },
  collapse: {
    id: "collapse",
    name: "Çöküntü Depremi",
    nameEn: "Collapse Earthquake",
    description: "Yeraltı boşluklarının çökmesi sonucu oluşan depremlerdir.",
    characteristics: ["Çok lokalize etki alanı", "Düşük magnitüd", "Kısa süreli", "Sığ odaklı"],
    causes: ["Maden çökmeleri", "Karstik boşlukların çökmesi", "Yeraltı su seviyesindeki değişimler"],
    examples: ["Maden bölgelerindeki çöküntü depremleri", "Karstik arazilerdeki çöküntüler"],
  },
  explosion: {
    id: "explosion",
    name: "Patlama Depremi",
    nameEn: "Explosion Earthquake",
    description: "Doğal veya yapay patlamalar sonucu oluşan depremlerdir.",
    characteristics: ["Ani başlangıç", "Kısa süreli", "P dalgası baskın", "Yüzeye yakın"],
    causes: ["Nükleer testler", "Madencilik patlamaları", "Doğal gaz patlamaları"],
    examples: ["Nükleer test patlamaları", "Büyük endüstriyel patlamalar"],
  },
  induced: {
    id: "induced",
    name: "İndüklenmiş Deprem",
    nameEn: "Induced Earthquake",
    description: "İnsan faaliyetleri sonucu tetiklenen depremlerdir.",
    characteristics: [
      "Genellikle düşük-orta magnitüdlü",
      "İnsan faaliyetleriyle ilişkili",
      "Sığ odaklı",
      "Belirli bölgelerde yoğunlaşır",
    ],
    causes: ["Hidrolik çatlatma (fracking)", "Baraj rezervuarları", "Derin kuyu enjeksiyonu", "Yeraltı madenciliği"],
    examples: ["Oklahoma indüklenmiş depremleri", "Basel jeotermal projesi depremleri"],
  },
}

export interface AftershockInfo {
  probability: number // 0-1 arası olasılık
  expectedCount: number // Beklenen artçı sayısı
  durationDays: number // Beklenen süre (gün)
  magnitudeRange: {
    min: number
    max: number
  }
  description: string
}

/**
 * Ana deprem büyüklüğüne göre artçı deprem bilgilerini hesaplar
 * @param mainshockMagnitude Ana deprem büyüklüğü (Mw)
 * @returns Artçı deprem bilgileri
 */
export function calculateAftershockInfo(mainshockMagnitude: number): AftershockInfo {
  // Bath Yasası: En büyük artçı, ana depremden yaklaşık 1.2 birim daha küçüktür
  const largestAftershockMag = mainshockMagnitude - 1.2

  // Omori Yasası ve ampirik formüller kullanılarak hesaplamalar
  const probability = Math.min(0.95, 0.5 + (mainshockMagnitude - 5.0) * 0.1)
  const expectedCount = Math.round(Math.pow(10, mainshockMagnitude - 4.5))
  const durationDays = Math.round(Math.pow(10, (mainshockMagnitude - 5.0) / 2))

  let description = ""
  if (mainshockMagnitude >= 7.0) {
    description = "Çok sayıda ve güçlü artçı depremler beklenir. Aylarca sürebilir."
  } else if (mainshockMagnitude >= 6.0) {
    description = "Önemli sayıda artçı deprem beklenir. Haftalarca sürebilir."
  } else if (mainshockMagnitude >= 5.0) {
    description = "Orta düzeyde artçı depremler beklenir. Günlerce sürebilir."
  } else {
    description = "Az sayıda ve küçük artçı depremler beklenir. Kısa sürede sona erecektir."
  }

  return {
    probability,
    expectedCount,
    durationDays,
    magnitudeRange: {
      min: Math.max(2.0, mainshockMagnitude - 3.0),
      max: largestAftershockMag,
    },
    description,
  }
}
