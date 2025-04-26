import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0 // No cache

export async function GET() {
  try {
    // Fetch data from Kandilli Observatory
    const response = await fetch("http://www.koeri.boun.edu.tr/scripts/lst0.asp", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3",
        Referer: "http://www.koeri.boun.edu.tr/new/",
        "Upgrade-Insecure-Requests": "1",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Kandilli API responded with status: ${response.status}`)
    }

    // Get the text content and clean it
    let text = await response.text()

    // Clean up non-standard characters that might cause parsing issues
    text = text.replace(/[^\x00-\x7F]+/g, " ")

    // Return the cleaned text
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Kandilli proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch Kandilli data" }, { status: 500 })
  }
}
