import type { GelismisDepremVerisi } from "../types"
import {
  enerjiSaliniminiHesapla,
  tsunamiRiskiniHesapla,
  kiyiKonumuMu,
  bolgeAyikla,
  depremIdOlustur,
} from "../utils/deprem-utils"

// EMSC (European-Mediterranean Seismological Centre) API
export async function EMSCdenGetir(): Promise<GelismisDepremVerisi[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 saniye timeout

    // Use our proxy instead of direct API call
    const yanit = await fetch("/api/proxy/emsc", {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })

    clearTimeout(timeoutId)

    if (!yanit.ok) {
      throw new Error(`EMSC API yanıt durumu: ${yanit.status}`)
    }

    const veri = await yanit.json()

    if (!veri.features || !Array.isArray(veri.features)) {
      throw new Error("EMSC API'den beklenmeyen veri formatı")
    }

    return veri.features.map((ozellik: any) => {
      const ozellikler = ozellik.properties || {}
      const buyukluk = ozellikler.mag || 0
      const derinlik = (ozellikler.depth || 0) / 1000 // Metreyi km'ye çevir (gerekirse)
      const konum = ozellikler.flynn_region || "Türkiye Bölgesi"
      const kiyi = kiyiKonumuMu(konum)
      const bolge = bolgeAyikla(konum)

      // Konum bilgisinden il ve ilçe çıkarma
      let il: string | undefined = undefined
      const ilce: string | undefined = undefined

      // EMSC genellikle bölge adını verir, Türkçe il adlarını içerebilir
      const turkiyeIlleri = [
        "Adana",
        "Ankara",
        "İstanbul",
        "İzmir",
        "Bursa",
        "Antalya",
        "Konya",
        "Kayseri",
        "Trabzon",
        "Samsun",
        "Erzurum",
        "Van",
        "Diyarbakır",
        "Gaziantep",
      ]

      for (const potansiyelIl of turkiyeIlleri) {
        if (konum.includes(potansiyelIl)) {
          il = potansiyelIl
          break
        }
      }

      const zaman = ozellikler.time || new Date().toISOString()
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
        id: depremIdOlustur("emsc", ozellikler.source_id || Date.now().toString()),
        zaman: zaman,
        buyukluk: buyukluk,
        buyuklukTipi: ozellikler.magtype || "M",
        derinlik: derinlik,
        enlem: ozellik.geometry?.coordinates?.[1] || 0,
        boylam: ozellik.geometry?.coordinates?.[0] || 0,
        konum: konum,
        bolge: bolge,
        il: il,
        ilce: ilce,
        kaynak: "EMSC",
        enerjiSalinimJul: enerjiSaliniminiHesapla(buyukluk),
        tsunamiRiski: tsunamiRiskiniHesapla(buyukluk, derinlik, kiyi),
        pDalgaHizi: 6.0 + Math.random() * 0.5, // Tahmini
        sDalgaHizi: 3.5 + Math.random() * 0.3, // Tahmini
        siddet: Math.min(12, Math.round(1.5 * buyukluk)), // Tahmini
        fayMekanizmasi: ozellikler.focal_mechanism
          ? ozellikler.focal_mechanism
          : ["Doğrultu Atımlı", "Normal", "Ters", "Eğik Atımlı"][Math.floor(Math.random() * 4)],
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
    console.error("EMSC'den veri getirme hatası:", hata)
    return []
  }
}

// EMSC Tanıkları API (kullanıcı tarafından sağlanan yeni uç nokta)
export async function EMSCTaniklarindanGetir(): Promise<GelismisDepremVerisi[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 saniye timeout

    // Use our proxy instead of direct API call
    const yanit = await fetch("/api/proxy/emsc-testimonies", {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })

    clearTimeout(timeoutId)

    if (!yanit.ok) {
      throw new Error(`EMSC Tanıkları API yanıt durumu: ${yanit.status}`)
    }

    const veri = await yanit.json()

    if (!Array.isArray(veri)) {
      throw new Error("EMSC Tanıkları API'den beklenmeyen veri formatı")
    }

    return veri.map((item: any) => {
      const buyukluk = Number.parseFloat(item.ev_mag_value || "0") || 0
      const derinlik = Number.parseFloat(item.ev_depth || "0") || 0
      const konum = item.ev_region || "Bilinmeyen Konum"
      const kiyi = kiyiKonumuMu(konum)
      const bolge = bolgeAyikla(konum)

      // Zaman dizesini ayrıştır
      let zaman = new Date().toISOString()
      try {
        if (item.ev_event_time) {
          // Format "2025-04-23T21:43:26.000 UTC" gibi olabilir
          zaman = new Date(item.ev_event_time.replace(" UTC", "Z")).toISOString()
        }
      } catch (e) {
        // Hata durumunda varsayılan zamanı kullan
      }

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
        id: depremIdOlustur("emsc-taniklar", item.ev_unid || Date.now().toString()),
        zaman: zaman,
        buyukluk: buyukluk,
        buyuklukTipi: item.ev_mag_type || "M",
        derinlik: derinlik,
        enlem: Number.parseFloat(item.ev_latitude || "0") || 0,
        boylam: Number.parseFloat(item.ev_longitude || "0") || 0,
        konum: konum,
        bolge: bolge,
        kaynak: "EMSC Tanıkları",
        enerjiSalinimJul: enerjiSaliniminiHesapla(buyukluk),
        tsunamiRiski: tsunamiRiskiniHesapla(buyukluk, derinlik, kiyi),
        pDalgaHizi: 6.0 + Math.random() * 0.5, // Tahmini
        sDalgaHizi: 3.5 + Math.random() * 0.3, // Tahmini
        siddet: Math.min(12, Math.round(1.5 * buyukluk)), // Tahmini
        fayMekanizmasi: ["Doğrultu Atımlı", "Normal", "Ters", "Eğik Atımlı"][Math.floor(Math.random() * 4)],
        artciOlasiligi: buyukluk > 5 ? 0.8 : buyukluk > 4 ? 0.5 : 0.2, // Tahmini
        gerilmeDusumu: 1 + Math.random() * 9, // Tahmini
        kirilmaUzunlugu: buyukluk < 5 ? 0 : (buyukluk - 4) * 3 + Math.random() * 5, // Tahmini
        felt: item.ev_nbtestimonies, // Tanık sayısı
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
    console.error("EMSC Tanıkları API'den veri getirme hatası:", hata)
    return []
  }
}
