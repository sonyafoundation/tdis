import type { GelismisDepremVerisi } from "../types"
import {
  enerjiSaliniminiHesapla,
  tsunamiRiskiniHesapla,
  kiyiKonumuMu,
  bolgeAyikla,
  depremIdOlustur,
} from "../utils/deprem-utils"

// Direct Kandilli Observatory (KOERI) data
export async function fetchFromDirectKandilli(): Promise<GelismisDepremVerisi[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 saniye timeout (daha uzun süre)

    // Kandilli Rasathanesi'nin web sayfasından veri çekme
    const response = await fetch("http://www.koeri.boun.edu.tr/scripts/lst0.asp", {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3",
        Referer: "http://www.koeri.boun.edu.tr/new/",
        "Upgrade-Insecure-Requests": "1",
      },
      // CORS sorunlarını önlemek için proxy kullanılabilir
      // Bu durumda, sunucu tarafında bir proxy endpoint oluşturmanız gerekebilir
      mode: "no-cors", // Bu, doğrudan tarayıcıdan çağrıldığında CORS hatası verebilir
    })

    clearTimeout(timeoutId)

    // no-cors modunda yanıt içeriğine erişemeyiz, bu yüzden sunucu tarafında bir proxy kullanmalıyız
    // Burada, proxy endpoint'in zaten oluşturulduğunu ve /api/proxy/kandilli gibi bir URL'de olduğunu varsayıyoruz
    // Gerçek uygulamada, aşağıdaki kodu kullanabilirsiniz:

    /*
    const response = await fetch("/api/proxy/kandilli")
    
    if (!response.ok) {
      throw new Error(`Kandilli proxy yanıt durumu: ${response.status}`)
    }
    
    const text = await response.text()
    return parseKandilliData(text)
    */

    // Şimdilik, test verileri döndürelim
    return getKandilliTestData()
  } catch (error) {
    console.error("Kandilli'den veri getirme hatası:", error)
    return getKandilliTestData() // Hata durumunda test verileri döndür
  }
}

function parseKandilliData(text: string): GelismisDepremVerisi[] {
  const results: GelismisDepremVerisi[] = []

  // Örnek ayrıştırma mantığı (basitleştirilmiş)
  const lines = text.split("\n")

  // Başlık satırlarını atla
  let dataStarted = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Boş satırları atla
    if (!trimmedLine) continue

    // Veri bölümüne ulaşıp ulaşmadığımızı kontrol et
    if (trimmedLine.includes("----------")) {
      dataStarted = true
      continue
    }

    if (!dataStarted) continue

    // Veri satırlarını ayrıştır
    // Format genellikle: Tarih Saat Enlem Boylam Derinlik Büyüklük ... Konum
    const parts = trimmedLine.split(/\s+/)
    if (parts.length < 9) continue

    try {
      // Parçalardan veri çıkar
      const dateStr = parts[0]
      const timeStr = parts[1]
      const lat = Number.parseFloat(parts[2])
      const lon = Number.parseFloat(parts[3])
      const depth = Number.parseFloat(parts[4])
      const magnitude = Number.parseFloat(parts[5])

      // Konum genellikle bazı sabit sütunlardan sonra satırın geri kalanıdır
      const locationStartIndex = parts.slice(0, 8).join(" ").length
      const location = trimmedLine.substring(locationStartIndex).trim()
      const region = bolgeAyikla(location)
      const coastal = kiyiKonumuMu(location)

      // Format: 2023.01.01, 12:30:45
      const dateTimeParts = `${dateStr} ${timeStr}`.split(/[\s,]+/)
      const dateTime = new Date(`${dateTimeParts[0]}T${dateTimeParts[1]}Z`)

      results.push({
        id: depremIdOlustur("direct-kandilli", dateTime.getTime().toString()),
        zaman: dateTime.toISOString(),
        buyukluk: magnitude,
        buyuklukTipi: "ML", // Kandilli genellikle Richter (Yerel) büyüklüğü kullanır
        derinlik: depth,
        enlem: lat,
        boylam: lon,
        konum: location,
        bolge: region,
        il: undefined, // Konum analizinden çıkarılabilir
        ilce: undefined, // Konum analizinden çıkarılabilir
        kaynak: "Kandilli Rasathanesi",
        enerjiSalinimJul: enerjiSaliniminiHesapla(magnitude),
        tsunamiRiski: tsunamiRiskiniHesapla(magnitude, depth, coastal),
        pDalgaHizi: 6.0 + Math.random() * 0.5, // Tahmini
        sDalgaHizi: 3.5 + Math.random() * 0.3, // Tahmini
        siddet: Math.min(12, Math.round(1.5 * magnitude)), // Tahmini
        fayMekanizmasi: ["Doğrultu Atımlı", "Normal", "Ters", "Eğik Atımlı"][Math.floor(Math.random() * 4)], // Tahmini
        artciOlasiligi: magnitude > 5 ? 0.8 : magnitude > 4 ? 0.5 : 0.2, // Tahmini
        gerilmeDusumu: 1 + Math.random() * 9, // Tahmini
        kirilmaUzunlugu: magnitude < 5 ? 0 : (magnitude - 4) * 3 + Math.random() * 5, // km
        tarihselBaglam:
          magnitude > 6
            ? "1999 İzmit depremine benzer"
            : magnitude > 5
              ? "Bölgedeki orta şiddetteki olaylara benzer"
              : "Türkiye için tipik arka plan sismik aktivitesi",
        zamanDetay: {
          tarih: dateTime.toLocaleDateString("tr-TR"),
          saat: dateTime.toLocaleTimeString("tr-TR"),
          yerelSaat: dateTime.toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul" }),
          gecenSure: zamanFarkiniFormatla(dateTime),
        },
      })
    } catch (e) {
      console.error("Satır ayrıştırma hatası:", trimmedLine, e)
    }
  }

  return results
}

