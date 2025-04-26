import type { GelismisDepremVerisi } from "../types"

/**
 * Farklı kaynaklardan gelen benzer depremleri gruplar
 * @param depremler Farklı kaynaklardan gelen deprem verileri dizisi
 * @returns Gruplandırılmış ve birleştirilmiş deprem verileri
 */
export function benzerDepremleriGrupla(depremler: GelismisDepremVerisi[]): GelismisDepremVerisi[] {
  // Zamana göre sırala (en yeni en üstte) tutarlı gruplandırma için
  const siraliVeriler = [...depremler].sort((a, b) => new Date(b.zaman).getTime() - new Date(a.zaman).getTime())

  // Benzer depremlerin gruplarını oluştur
  const gruplar: GelismisDepremVerisi[][] = []

  // İşlenen depremleri takip et
  const islenenler = new Set<string>()

  for (const deprem of siraliVeriler) {
    // Zaten işlendiyse atla
    if (islenenler.has(deprem.id)) continue

    // İşlendi olarak işaretle
    islenenler.add(deprem.id)

    // Bu depremle yeni bir grup oluştur
    const grup: GelismisDepremVerisi[] = [deprem]

    // Benzer depremleri bul
    for (const aday of siraliVeriler) {
      if (islenenler.has(aday.id) || aday.id === deprem.id) continue

      // Depremlerin benzer olup olmadığını kontrol et (farklı kaynaklardan bildirilen aynı olay)
      if (benzerDepremlerMi(deprem, aday)) {
        grup.push(aday)
        islenenler.add(aday.id)
      }
    }

    gruplar.push(grup)
  }

  // Her grubu tek bir kayda birleştir
  return gruplar.map(depremGrubunuBirlestir)
}

/**
 * İki depremin muhtemelen aynı olay olup olmadığını belirler
 */
function benzerDepremlerMi(a: GelismisDepremVerisi, b: GelismisDepremVerisi): boolean {
  // Zaman farkı (dakika olarak)
  const zamanFarkiMs = Math.abs(new Date(a.zaman).getTime() - new Date(b.zaman).getTime())
  const zamanFarkiDakika = zamanFarkiMs / (60 * 1000)

  // Merkez üsleri arasındaki mesafe (km olarak)
  const mesafe = mesafeHesapla(a.enlem, a.boylam, b.enlem, b.boylam)

  // Büyüklük farkı
  const buyuklukFarki = Math.abs(a.buyukluk - b.buyukluk)

  // Benzerlik kriterleri:
  // 1. 10 dakikadan az zaman farkı
  // 2. 50 km'den az mesafe
  // 3. 0.5'ten az büyüklük farkı
  return zamanFarkiDakika < 10 && mesafe < 50 && buyuklukFarki < 0.5
}

/**
 * Haversine formülünü kullanarak iki koordinat arasındaki mesafeyi hesaplar
 * @returns Kilometre cinsinden mesafe
 */
