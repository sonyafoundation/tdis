// Deprem verisi işleme için yardımcı işlevler

// Büyüklüğe göre enerji salınımını hesapla (jul cinsinden)
export function enerjiSaliniminiHesapla(buyukluk: number): number {
  // Enerji (jul) = 10^(1.5*büyüklük + 4.8)
  return Math.pow(10, 1.5 * buyukluk + 4.8)
}

// Büyüklük, derinlik ve kıyı konumuna göre tsunami riskini tahmin et
export function tsunamiRiskiniHesapla(buyukluk: number, derinlik: number, kiyiMi: boolean): number {
  if (!kiyiMi) return 0

  // Temel tsunami risk modeli
  // Daha yüksek büyüklük, daha sığ derinlik ve kıyı konumu riski artırır
  if (buyukluk < 6.5) return 0

  let risk = (buyukluk - 6.5) * 0.2 // Büyüklükten kaynaklanan temel risk

  // Derinlik faktörü (daha sığ = daha yüksek risk)
  const derinlikFaktoru = Math.max(0, 1 - derinlik / 100)
  risk *= derinlikFaktoru

  return Math.min(1, risk) // %100'de sınırla
}

// Konum kıyıda mı kontrol et
export function kiyiKonumuMu(konum: string): boolean {
  const kiyiAnahtarKelimeleri = [
    "deniz",
    "kıyı",
    "sahil",
    "ege",
    "akdeniz",
    "karadeniz",
    "marmara",
    "sea",
    "coast",
    "shore",
    "aegean",
    "mediterranean",
    "black sea",
  ]

  const kucukKonum = konum.toLowerCase()
  return kiyiAnahtarKelimeleri.some((anahtar) => kucukKonum.includes(anahtar))
}

// Konum dizesinden bölge/şehir çıkar
export function bolgeAyikla(konum: string): string {
  // Türkiye'deki yaygın şehir isimleri ve bölgeler
  const turkiyeSehirleri = [
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

  // Türkiye'nin bölgeleri
  const turkiyeBolgeleri = [
    "Marmara",
    "Ege",
    "Akdeniz",
    "İç Anadolu",
    "Karadeniz",
    "Doğu Anadolu",
    "Güneydoğu Anadolu",
    "Marmara Bölgesi",
    "Ege Bölgesi",
    "Akdeniz Bölgesi",
    "İç Anadolu Bölgesi",
    "Karadeniz Bölgesi",
    "Doğu Anadolu Bölgesi",
    "Güneydoğu Anadolu Bölgesi",
  ]

  // Önce şehirleri kontrol et
  for (const sehir of turkiyeSehirleri) {
    if (konum.includes(sehir)) {
      return sehir
    }
  }

  // Sonra bölgeleri kontrol et
  for (const bolge of turkiyeBolgeleri) {
    if (konum.includes(bolge)) {
      return bolge
    }
  }

  // Eşleşme yoksa, virgül veya parantezden önceki ilk kısmı çıkarmaya çalış
  const parcalar = konum.split(/[,()]/)
  if (parcalar.length > 0 && parcalar[0].trim()) {
    return parcalar[0].trim()
  }

  return "Bilinmeyen Bölge"
}

// Deprem için benzersiz ID oluştur
export function depremIdOlustur(kaynak: string, benzersizTanimlayici?: string | number): string {
  const temizKaynak = kaynak.toLowerCase().replace(/\s+/g, "-")
  const tanimlayici = benzersizTanimlayici || Date.now()
  const rastgele = Math.random().toString(36).substring(2, 10)

  return `${temizKaynak}-${tanimlayici}-${rastgele}`
}

// İki konum arasındaki mesafeyi hesapla (km cinsinden)
export function mesafeHesapla(enlem1: number, boylam1: number, enlem2: number, boylam2: number): number {
  const R = 6371 // Dünya'nın yarıçapı (km)
  const dLat = dereceyiRadyanaÇevir(enlem2 - enlem1)
  const dLon = dereceyiRadyanaÇevir(boylam2 - boylam1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(dereceyiRadyanaÇevir(enlem1)) *
      Math.cos(dereceyiRadyanaÇevir(enlem2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Dereceyi radyana çevir
function dereceyiRadyanaÇevir(derece: number): number {
  return (derece * Math.PI) / 180
}

// Deprem dalgalarının varış süresini hesapla (saniye cinsinden)
export function dalgaVarisSuresiniHesapla(mesafe: number, dalgaTipi: "p" | "s" = "p", derinlik = 10): number {
  // Basitleştirilmiş dalga hızı modeli (km/s)
  const pDalgaHizi = 6.0 // P-dalgası hızı
  const sDalgaHizi = 3.5 // S-dalgası hızı

  // Hiposentral mesafeyi hesapla (yüzey mesafesi + derinlik)
  const hiposentralMesafe = Math.sqrt(Math.pow(mesafe, 2) + Math.pow(derinlik, 2))

  // Dalga tipine göre varış süresini hesapla
  if (dalgaTipi === "p") {
    return hiposentralMesafe / pDalgaHizi
  } else {
    return hiposentralMesafe / sDalgaHizi
  }
}

// Deprem şiddetini tahmin et (MMI ölçeği)
export function siddetiTahminEt(buyukluk: number, mesafe: number, derinlik: number): number {
  // Basitleştirilmiş şiddet modeli
  // Büyüklük arttıkça şiddet artar, mesafe ve derinlik arttıkça azalır

  // Hiposentral mesafeyi hesapla
  const hiposentralMesafe = Math.sqrt(Math.pow(mesafe, 2) + Math.pow(derinlik, 2))

  // Temel şiddet formülü (basitleştirilmiş)
  const siddet = 1.5 * buyukluk - 0.5 * Math.log10(hiposentralMesafe) - 0.5

  // Şiddeti 1-12 aralığında sınırla (MMI ölçeği)
  return Math.max(1, Math.min(12, Math.round(siddet)))
}
