"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react"
import { calculateEnergyRelease } from "@/lib/earthquake-science/depth-analysis"
import { calculateAftershockInfo } from "@/lib/earthquake-science/earthquake-types"
import { calculateTsunamiRisk } from "@/lib/early-warning/tsunami-risk"
import MajorEarthquakeAlert from "./major-earthquake-alert"

// Tip tanımlarını optimize edelim
type EarthquakeSource = {
  name: string
  magnitude: number
  magnitudeType: string
  time: string
  depth: number
  location: string
}

type MergeInfo = {
  magnitudeVariance: number
  locationVariance: number
  timeVariance?: number
}

type EarthquakeData = {
  id: string
  time: string
  magnitude: number
  magnitudeType: string
  depth: number
  latitude: number
  longitude: number
  location: string
  region: string
  source: string
  energyRelease: number
  tsunamiRisk: number
  faultMechanism?: string
  aftershockProbability?: number
  ruptureLength?: number
  sources?: EarthquakeSource[]
  confidenceLevel?: "high" | "medium" | "low" | "single-source"
  mergeInfo?: MergeInfo
}

// Memoize edilmiş alt bileşenler
const MemoizedMajorEarthquakeAlert = memo(MajorEarthquakeAlert)

// Filtreleme fonksiyonları
const filterByMagnitude = (quake: EarthquakeData, min: number, max: number) =>
  quake.magnitude >= min && quake.magnitude <= max

const filterByRegion = (quake: EarthquakeData, region: string) =>
  region === "all" || quake.region.toLowerCase().includes(region.toLowerCase())

const filterBySource = (quake: EarthquakeData, source: string) => {
  if (source === "all") return true
  if (quake.sources && quake.sources.length > 0) {
    return quake.sources.some((s) => s.name.toLowerCase().includes(source.toLowerCase()))
  }
  return quake.source.toLowerCase().includes(source.toLowerCase())
}

const filterByTimeRange = (quake: EarthquakeData, timeRange: string) => {
  const quakeTime = new Date(quake.time)
  const now = new Date()

  switch (timeRange) {
    case "24h":
      return quakeTime >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case "3d":
      return quakeTime >= new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    case "7d":
      return quakeTime >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "30d":
      return quakeTime >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return true
  }
}

// Renk yardımcı fonksiyonları
const getMagnitudeColor = (magnitude: number) => {
  if (magnitude >= 7.0) return "#ff0000" // Red
  if (magnitude >= 6.0) return "#ff6600" // Orange
  if (magnitude >= 5.0) return "#ffcc00" // Yellow
  if (magnitude >= 4.0) return "#66ff33" // Light Green
  return "#00cc00" // Green
}

const getConfidenceColor = (level?: "high" | "medium" | "low" | "single-source") => {
  if (!level || level === "single-source") return "#8c8c8c"
  switch (level) {
    case "high":
      return "#52c41a"
    case "medium":
      return "#faad14"
    case "low":
      return "#f5222d"
    default:
      return "#8c8c8c"
  }
}

