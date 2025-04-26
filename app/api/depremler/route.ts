import { NextResponse } from "next/server"
import { bolgeFiltrele, buyuklukFiltrele, zamanAraligiFiltrele } from "@/lib/deprem-api"
import { DEPREM_ONBELLEK } from "@/lib/onbellek"

export const dynamic = "force-dynamic"
export const revalidate = 0 // Önbellek yok

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Sorgu parametrelerini al
    const baslangic = searchParams.get("baslangic")
    const bitis = searchParams.get("bitis")
    const minBuyukluk = Number.parseFloat(searchParams.get("minBuyukluk") || "0")
    const maxBuyukluk = Number.parseFloat(searchParams.get("maxBuyukluk") || "10")
    const minDerinlik = Number.parseFloat(searchParams.get("minDerinlik") || "0")
    const maxDerinlik = Number.parseFloat(searchParams.get("maxDerinlik") || "1000")
    const bolge = searchParams.get("bolge") || ""
    const il = searchParams.get("il") || ""
    const ilce = searchParams.get("ilce") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const sirala = searchParams.get("sirala") || "zaman-azalan"
    const kaynak = searchParams.get("kaynak") || ""

    // Önbellekten veri al veya API'den getir
    let veriler = await DEPREM_ONBELLEK.getir()

    // Filtreleri uygula
    if (bolge) {
      veriler = bolgeFiltrele(veriler, bolge)
    }

    if (il) {
      veriler = veriler.filter((deprem) => deprem.il?.toLowerCase() === il.toLowerCase())
    }

    if (ilce) {
      veriler = veriler.filter((deprem) => deprem.ilce?.toLowerCase() === ilce.toLowerCase())
    }

    // Büyüklük filtresi
    veriler = buyuklukFiltrele(veriler, minBuyukluk, maxBuyukluk)

    // Derinlik filtresi
    veriler = veriler.filter((deprem) => deprem.derinlik >= minDerinlik && deprem.derinlik <= maxDerinlik)

    // Tarih filtresi
    if (baslangic && bitis) {
      veriler = zamanAraligiFiltrele(veriler, new Date(baslangic), new Date(bitis))
    }

    // Kaynak filtresi
    if (kaynak) {
      veriler = veriler.filter((deprem) => deprem.kaynak.toLowerCase().includes(kaynak.toLowerCase()))
    }

    // Toplam sayıyı kaydet
    const toplamSonuc = veriler.length

    // Sıralama
    if (sirala === "zaman-artan") {
      veriler.sort((a, b) => new Date(a.zaman).getTime() - new Date(b.zaman).getTime())
    } else if (sirala === "buyukluk-azalan") {
      veriler.sort((a, b) => b.buyukluk - a.buyukluk)
    } else if (sirala === "buyukluk-artan") {
      veriler.sort((a, b) => a.buyukluk - b.buyukluk)
    } else {
      // Varsayılan: zaman-azalan
      veriler.sort((a, b) => new Date(b.zaman).getTime() - new Date(a.zaman).getTime())
    }

    // Sayfalama
    veriler = veriler.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      count: veriler.length,
      total: toplamSonuc,
      data: veriler,
    })
  } catch (error) {
    console.error("API rota hatası:", error)
    return NextResponse.json({ success: false, error: "Deprem verilerini getirirken hata oluştu" }, { status: 500 })
  }
}