function mesafeHesapla(enlem1: number, boylam1: number, enlem2: number, boylam2: number): number {
  const R = 6371 // Dünya'nın yarıçapı (km)
  const dEnlem = radyanaCevir(enlem2 - enlem1)
  const dBoylam = radyanaCevir(boylam2 - boylam1)

  const a =
    Math.sin(dEnlem / 2) * Math.sin(dEnlem / 2) +
    Math.cos(radyanaCevir(enlem1)) * Math.cos(radyanaCevir(enlem2)) * Math.sin(dBoylam / 2) * Math.sin(dBoylam / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function radyanaCevir(derece: number): number {
  return (derece * Math.PI) / 180
}

/**
 * Benzer depremlerin bir grubunu tek bir kayda birleştirir
 */
function depremGrubunuBirlestir(grup: GelismisDepremVerisi[]): GelismisDepremVerisi {
  // Sadece bir kayıt varsa, onu döndür
  if (grup.length === 1) {
    return {
      ...grup[0],
      kaynaklar: [
        {
          ad: grup[0].kaynak,
          buyukluk: grup[0].buyukluk,
          buyuklukTipi: grup[0].buyuklukTipi,
          zaman: grup[0].zaman,
          derinlik: grup[0].derinlik,
          konum: grup[0].konum,
        },
      ],
      guvenSeviyesi: "tek-kaynak",
      birlestirmeBilgisi: {
        birlestirilmisSayi: 1,
        kaynakAdlari: [grup[0].kaynak],
        buyuklukVaryans: 0,
        derinlikVaryans: 0,
        konumVaryans: 0,
        zamanVaryans: 0,
      },
    }
  }

  // Kaynak güvenilirliğine göre sırala (kaynak tercihlerine göre özelleştirilebilir)
  const siraliGrup = [...grup].sort((a, b) => {
    const kaynakSiralamasi: Record<string, number> = {
      USGS: 5,
      EMSC: 4,
      "Kandilli Observatory": 4,
      AFAD: 4,
      "AFAD Official": 5,
      "Kandilli Observatory Direct": 5,
    }

    return (kaynakSiralamasi[b.kaynak] || 0) - (kaynakSiralamasi[a.kaynak] || 0)
  })

  // En güvenilir kaynağı temel olarak kullan
  const temel = siraliGrup[0]

  // Güven seviyesi için varyansları hesapla
  const buyuklukler = grup.map((q) => q.buyukluk)
  const derinlikler = grup.map((q) => q.derinlik)
  const zamanlar = grup.map((q) => new Date(q.zaman).getTime())
  const konumlar = grup.map((q) => ({ lat: q.enlem, lon: q.boylam }))

  const buyuklukVaryans = varyansHesapla(buyuklukler)
  const derinlikVaryans = varyansHesapla(derinlikler)
  const zamanVaryans = varyansHesapla(zamanlar) / (60 * 1000) // Dakikaya çevir

  // Ortalama konum varyansını km cinsinden hesapla
  let toplamMesafe = 0
  for (let i = 0; i < konumlar.length; i++) {
    for (let j = i + 1; j < konumlar.length; j++) {
      toplamMesafe += mesafeHesapla(konumlar[i].lat, konumlar[i].lon, konumlar[j].lat, konumlar[j].lon)
    }
  }
  const konumVaryans = toplamMesafe / ((konumlar.length * (konumlar.length - 1)) / 2)

  // Güven seviyesini belirle
  let guvenSeviyesi: "yuksek" | "orta" | "dusuk" | "tek-kaynak" = "orta"

  if (buyuklukVaryans < 0.2 && derinlikVaryans < 5 && konumVaryans < 10) {
    guvenSeviyesi = "yuksek"
  } else if (buyuklukVaryans > 0.5 || derinlikVaryans > 15 || konumVaryans > 30) {
    guvenSeviyesi = "dusuk"
  }

  // Kaynak bilgilerini oluştur
  const kaynaklar = grup.map((q) => ({
    ad: q.kaynak,
    buyukluk: q.buyukluk,
    buyuklukTipi: q.buyuklukTipi,
    zaman: q.zaman,
    derinlik: q.derinlik,
    konum: q.konum,
  }))

  // Birleştirilmiş kaydı oluştur
  return {
    ...temel,
    kaynaklar,
    guvenSeviyesi,
    birlestirmeBilgisi: {
      birlestirilmisSayi: grup.length,
      kaynakAdlari: grup.map((q) => q.kaynak),
      buyuklukVaryans,
      derinlikVaryans,
      konumVaryans,
      zamanVaryans,
    },
  }
}

/**
 * Sayı dizisinin varyansını hesaplar
 */
function varyansHesapla(degerler: number[]): number {
  if (degerler.length <= 1) return 0

  const ortalama = degerler.reduce((toplam, deger) => toplam + deger, 0) / degerler.length
  const kareFarklar = degerler.map((deger) => Math.pow(deger - ortalama, 2))
  return kareFarklar.reduce((toplam, deger) => toplam + deger, 0) / degerler.length
}
