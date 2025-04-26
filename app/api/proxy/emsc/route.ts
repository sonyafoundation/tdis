import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0 // No cache

export async function GET() {
  try {
    // EMSC API endpoint
    const response = await fetch(
      "https://www.seismicportal.eu/fdsnws/event/1/query?format=json" +
        "&start=" +
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() +
        "&end=" +
        new Date().toISOString() +
        "&minlat=35&maxlat=43&minlon=25&maxlon=45", // Turkey bounding box
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "TurkiyeDepremIzleme/1.0",
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`EMSC API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("EMSC proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch EMSC data" }, { status: 500 })
  }
}
