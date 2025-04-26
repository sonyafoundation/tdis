import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0 // No cache

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json()

    // AFAD API endpoint
    const response = await fetch("https://deprem.afad.gov.tr/EventData/GetEventsByFilter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
        "Accept-Language": "tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3",
        "Strict-Transport-Security": "max-age=16070400; includeSubDomains",
        "X-Frame-Options": "deny",
        "X-XSS-Protection": "1; mode=block",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        Priority: "u=0",
        Referer: "https://deprem.afad.gov.tr/last-earthquakes",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`AFAD API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("AFAD proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch AFAD data" }, { status: 500 })
  }
}
