import type { GelismisDepremVerisi } from "../types"

export async function UDIMXMLdenGetir(): Promise<GelismisDepremVerisi[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 saniye timeout

    const response = await fetch("/api/proxy/udim-xml", {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`UDIM XML API yanıt durumu: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error("UDIM XML API'den beklenmeyen veri formatı")
    }

    return data.map((item: any) => {
      // Convert EnhancedEarthquakeData to GelismisDepremVerisi
      const zaman = item.time
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
        id: item.id,
        zaman: item.time,
        buyukluk: item.magnitude,
        buyuklukTipi: item.magnitudeType,
        derinlik: item.depth,
        enlem: item.latitude,
        boylam: item.longitude,
        konum: item.location,
        bolge: item.region,
        il: undefined, // Extract from location if possible
        ilce: undefined, // Extract from location if possible
        kaynak: item.source,
        enerjiSalinimJul: item.energyRelease,
        tsunamiRiski: item.tsunamiRisk,
        pDalgaHizi: item.pWaveVelocity,
        sDalgaHizi: item.sWaveVelocity,
        siddet: item.intensity,
        fayMekanizmasi: item.faultMechanism,
        artciOlasiligi: item.aftershockProbability,
        gerilmeDusumu: item.stressDropEstimate,
        kirilmaUzunlugu: item.ruptureLength,
        tarihselBaglam: item.historicalContext,
        zamanDetay: {
          tarih: new Date(zaman).toLocaleDateString("tr-TR"),
          saat: new Date(zaman).toLocaleTimeString("tr-TR"),
          yerelSaat: new Date(zaman).toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul" }),
          gecenSure: gecenSure,
        },
      }
    })
  } catch (error) {
    console.error("UDIM XML API'den veri getirme hatası:", error)
    return []
  }
}
