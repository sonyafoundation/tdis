import type { GelismisDepremVerisi, ApiKaynak } from "./types"
import { benzerDepremleriGrupla } from "./utils/veri-birlestirici"

// Import each function from its specific file
import { fetchFromKandilliAPI } from "./data-sources/kandilli-api"
import { fetchFromAFADAPI } from "./data-sources/afad-api"
import { EMSCdenGetir, EMSCTaniklarindanGetir } from "./data-sources/emsc"
import { USGSdenGetir } from "./data-sources/usgs"
// Berkealp ve Ferdiozer importları kaldırıldı
import { fetchFromDirectAFAD } from "./data-sources/direct-afad"
import { fetchFromDirectKandilli } from "./data-sources/direct-kandilli"
import { UDIMXMLdenGetir } from "./data-sources/udim-xml"

// API kaynakları dizisi
const apiKaynaklari: ApiKaynak[] = [
  { ad: "Kandilli UDIM XML", getirFonksiyonu: UDIMXMLdenGetir }, // En yüksek öncelikli kaynak
  { ad: "Kandilli Rasathanesi API", getirFonksiyonu: fetchFromKandilliAPI },
  { ad: "EMSC", getirFonksiyonu: EMSCdenGetir },
  { ad: "EMSC Tanıkları", getirFonksiyonu: EMSCTaniklarindanGetir },
  { ad: "USGS", getirFonksiyonu: USGSdenGetir },
  // Berkealp ve Ferdiozer API'leri kaldırıldı
  { ad: "AFAD Resmi", getirFonksiyonu: fetchFromDirectAFAD },
  { ad: "Kandilli Rasathanesi Direkt", getirFonksiyonu: fetchFromDirectKandilli },
  // AFAD API'yi en sona koyalım çünkü bazen çalışıyor bazen çalışmıyor
  { ad: "AFAD API", getirFonksiyonu: fetchFromAFADAPI },
]

// Daha fazla hata işleme ve yeniden deneme mantığı eklemek için tumDepremleriGetir işlevini güncelle
export async function tumDepremleriGetir(): Promise<GelismisDepremVerisi[]> {
  // Tüm kaynaklardan paralel olarak veri getir
  const istekler = apiKaynaklari.map((kaynak) => {
    // Her kaynak için yeniden deneme mantığı ekle
    return yenidenDenemeIleGetir(kaynak)
  })

  const sonuclar = await Promise.allSettled(istekler)

  // Tüm başarılı sonuçları birleştir
  const tumVeriler: GelismisDepremVerisi[] = []
  let basariSayisi = 0

  sonuclar.forEach((sonuc, indeks) => {
    if (sonuc.status === "fulfilled" && sonuc.value.length > 0) {
      tumVeriler.push(...sonuc.value)
      basariSayisi++
    } else {
      console.error(
        `${apiKaynaklari[indeks].ad} kaynağından veri getirme hatası:`,
        sonuc.status === "rejected" ? sonuc.reason : "Veri döndürülmedi",
      )
    }
  })

  // Hiç veri döndürülmediyse, boş dizi döndür
  if (basariSayisi === 0) {
    console.warn("Tüm API'ler başarısız oldu, veri yok")
    return []
  }

  // Zamana göre sırala (en yeni en üstte)
  tumVeriler.sort((a, b) => new Date(b.zaman).getTime() - new Date(a.zaman).getTime())

  // Farklı kaynaklardan gelen benzer depremleri grupla
  const gruplanmisVeriler = benzerDepremleriGrupla(tumVeriler)

  return gruplanmisVeriler
}

// API çağrılarını yeniden deneme yardımcı işlevi
async function yenidenDenemeIleGetir(kaynak: ApiKaynak, maksYenidenDeneme = 2): Promise<GelismisDepremVerisi[]> {
  let sonHata

  for (let deneme = 0; deneme <= maksYenidenDeneme; deneme++) {
    try {
      // Berkealp ve Ferdiozer API'leri için hemen boş dizi döndür
      if (kaynak.ad === "Berkealp Kandilli API" || kaynak.ad === "Ferdiozer Deprem API") {
        console.log(`Kullanımdan kaldırılmış API atlanıyor: ${kaynak.ad}`)
        return []
      }

      const veri = await kaynak.getirFonksiyonu()

      // Geçerli veri alıp almadığımızı kontrol et
      if (Array.isArray(veri) && veri.length > 0) {
        console.log(`${kaynak.ad} kaynağından başarıyla ${veri.length} kayıt alındı`)
        return veri
      } else {
        console.warn(`${kaynak.ad} kaynağı boş veri döndürdü`)
        // Boş bir dizi aldıysak, yeniden denenebilir bir hata olarak kabul et
        throw new Error(`${kaynak.ad} kaynağından boş veri`)
      }
    } catch (hata) {
      console.warn(`${deneme + 1}/${maksYenidenDeneme + 1} denemesi ${kaynak.ad} için başarısız oldu:`, hata)
      sonHata = hata

      // Yeniden denemeden önce biraz bekle (üstel geri çekilme)
      if (deneme < maksYenidenDeneme) {
        await new Promise((resolve) => setTimeout(resolve, 200 * Math.pow(2, deneme)))
      }
    }
  }

  console.error(`${kaynak.ad} için tüm denemeler başarısız oldu`)
  return [] // Tüm yeniden denemeler başarısız olduktan sonra boş dizi döndür
}

// Depremleri bölgeye göre filtrele
export function bolgeFiltrele(veriler: GelismisDepremVerisi[], bolge: string): GelismisDepremVerisi[] {
  if (!bolge || bolge === "Tüm Bölgeler") {
    return veriler
  }

  return veriler.filter(
    (deprem) =>
      deprem.bolge.toLowerCase().includes(bolge.toLowerCase()) ||
      deprem.konum.toLowerCase().includes(bolge.toLowerCase()),
  )
}

// Depremleri büyüklük aralığına göre filtrele
export function buyuklukFiltrele(
  veriler: GelismisDepremVerisi[],
  minBuyukluk: number,
  maxBuyukluk: number,
): GelismisDepremVerisi[] {
  return veriler.filter((deprem) => deprem.buyukluk >= minBuyukluk && deprem.buyukluk <= maxBuyukluk)
}

// Depremleri zaman aralığına göre filtrele
export function zamanAraligiFiltrele(
  veriler: GelismisDepremVerisi[],
  baslangicZamani: Date,
  bitisZamani: Date,
): GelismisDepremVerisi[] {
  return veriler.filter((deprem) => {
    const depremZamani = new Date(deprem.zaman)
    return depremZamani >= baslangicZamani && depremZamani <= bitisZamani
  })
}

// Deprem verilerinden benzersiz bölgeleri al
export function benzersizBolgeleriGetir(veriler: GelismisDepremVerisi[]): string[] {
  const bolgeler = new Set<string>()

  veriler.forEach((deprem) => {
    if (deprem.bolge && deprem.bolge !== "Bilinmeyen Bölge") {
      bolgeler.add(deprem.bolge)
    }
  })

  return ["Tüm Bölgeler", ...Array.from(bolgeler).sort()]
}
