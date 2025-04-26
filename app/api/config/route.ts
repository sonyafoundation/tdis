import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0 // Önbellek yok

export async function GET() {
  try {
    // Güvenli bir şekilde istemci tarafında kullanılabilecek yapılandırma değişkenlerini döndür
    return NextResponse.json({
      mapboxApiKey:
        process.env.NEXT_PUBLIC_MAPBOX_API_KEY ||
        "pk.eyJ1IjoiaGFsZWVlZXciLCJhIjoiY203a3Nra3NtMDRhdjJqczZ5c2U1dHJ5dCJ9.KZIj4rEGqndRDMUNI5cIfw",
      // Diğer yapılandırma değişkenleri buraya eklenebilir
    })
  } catch (error) {
    console.error("Yapılandırma API hatası:", error)
    return NextResponse.json({ error: "Yapılandırma verilerini getirirken hata oluştu" }, { status: 500 })
  }
}
