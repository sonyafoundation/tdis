import { NextResponse } from "next/server"
import { DEPREM_ONBELLEK } from "@/lib/onbellek"
import { bolgeFiltrele, zamanAraligiFiltrele } from "@/lib/deprem-api"

export const dynamic = "force-dynamic"
export const revalidate = 0 // Önbellek yok

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Sorgu parametrelerini al
    const baslangic = searchParams.get("baslangic") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const bitis = searchParams.get("bitis") || new Date().toISOString()
    const bolge = searchParams.get("bolge") || ""

    // Önbellekten veri al
    let veriler = await DEPREM_ONBELLEK.getir()

    // Tarih filtresi uygula
    veriler = zamanAraligiFiltrele(veriler, new Date(baslangic), new Date(bitis))

    // Bölge filtresi uygula
    if (bolge) {
      veriler = bolgeFiltrele(veriler, bolge)
    }

    // Temel istatistikleri hesapla
    const toplamDeprem = veriler.length
    const buyuklukler = veriler.map((d) => d.buyukluk)
    const derinlikler = veriler.map((d) => d.derinlik)

    const ortalamaBuyukluk = toplamDeprem > 0 ? buyuklukler.reduce((a, b) => a + b, 0) / toplamDeprem : 0

    const maksimumBuyukluk = toplamDeprem > 0 ? Math.max(...buyuklukler) : 0

    const ortalamaDarinlik = toplamDeprem > 0 ? derinlikler.reduce((a, b) => a + b, 0) / toplamDeprem : 0

    // Zaman bazlı istatistikler
    const simdi = new Date()
    const birSaatOnce = new Date(simdi.getTime() - 60 * 60 * 1000)
    const birGunOnce = new Date(simdi.getTime() - 24 * 60 * 60 * 1000)
    const birHaftaOnce = new Date(simdi.getTime() - 7 * 24 * 60 * 60 * 1000)

    const sonBirSaat = veriler.filter((d) => new Date(d.zaman) >= birSaatOnce).length
    const sonBirGun = veriler.filter((d) => new Date(d.zaman) >= birGunOnce).length
    const sonBirHafta = veriler.filter((d) => new Date(d.zaman) >= birHaftaOnce).length

    // Büyüklük dağılımı
    const buyuklukDagilimi = {
      "0-1.9": veriler.filter((d) => d.buyukluk < 2.0).length,
      "2.0-2.9": veriler.filter((d) => d.buyukluk >= 2.0 && d.buyukluk < 3.0).length,
      "3.0-3.9": veriler.filter((d) => d.buyukluk >= 3.0 && d.buyukluk < 4.0).length,
      "4.0-4.9": veriler.filter((d) => d.buyukluk >= 4.0 && d.buyukluk < 5.0).length,
      "5.0+": veriler.filter((d) => d.buyukluk >= 5.0).length,
    }

    // Bölgesel dağılım
    const bolgeselDagilim: Record<string, number> = {}

    veriler.forEach((deprem) => {
      const bolgeAdi = deprem.bolge || "Bilinmeyen Bölge"
      bolgeselDagilim[bolgeAdi] = (bolgeselDagilim[bolgeAdi] || 0) + 1

      if (deprem.il) {
        bolgeselDagilim[deprem.il] = (bolgeselDagilim[deprem.il] || 0) + 1

        if (deprem.ilce) {
          bolgeselDagilim[deprem.ilce] = (bolgeselDagilim[deprem.ilce] || 0) + 1
        }
      }
    })

    // Saatlik ve günlük dağılım için veri hazırla
    const saatlikDagilim = Array(24).fill(0)
    const gunlukDagilim = Array(7).fill(0)

    veriler.forEach((deprem) => {
      const tarih = new Date(deprem.zaman)
      saatlikDagilim[tarih.getHours()]++
      gunlukDagilim[tarih.getDay()]++
    })

    return NextResponse.json({
      success: true,
      data: {
        toplamDeprem,
        ortalamaBuyukluk,
        maksimumBuyukluk,
        ortalamaDarinlik,
        sonBirSaat,
        sonBirGun,
        sonBirHafta,
        buyuklukDagilimi,
        zamanDagilimi: {
          saatlik: saatlikDagilim,
          gunluk: gunlukDagilim,
        },
        bolgeselDagilim,
      },
    })
  } catch (error) {
    console.error("İstatistik API hatası:", error)
    return NextResponse.json({ success: false, error: "İstatistikleri hesaplarken hata oluştu" }, { status: 500 })
  }
}
