import { NextResponse } from "next/server"
import { fetchAllEarthquakeData } from "@/lib/earthquake-api"

export const dynamic = "force-dynamic"
export const revalidate = 0 // No cache

export async function GET() {
  // This would be a Server-Sent Events (SSE) implementation in a real app
  // For this example, we'll just return the latest data
  try {
    const data = await fetchAllEarthquakeData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Stream API error:", error)
    return NextResponse.json({ error: "Failed to stream earthquake data" }, { status: 500 })
  }
}
