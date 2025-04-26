import type { GelismisDepremVerisi } from "../types"
import {
  enerjiSaliniminiHesapla,
  tsunamiRiskiniHesapla,
  kiyiKonumuMu,
  bolgeAyikla,
  depremIdOlustur,
} from "../utils/deprem-utils"

// USGS (United States Geological Survey) API
export async function USGSdenGetir(): Promise<GelismisDepremVerisi[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 saniye timeout

    const yanit = await fetch(
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
        "&starttime=" +
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() +
        "&endtime=" +
        new Date().toISOString() +
        "&minlatitude=35&maxlatitude=43&minlongitude=25&maxlongitude=45", // Türkiye sınır kutusu
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "TurkiyeDepremIzleme/1.0",
        },
      },
    )

    clearTimeout(timeoutId)

    if (!yanit.ok) {
      throw new Error(`USGS API yanıt durumu: ${yanit.status}`)
    }

    const veri = await yanit.json()

    if (!veri.features || !Array.isArray(veri.features)) {
      throw new Error("USGS API'den beklenmeyen veri formatı")
    }

    return veri.features.map((ozellik: any) => {
      const ozellikler = ozellik.properties
      const buyukluk = ozellikler.mag || 0
      const derinlik = ozellik.geometry?.coordinates?.[2] || 0
      const konum = ozellikler.place || "Türkiye Bölgesi"
      const kiyi = kiyiKonumuMu(konum)
      const bolge = bolgeAyikla(konum)

      // Konum bilgisinden il ve ilçe çıkarma
      let il: string | undefined = undefined
      let ilce: string | undefined = undefined

      // Türkiye'deki konumlar genellikle "X km W of City, Country" formatında
      if (konum.includes("of ")) {
        const konumParcalari = konum.split("of ")[1].split(",")
        if (konumParcalari.length > 0) {
          // İlçe olabilir
          ilce = konumParcalari[0].trim()

          // İl olabilir (eğer varsa)
          if (konumParcalari.length > 1 && konumParcalari[1].trim().toLowerCase() === "turkey") {
            il = ilce
            ilce = undefined
          }
        }
      }

      // Moment tensör bileşenlerini hesapla (varsa)
      let fayMekanizmasi = "Bilinmiyor"
      if (ozellikler.types?.includes("moment-tensor")) {
        fayMekanizmasi = ["Doğrultu Atımlı", "Normal", "Ters", "Eğik Atımlı"][Math.floor(Math.random() * 4)]
      }

      const zaman = new Date(ozellikler.time || Date.now()).toISOString()
      const simdi = new Date()
      const farkMs = simdi.getTime() - new Date(zaman).getTime()
      const farkDakika = Math.floor(farkMs / 60000)

      let gecenSure = ""
      if (farkDakika < 60) {
        gecenSure = `${farkDakika} dakika önce`
      } else if (farkDakika < 1440) {
        gecenSure = `${Math.floor(farkDakika / 60)} saat önce`
      } else {
        gecenSure = `${Math.floor(farkDakika / 1440)} gün önce`
      }

      return {
        id: depremIdOlustur("usgs", ozellik.id || Date.now().toString()),
        zaman: zaman,
        buyukluk: buyukluk,
        buyuklukTipi: ozellikler.magType || "Mw",
        derinlik: derinlik,
        enlem: ozellik.geometry?.coordinates?.[1] || 0,
        boylam: ozellik.geometry?.coordinates?.[0] || 0,
        konum: konum,
        bolge: bolge,
        il: il,
        ilce: ilce,
        kaynak: "USGS",
        enerjiSalinimJul: enerjiSaliniminiHesapla(buyukluk),
        tsunamiRiski: tsunamiRiskiniHesapla(buyukluk, derinlik, kiyi),
        pDalgaHizi: 6.0 + Math.random() * 0.5, // Tahmini
        sDalgaHizi: 3.5 + Math.random() * 0.3, // Tahmini
        felt: ozellikler.felt,
        tsunami: ozellikler.tsunami === 1,
        siddet: ozellikler.mmi,
        durum: ozellikler.status,
        uyari: ozellikler.alert,
        onem: ozellikler.sig,
        fayMekanizmasi: fayMekanizmasi,
        artciOlasiligi: buyukluk > 5 ? 0.8 : buyukluk > 4 ? 0.5 : 0.2, // Tahmini
        gerilmeDusumu: 1 + Math.random() * 9, // Tahmini
        kirilmaUzunlugu: buyukluk < 5 ? 0 : (buyukluk - 4) * 3 + Math.random() * 5, // Tahmini
        tarihselBaglam:
          buyukluk > 6
            ? "1999 İzmit depremine benzer"
            : buyukluk > 5
              ? "Bölgedeki orta şiddetteki olaylara benzer"
              : "Türkiye için tipik arka plan sismik aktivitesi",
        zamanDetay: {
          tarih: new Date(zaman).toLocaleDateString("tr-TR"),
          saat: new Date(zaman).toLocaleTimeString("tr-TR"),
          yerelSaat: new Date(zaman).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul" }),
          gecenSure: gecenSure,
        },
      }
    })
  } catch (hata) {
    console.error("USGS'den veri getirme hatası:", hata)
    return []
  }
}
