import { NextResponse } from "next/server"
import { parseUdimXml } from "@/lib/server/parse-udim-xml"

export const dynamic = "force-dynamic"
export const revalidate = 0 // No cache

export async function GET() {
  try {
    // Fetch XML data from Kandilli UDIM service
    const response = await fetch("http://udim.koeri.boun.edu.tr/zeqmap/xmlt/SonAY.xml", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
        Accept: "*/*",
        "Accept-Language": "tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3",
        "X-Requested-With": "XMLHttpRequest",
        Referer: "http://udim.koeri.boun.edu.tr/zeqmap/hgmmap.asp",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`UDIM XML API responded with status: ${response.status}`)
    }

    const xmlText = await response.text()

    // Parse XML to JSON
    const earthquakes = await parseUdimXml(xmlText)

    return NextResponse.json(earthquakes)
  } catch (error) {
    console.error("UDIM XML proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch UDIM XML data" }, { status: 500 })
  }
}
