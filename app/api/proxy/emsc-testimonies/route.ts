import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0 // No cache

export async function GET() {
  try {
    // EMSC Testimonies API endpoint
    const response = await fetch(
      "https://www.seismicportal.eu/testimonies-ws/api/search?minnbtestimonies=5&limit=50&offset=1&orderby=time-desc&eventformat=json",
      {
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "TurkiyeDepremIzleme/1.0",
          Referer: "https://www.seismicportal.eu/testimonies-ws/",
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`EMSC Testimonies API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("EMSC Testimonies proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch EMSC Testimonies data" }, { status: 500 })
  }
}
