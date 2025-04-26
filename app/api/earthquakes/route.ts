import { NextResponse } from "next/server"
import { fetchAllEarthquakeData } from "@/lib/earthquake-api"

export const dynamic = "force-dynamic"
export const revalidate = 0 // No cache

export async function GET() {
  try {
    const data = await fetchAllEarthquakeData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Failed to fetch earthquake data" }, { status: 500 })
  }
}