// Zaman formatlama fonksiyonu
const formatRelativeTime = (timeStr: string) => {
  const time = new Date(timeStr)
  const now = new Date()
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) return `${diffMins} dk önce`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} sa önce`
  return time.toLocaleDateString("tr-TR")
}

// Ana bileşen
export default function ModernEarthquakeDashboard() {
  // Performans için useRef kullanımı
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevDataRef = useRef<EarthquakeData[]>([])

  // State tanımları
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeData | null>(null)
  const [filter, setFilter] = useState({
    minMagnitude: 4.0,
    maxMagnitude: 10.0,
    region: "all",
    timeRange: "7d",
    source: "all",
  })
  const [showTooltip, setShowTooltip] = useState<{ id: string; x: number; y: number } | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Veri getirme fonksiyonu - useCallback ile optimize edildi
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setFetchError(null)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 saniye timeout

      const response = await fetch("http://localhost:3000/api/earthquakes", {
        signal: controller.signal,
        cache: "no-store",
        next: { revalidate: 0 },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Veri değişikliği kontrolü
      const hasChanged = JSON.stringify(data) !== JSON.stringify(prevDataRef.current)

      if (hasChanged) {
        setEarthquakes(data)
        prevDataRef.current = data
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching earthquake data:", error)
      if (error instanceof Error && error.name === "AbortError") {
        setFetchError("Veri alımı zaman aşımına uğradı. Lütfen tekrar deneyin.")
      } else {
        setFetchError(error instanceof Error ? error.message : "Veri alınamadı")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // İlk yükleme ve polling
  useEffect(() => {
    // İlk veri yüklemesi
    fetchData()

    // Polling kurulumu
    const setupPolling = () => {
      fetchTimeoutRef.current = setTimeout(async () => {
        await fetchData()
        setupPolling() // Recursive polling
      }, 10000) // 10 saniye aralıkla
    }

    setupPolling()

    // Cleanup
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [fetchData])

  // Filtreleme - useMemo ile optimize edildi
  const filteredEarthquakes = useMemo(() => {
    return earthquakes.filter(
      (quake) =>
        filterByMagnitude(quake, filter.minMagnitude, filter.maxMagnitude) &&
        filterByRegion(quake, filter.region) &&
        filterBySource(quake, filter.source) &&
        filterByTimeRange(quake, filter.timeRange),
    )
  }, [earthquakes, filter])

  // İstatistikler - useMemo ile optimize edildi
  const stats = useMemo(() => {
    if (filteredEarthquakes.length === 0) return null

    const magnitudes = filteredEarthquakes.map((quake) => quake.magnitude)
    const depths = filteredEarthquakes.map((quake) => quake.depth)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)

    return {
      count: filteredEarthquakes.length,
      avgMagnitude: magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length,
      maxMagnitude: Math.max(...magnitudes),
      avgDepth: depths.reduce((sum, depth) => sum + depth, 0) / depths.length,
      recentCount: filteredEarthquakes.filter((quake) => new Date(quake.time) >= hourAgo).length,
      significantCount: filteredEarthquakes.filter((quake) => quake.magnitude >= 5.0).length,
      mergedCount: filteredEarthquakes.filter((quake) => quake.sources && quake.sources.length > 1).length,
    }
  }, [filteredEarthquakes])

  // Detaylı analiz - useMemo ile optimize edildi
  const detailedAnalysis = useMemo(() => {
    if (!selectedEarthquake) return null

    const energy = calculateEnergyRelease(selectedEarthquake.magnitude)
    const aftershockInfo = calculateAftershockInfo(selectedEarthquake.magnitude)
    const tsunamiRiskResult = calculateTsunamiRisk({
      magnitude: selectedEarthquake.magnitude,
      depth: selectedEarthquake.depth,
      distance: 50,
      location: selectedEarthquake.location,
      underwaterLandslide: false,
      coastalTopography: "open",
      waterDepth: 1000,
    })

    return { energy, aftershockInfo, tsunamiRiskResult }
  }, [selectedEarthquake])

  // Event handler'lar - useCallback ile optimize edildi
  const handleMouseOver = useCallback((e: React.MouseEvent, quake: EarthquakeData) => {
    if (quake.sources && quake.sources.length > 1) {
      setShowTooltip({
        id: quake.id,
        x: e.clientX,
        y: e.clientY,
      })
    }
  }, [])

  const handleMouseOut = useCallback(() => {
    setShowTooltip(null)
  }, [])

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilter((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Büyük deprem uyarısı için en büyük depremi bul
  const biggestEarthquake = useMemo(() => {
    const bigQuakes = earthquakes.filter((eq) => eq.magnitude >= 7.0)
    return bigQuakes.length > 0 ? bigQuakes.sort((a, b) => b.magnitude - a.magnitude)[0] : null
  }, [earthquakes])

  return (
    <div className="dashboard-container">
      {biggestEarthquake && <MemoizedMajorEarthquakeAlert earthquake={biggestEarthquake} />}

      {/* Header */}
      <header className="dashboard-header">
        <h1>Türkiye Deprem İzleme Sistemi</h1>
        <div className="last-updated">
          Son Güncelleme: {lastUpdated ? lastUpdated.toLocaleString("tr-TR") : "Yükleniyor..."}
          {loading && <span className="loading-indicator"> (Yenileniyor...)</span>}
          {fetchError && <span className="error-indicator"> (Hata: {fetchError})</span>}
        </div>
      </header>

      {/* Filters */}
      <div className="filter-panel">
        <div className="filter-group">
          <label htmlFor="min-magnitude">Min Büyüklük:</label>
          <input
            id="min-magnitude"
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={filter.minMagnitude}
            onChange={(e) => handleFilterChange("minMagnitude", Number.parseFloat(e.target.value))}
          />
          <span>{filter.minMagnitude.toFixed(1)}</span>
        </div>

        <div className="filter-group">
          <label htmlFor="max-magnitude">Max Büyüklük:</label>
          <input
            id="max-magnitude"
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={filter.maxMagnitude}
            onChange={(e) => handleFilterChange("maxMagnitude", Number.parseFloat(e.target.value))}
          />
          <span>{filter.maxMagnitude.toFixed(1)}</span>
        </div>

        <div className="filter-group">
          <label htmlFor="region-filter">Bölge:</label>
          <select
            id="region-filter"
            value={filter.region}
            onChange={(e) => handleFilterChange("region", e.target.value)}
          >
            <option value="all">Tüm Bölgeler</option>
            <option value="marmara">Marmara</option>
            <option value="ege">Ege</option>
            <option value="akdeniz">Akdeniz</option>
            <option value="karadeniz">Karadeniz</option>
            <option value="iç anadolu">İç Anadolu</option>
            <option value="doğu anadolu">Doğu Anadolu</option>
            <option value="güneydoğu anadolu">Güneydoğu Anadolu</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="time-range">Zaman Aralığı:</label>
          <select
            id="time-range"
            value={filter.timeRange}
            onChange={(e) => handleFilterChange("timeRange", e.target.value)}
          >
            <option value="24h">Son 24 Saat</option>
            <option value="3d">Son 3 Gün</option>
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="all">Tümü</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="source-filter">Kaynak:</label>
          <select
            id="source-filter"
            value={filter.source}
            onChange={(e) => handleFilterChange("source", e.target.value)}
          >
            <option value="all">Tüm Kaynaklar</option>
            <option value="kandilli">Kandilli</option>
            <option value="afad">AFAD</option>
            <option value="emsc">EMSC</option>
            <option value="usgs">USGS</option>
          </select>
        </div>
      </div>

      {/* Stats Panel */}
      {stats && (
        <div className="stats-panel">
          <div className="stat-card">
            <div className="stat-value">{stats.count}</div>
            <div className="stat-label">Toplam Deprem</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.recentCount}</div>
            <div className="stat-label">Son 1 Saat</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.significantCount}</div>
            <div className="stat-label">Önemli (≥5.0)</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.avgMagnitude.toFixed(2)}</div>
            <div className="stat-label">Ort. Büyüklük</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.maxMagnitude.toFixed(1)}</div>
            <div className="stat-label">Max Büyüklük</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.avgDepth.toFixed(1)} km</div>
            <div className="stat-label">Ort. Derinlik</div>
          </div>

          {stats.mergedCount > 0 && (
            <div className="stat-card">
              <div className="stat-value">{stats.mergedCount}</div>
              <div className="stat-label">Birleştirilmiş</div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Earthquake List */}
        <div className="earthquake-list">
          <h2>Son Depremler</h2>

          <div className="list-header">
            <div className="list-cell">Zaman</div>
            <div className="list-cell">Büyüklük</div>
            <div className="list-cell">Derinlik</div>
            <div className="list-cell">Konum</div>
            <div className="list-cell">Kaynak</div>
          </div>

          <div className="list-body">
            {filteredEarthquakes.map((quake) => (
              <div
                key={quake.id}
                className={`list-row ${selectedEarthquake?.id === quake.id ? "selected" : ""}`}
                onClick={() => setSelectedEarthquake(quake)}
                onMouseOver={(e) => handleMouseOver(e, quake)}
                onMouseOut={handleMouseOut}
              >
                <div className="list-cell">{formatRelativeTime(quake.time)}</div>
                <div className="list-cell magnitude" style={{ color: getMagnitudeColor(quake.magnitude) }}>
                  {quake.magnitude.toFixed(1)} {quake.magnitudeType}
                </div>
                <div className="list-cell">{quake.depth.toFixed(1)} km</div>
                <div className="list-cell location">{quake.location}</div>
                <div className="list-cell source">
                  {quake.sources && quake.sources.length > 1 ? (
                    <span className="merged-source" style={{ color: getConfidenceColor(quake.confidenceLevel) }}>
                      {quake.sources.length} kaynak
                    </span>
                  ) : (
                    quake.source
                  )}
                </div>
              </div>
            ))}

            {filteredEarthquakes.length === 0 && (
              <div className="no-data">Seçilen filtrelere uygun deprem bulunamadı.</div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedEarthquake && detailedAnalysis && (
          <div className="detail-panel">
            <h2>Deprem Detayları</h2>

            <div className="detail-header">
              <div
                className="magnitude-display"
                style={{ backgroundColor: getMagnitudeColor(selectedEarthquake.magnitude) }}
              >
                {selectedEarthquake.magnitude.toFixed(1)}
              </div>
              <div className="detail-title">
                <h3>{selectedEarthquake.location}</h3>
                <p>{new Date(selectedEarthquake.time).toLocaleString("tr-TR")}</p>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Koordinatlar:</span>
                <span className="detail-value">
                  {selectedEarthquake.latitude.toFixed(4)}, {selectedEarthquake.longitude.toFixed(4)}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Derinlik:</span>
                <span className="detail-value">{selectedEarthquake.depth.toFixed(1)} km</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Bölge:</span>
                <span className="detail-value">{selectedEarthquake.region}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Kaynak:</span>
                <span className="detail-value">
                  {selectedEarthquake.sources && selectedEarthquake.sources.length > 1
                    ? `${selectedEarthquake.sources.length} kaynak birleştirildi`
                    : selectedEarthquake.source}
                </span>
              </div>

              {selectedEarthquake.faultMechanism && (
                <div className="detail-item">
                  <span className="detail-label">Fay Mekanizması:</span>
                  <span className="detail-value">{selectedEarthquake.faultMechanism}</span>
                </div>
              )}

              {selectedEarthquake.ruptureLength && (
                <div className="detail-item">
                  <span className="detail-label">Kırılma Uzunluğu:</span>
                  <span className="detail-value">{selectedEarthquake.ruptureLength.toFixed(1)} km</span>
                </div>
              )}
            </div>

            {selectedEarthquake.sources && selectedEarthquake.sources.length > 1 && (
              <div className="sources-section">
                <h3>Veri Kaynakları</h3>
                <div className="sources-list">
                  {selectedEarthquake.sources.map((source, index) => (
                    <div key={index} className="source-item">
                      <div className="source-name">{source.name}</div>
                      <div className="source-details">
                        <span>
                          Büyüklük: {source.magnitude.toFixed(1)} {source.magnitudeType}
                        </span>
                        <span>Derinlik: {source.depth.toFixed(1)} km</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedEarthquake.mergeInfo && (
                  <div className="merge-info">
                    <div className="merge-item">
                      <span className="merge-label">Büyüklük Varyansı:</span>
                      <span className="merge-value">{selectedEarthquake.mergeInfo.magnitudeVariance.toFixed(2)}</span>
                    </div>
                    <div className="merge-item">
                      <span className="merge-label">Konum Varyansı:</span>
                      <span className="merge-value">{selectedEarthquake.mergeInfo.locationVariance.toFixed(2)} km</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="analysis-section">
              <h3>Enerji Analizi</h3>
              <p>{detailedAnalysis.energy.energyDescription}</p>
              <ul>
                {detailedAnalysis.energy.comparisons.map((comparison, index) => (
                  <li key={index}>{comparison}</li>
                ))}
              </ul>
            </div>

            <div className="analysis-section">
              <h3>Artçı Deprem Analizi</h3>
              <p>{detailedAnalysis.aftershockInfo.description}</p>
              <div className="aftershock-stats">
                <div className="aftershock-stat">
                  <span className="stat-value">{(detailedAnalysis.aftershockInfo.probability * 100).toFixed(0)}%</span>
                  <span className="stat-label">Olasılık</span>
                </div>
                <div className="aftershock-stat">
                  <span className="stat-value">{detailedAnalysis.aftershockInfo.expectedCount}</span>
                  <span className="stat-label">Tahmini Sayı</span>
                </div>
                <div className="aftershock-stat">
                  <span className="stat-value">{detailedAnalysis.aftershockInfo.durationDays} gün</span>
                  <span className="stat-label">Süre</span>
                </div>
                <div className="aftershock-stat">
                  <span className="stat-value">{detailedAnalysis.aftershockInfo.magnitudeRange.max.toFixed(1)}</span>
                  <span className="stat-label">Max Büyüklük</span>
                </div>
              </div>
            </div>

            <div className="analysis-section">
              <h3>Tsunami Riski</h3>
              <div className={`tsunami-risk-indicator ${detailedAnalysis.tsunamiRiskResult.riskLevel}`}>
                {detailedAnalysis.tsunamiRiskResult.riskLevel.toUpperCase()}
              </div>
              {detailedAnalysis.tsunamiRiskResult.riskLevel !== "none" && (
                <div className="tsunami-details">
                  <div className="tsunami-detail">
                    <span className="detail-label">Tahmini Dalga Yüksekliği:</span>
                    <span className="detail-value">
                      {detailedAnalysis.tsunamiRiskResult.estimatedWaveHeight.toFixed(1)} m
                    </span>
                  </div>
                  <div className="tsunami-detail">
                    <span className="detail-label">Tahmini Varış Süresi:</span>
                    <span className="detail-value">
                      {detailedAnalysis.tsunamiRiskResult.estimatedArrivalTime.toFixed(0)} dakika
                    </span>
                  </div>
                  <div className="tsunami-detail">
                    <span className="detail-label">Tahliye Önerisi:</span>
                    <span className="detail-value">{detailedAnalysis.tsunamiRiskResult.evacuationRecommendation}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedEarthquake && (
          <div className="detail-panel empty">
            <div className="empty-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>Detaylı bilgi için bir deprem seçin</h3>
              <p>Listeden bir deprem seçerek detaylı analiz bilgilerini görüntüleyebilirsiniz.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip for merged earthquakes */}
      {showTooltip && (
        <div
          className="tooltip"
          style={{
            top: `${showTooltip.y + 10}px`,
            left: `${showTooltip.x + 10}px`,
          }}
        >
          <div className="tooltip-header">Veri Kaynakları</div>
          <div className="tooltip-content">
            {earthquakes
              .find((q) => q.id === showTooltip.id)
              ?.sources?.map((source, index) => (
                <div key={index} className="tooltip-source">
                  <div className="source-name">{source.name}</div>
                  <div className="source-details">
                    <span>
                      Büyüklük: {source.magnitude.toFixed(1)} {source.magnitudeType}
                    </span>
                    <span>Derinlik: {source.depth.toFixed(1)} km</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2025 Türkiye Deprem İzleme Sistemi | Veriler Kandilli, AFAD, USGS ve EMSC kaynaklarından alınmaktadır.</p>
      </footer>

      {/* Styles */}
      <style jsx>{`
        .dashboard-container {
          font-family: 'JetBrains Mono', monospace;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          color: #e0e0e0;
          background-color: #1e1e1e;
        }
        
        .dashboard-header {
          margin-bottom: 20px;
          border-bottom: 1px solid #333;
          padding-bottom: 10px;
        }
        
        .dashboard-header h1 {
          font-size: 24px;
          margin: 0 0 10px 0;
          color: #00ff00;
        }
        
        .last-updated {
          font-size: 12px;
          color: #888;
        }
        
        .loading-indicator {
          color: #00ff00;
          animation: pulse 1.5s infinite;
        }
        
        .error-indicator {
          color: #ff3333;
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        .filter-panel {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          background-color: #252525;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .filter-group label {
          font-weight: 500;
          color: #aaa;
        }
        
        .filter-group input[type="range"] {
          background-color: #333;
          height: 5px;
          width: 100px;
        }
        
        .filter-group select {
          background-color: #333;
          color: #e0e0e0;
          border: 1px solid #444;
          padding: 5px;
          border-radius: 3px;
        }
        
        .stats-panel {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background-color: #252525;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
          border: 1px solid #333;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #00ff00;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #aaa;
        }
        
        .main-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .earthquake-list {
          background-color: #252525;
          border-radius: 4px;
          padding: 15px;
          border: 1px solid #333;
        }
        
        .earthquake-list h2 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #00ff00;
        }
        
        .list-header {
          display: grid;
          grid-template-columns: 0.8fr 0.6fr 0.6fr 2fr 0.8fr;
          padding: 10px 0;
          border-bottom: 1px solid #333;
          font-weight: 500;
          color: #aaa;
          font-size: 12px;
        }
        
        .list-body {
          max-height: 500px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #444 #252525;
        }
        
        .list-body::-webkit-scrollbar {
          width: 8px;
        }
        
        .list-body::-webkit-scrollbar-track {
          background: #252525;
        }
        
        .list-body::-webkit-scrollbar-thumb {
          background-color: #444;
          border-radius: 4px;
        }
        
        .list-row {
          display: grid;
          grid-template-columns: 0.8fr 0.6fr 0.6fr 2fr 0.8fr;
          padding: 8px 0;
          border-bottom: 1px solid #333;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .list-row:hover {
          background-color: #2a2a2a;
        }
        
        .list-row.selected {
          background-color: #2d3748;
        }
        
        .list-cell {
          padding: 0 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .magnitude {
          font-weight: bold;
        }
        
        .location {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .merged-source {
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .no-data {
          padding: 20px;
          text-align: center;
          color: #888;
        }
        
        .detail-panel {
          background-color: #252525;
          border-radius: 4px;
          padding: 15px;
          border: 1px solid #333;
        }
        
        .detail-panel h2 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #00ff00;
        }
        
        .detail-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .magnitude-display {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          margin-right: 15px;
          color: #000;
        }
        
        .detail-title h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }
        
        .detail-title p {
          margin: 0;
          font-size: 12px;
          color: #888;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          font-size: 12px;
          color: #888;
        }
        
        .detail-value {
          font-weight: 500;
        }
        
        .sources-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #2a2a2a;
          border-radius: 4px;
        }
        
        .sources-section h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
          color: #00ff00;
        }
        
        .sources-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        
        .source-item {
          padding: 8px;
          background-color: #333;
          border-radius: 4px;
        }
        
        .source-name {
          font-weight: 500;
          margin-bottom: 5px;
        }
        
        .source-details {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          color: #aaa;
        }
        
        .merge-info {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #444;
        }
        
        .merge-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .merge-label {
          color: #888;
        }
        
        .merge-value {
          font-weight: 500;
        }
        
        .analysis-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #2a2a2a;
          border-radius: 4px;
        }
        
        .analysis-section h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
          color: #00ff00;
        }
        
        .analysis-section p {
          margin-top: 0;
          font-size: 14px;
        }
        
        .analysis-section ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .aftershock-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          margin-top: 15px;
        }
        
        .aftershock-stat {
          text-align: center;
          padding: 10px;
          background-color: #333;
          border-radius: 4px;
        }
        
        .tsunami-risk-indicator {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        
        .tsunami-risk-indicator.none {
          background-color: #2d3748;
          color: #a0aec0;
        }
        
        .tsunami-risk-indicator.low {
          background-color: #2c7a7b;
          color: #e6fffa;
        }
        
        .tsunami-risk-indicator.moderate {
          background-color: #c05621;
          color: #fffaf0;
        }
        
        .tsunami-risk-indicator.high {
          background-color: #c53030;
          color: #fff5f5;
        }
        
        .tsunami-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        
        .tsunami-detail {
          display: flex;
          flex-direction: column;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px 0;
          color: #888;
        }
        
        .empty-state svg {
          margin-bottom: 20px;
          color: #555;
        }
        
        .empty-state h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #aaa;
        }
        
        .empty-state p {
          margin: 0;
          text-align: center;
          max-width: 300px;
        }
        
        .tooltip {
          position: fixed;
          background-color: #252525;
          border: 1px solid #444;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          width: 300px;
          pointer-events: none;
        }
        
        .tooltip-header {
          background-color: #333;
          padding: 8px 12px;
          font-weight: 500;
          border-bottom: 1px solid #444;
        }
        
        .tooltip-content {
          padding: 12px;
        }
        
        .tooltip-source {
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #333;
        }
        
        .tooltip-source:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .dashboard-footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #333;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        
        @media (max-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr;
          }
          
          .detail-panel {
            margin-top: 20px;
          }
        }
        
        @media (max-width: 768px) {
          .filter-panel {
            flex-direction: column;
            gap: 10px;
          }
          
          .stats-panel {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .detail-grid, .sources-list, .tsunami-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