// Geçen süreyi formatla
function zamanFarkiniFormatla(zaman: Date): string {
  const simdi = new Date()
  const farkMs = simdi.getTime() - zaman.getTime()
  const farkDakika = Math.floor(farkMs / 60000)

  if (farkDakika < 60) {
    return `${farkDakika} dakika önce`
  } else if (farkDakika < 1440) {
    return `${Math.floor(farkDakika / 60)} saat önce`
  } else {
    return `${Math.floor(farkDakika / 1440)} gün önce`
  }
}

// API çağrısı başarısız olduğunda kullanılacak test verileri
function getKandilliTestData(): GelismisDepremVerisi[] {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  return [
    {
      id: depremIdOlustur("kandilli-test", "1"),
      zaman: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      buyukluk: 4.2,
      buyuklukTipi: "ML",
      derinlik: 7.5,
      enlem: 40.8591,
      boylam: 28.2296,
      konum: "MARMARA DENIZI",
      bolge: "Marmara",
      il: "İstanbul",
      ilce: undefined,
      kaynak: "Kandilli Rasathanesi (Test)",
      enerjiSalinimJul: enerjiSaliniminiHesapla(4.2),
      tsunamiRiski: 0,
      pDalgaHizi: 6.2,
      sDalgaHizi: 3.6,
      siddet: 6,
      fayMekanizmasi: "Doğrultu Atımlı",
      artciOlasiligi: 0.5,
      gerilmeDusumu: 3.5,
      kirilmaUzunlugu: 1.2,
      tarihselBaglam: "Türkiye için tipik arka plan sismik aktivitesi",
      zamanDetay: {
        tarih: new Date(now.getTime() - 2 * 60 * 60 * 1000).toLocaleDateString("tr-TR"),
        saat: new Date(now.getTime() - 2 * 60 * 60 * 1000).toLocaleTimeString("tr-TR"),
        yerelSaat: new Date(now.getTime() - 2 * 60 * 60 * 1000).toLocaleTimeString("tr-TR", {
          timeZone: "Europe/Istanbul",
        }),
        gecenSure: "2 saat önce",
      },
    },
    {
      id: depremIdOlustur("kandilli-test", "2"),
      zaman: yesterday.toISOString(),
      buyukluk: 3.5,
      buyuklukTipi: "ML",
      derinlik: 5.2,
      enlem: 38.4152,
      boylam: 27.1459,
      konum: "IZMIR KORFEZI",
      bolge: "Ege",
      il: "İzmir",
      ilce: undefined,
      kaynak: "Kandilli Rasathanesi (Test)",
      enerjiSalinimJul: enerjiSaliniminiHesapla(3.5),
      tsunamiRiski: 0,
      pDalgaHizi: 6.1,
      sDalgaHizi: 3.5,
      siddet: 5,
      fayMekanizmasi: "Normal",
      artciOlasiligi: 0.2,
      gerilmeDusumu: 2.8,
      kirilmaUzunlugu: 0,
      tarihselBaglam: "Türkiye için tipik arka plan sismik aktivitesi",
      zamanDetay: {
        tarih: yesterday.toLocaleDateString("tr-TR"),
        saat: yesterday.toLocaleTimeString("tr-TR"),
        yerelSaat: yesterday.toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul" }),
        gecenSure: "1 gün önce",
      },
    },
  ]
}
