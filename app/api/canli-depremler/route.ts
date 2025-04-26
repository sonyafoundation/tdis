import { NextResponse } from "next/server"
import { tumDepremleriGetir } from "@/lib/deprem-api"

export const dynamic = "force-dynamic"
export const revalidate = 0 // Önbellek yok

export async function GET(request: Request) {
  // Server-Sent Events (SSE) için gerekli başlıkları ayarla
  const responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()

  // SSE başlıklarını ayarla
  const response = new NextResponse(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // NGINX için buffering'i devre dışı bırak
    },
  })

  // İstemciye bağlantı kurulduğunu bildir
  const writeEvent = async (event: string, data: any) => {
    try {
      await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
    } catch (error) {
      // Bağlantı kapanmış olabilir, sessizce başarısız ol
    }
  }

  // İlk veri gönderimi
  try {
    // Önbellekten veri al
    let oncekiVeriler = await tumDepremleriGetir()

    // İlk veriyi gönder
    if (oncekiVeriler.length > 0) {
      await writeEvent("depremler", oncekiVeriler.slice(0, 50))
    }

    // Düzenli aralıklarla veri gönder
    const interval = setInterval(async () => {
      try {
        // Önbellekten güncel veriyi al
        const guncelVeriler = await tumDepremleriGetir()

        // Yeni depremler var mı kontrol et
        const yeniDepremler = guncelVeriler.filter((yeni) => !oncekiVeriler.some((eski) => eski.id === yeni.id))

        // Yeni deprem varsa gönder
        if (yeniDepremler.length > 0) {
          await writeEvent("yeniDepremler", yeniDepremler)
          oncekiVeriler = guncelVeriler
        }

        // Düzenli olarak yaşam sinyali gönder
        await writeEvent("ping", { zaman: new Date().toISOString() })
      } catch (error) {
        // Hata durumunda sessizce devam et ve bağlantıyı koru
        try {
          await writeEvent("hata", { mesaj: "Veri güncellenirken hata oluştu" })
        } catch {
          // Bağlantı kapanmış olabilir, sessizce başarısız ol
        }
      }
    }, 5000) // 5 saniyede bir güncelle

    // Bağlantı kapandığında interval'i temizle
    request.signal.addEventListener("abort", () => {
      clearInterval(interval)
      writer.close().catch(() => {
        // Bağlantı zaten kapanmış olabilir, sessizce başarısız ol
      })
    })
  } catch (error) {
    try {
      await writeEvent("hata", { mesaj: "Bağlantı başlatılırken hata oluştu" })
      await writer.close()
    } catch {
      // Bağlantı zaten kapanmış olabilir, sessizce başarısız ol
    }
  }

  return response
}
