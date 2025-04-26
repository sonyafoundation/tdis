import { NextResponse } from "next/server"
import { DEPREM_ONBELLEK } from "@/lib/onbellek"

export const dynamic = "force-dynamic"
export const revalidate = 0 // Önbellek yok

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Önbellekten tüm verileri al
    const tumVeriler = await DEPREM_ONBELLEK.getir()

    // ID'ye göre depremi bul
    const deprem = tumVeriler.find((d) => d.id === id)

    if (!deprem) {
      return NextResponse.json({ success: false, error: "Deprem bulunamadı" }, { status: 404 })
    }

    // Deprem için ek bilgiler ekle (gerçek bir uygulamada bu veriler başka bir API'den gelebilir)
    const detayliDeprem = {
      ...deprem,
      hissedilme: {
        toplamRapor: Math.floor(Math.random() * 200) + 1,
        maxSiddet: Math.min(Math.floor(deprem.buyukluk), 12),
        etkilenenNufus: Math.floor(Math.random() * 500000) + 1000,
        raporlar: [
          {
            konum: deprem.konum,
            siddet: Math.min(Math.floor(deprem.buyukluk), 12),
            raporSayisi: Math.floor(Math.random() * 50) + 1,
            aciklama:
              deprem.buyukluk >= 5
                ? "Güçlü hissedildi, küçük eşyalar hareket etti"
                : deprem.buyukluk >= 4
                  ? "Orta şiddette hissedildi"
                  : "Hafif hissedildi",
          },
          {
            konum: `${deprem.il || deprem.bolge}, Merkez`,
            siddet: Math.max(1, Math.min(Math.floor(deprem.buyukluk - 1), 12)),
            raporSayisi: Math.floor(Math.random() * 30) + 1,
            aciklama: deprem.buyukluk >= 4 ? "Hissedildi, bazı eşyalar sallandı" : "Hafif hissedildi",
          },
        ],
      },
    }

    return NextResponse.json({
      success: true,
      data: detayliDeprem,
    })
  } catch (error) {
    console.error("API rota hatası:", error)
    return NextResponse.json({ success: false, error: "Deprem detaylarını getirirken hata oluştu" }, { status: 500 })
  }
}
