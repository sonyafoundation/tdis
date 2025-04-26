import ModernEarthquakeDashboard from "@/components/modern-earthquake-dashboard"
import EarthquakeAlertTester from "@/components/earthquake-alert-tester"

export const dynamic = "force-dynamic"
export const revalidate = 0 // No cache

export default function LiveMonitoringPage() {
  return (
    <>
      <div className="nav-container">
        <div className="nav-logo">Türkiye Deprem İzleme Sistemi</div>
        <div className="nav-links">
          <a href="/canli" className="nav-link active">
            Canlı İzleme
          </a>
        </div>
      </div>

      <ModernEarthquakeDashboard />
      <EarthquakeAlertTester />
    </>
  )
}
