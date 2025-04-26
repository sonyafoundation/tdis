"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import { fetchAllEarthquakeData } from "@/lib/earthquake-api"
import type { EnhancedEarthquakeData } from "@/lib/types"
import EarthquakeDetailModal from "./earthquake-detail-modal"

export default function GitHubStyleDashboard() {
  const [earthquakes, setEarthquakes] = useState<EnhancedEarthquakeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEarthquake, setSelectedEarthquake] = useState<EnhancedEarthquakeData | null>(null)
  const [hoverInfo, setHoverInfo] = useState<{ quake: EnhancedEarthquakeData; x: number; y: number } | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "significant" | "recent" | "merged">("all")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [filter, setFilter] = useState({
    search: "",
    minMagnitude: 0,
    maxMagnitude: 10,
    source: "all",
  })

  const isMounted = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Fetch data with more frequent updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchAllEarthquakeData()
        if (isMounted.current) {
          setEarthquakes(data)
          setLastUpdated(new Date())
          setError(null)
        }
      } catch (err) {
        console.error("Error fetching earthquake data:", err)
        if (isMounted.current) {
          setError("Failed to fetch earthquake data. Please try again.")
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    // Initial fetch
    fetchData()

    // Set up polling every 10 seconds for real-time updates
    const interval = setInterval(fetchData, 10000)

    return () => clearInterval(interval)
  }, [])

  // Get unique sources for filter dropdown
  const sources = useMemo(() => {
    const sourceSet = new Set<string>()
    earthquakes.forEach((quake) => sourceSet.add(quake.source))
    return ["all", ...Array.from(sourceSet)]
  }, [earthquakes])

  // Filter earthquakes based on current filters and active tab
  const filteredEarthquakes = useMemo(() => {
    let filtered = [...earthquakes]

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      filtered = filtered.filter(
        (quake) =>
          quake.location.toLowerCase().includes(searchLower) || quake.region.toLowerCase().includes(searchLower),
      )
    }

    // Apply magnitude filter
    filtered = filtered.filter(
      (quake) => quake.magnitude >= filter.minMagnitude && quake.magnitude <= filter.maxMagnitude,
    )

    // Apply source filter
    if (filter.source !== "all") {
      filtered = filtered.filter((quake) => quake.source === filter.source)
    }

    // Apply tab filter
    switch (activeTab) {
      case "significant":
        filtered = filtered.filter((quake) => quake.magnitude >= 4.0)
        break
      case "recent":
        filtered = filtered.filter((quake) => {
          const quakeTime = new Date(quake.time)
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
          return quakeTime >= hourAgo
        })
        break
      case "merged":
        filtered = filtered.filter((quake) => quake.sources && quake.sources.length > 1)
        break
    }

    return filtered
  }, [earthquakes, filter, activeTab])

  // Calculate statistics
  const stats = useMemo(() => {
    if (earthquakes.length === 0) return null

    const magnitudes = earthquakes.map((quake) => quake.magnitude)
    const lastHour = earthquakes.filter((quake) => {
      const quakeTime = new Date(quake.time)
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return quakeTime >= hourAgo
    }).length

    return {
      total: earthquakes.length,
      lastHour,
      significant: earthquakes.filter((quake) => quake.magnitude >= 4.0).length,
      merged: earthquakes.filter((quake) => quake.sources && quake.sources.length > 1).length,
      avgMagnitude: magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length,
      maxMagnitude: Math.max(...magnitudes),
    }
  }, [earthquakes])

  // Handle mouse over for detailed hover info
  const handleMouseOver = (e: React.MouseEvent, quake: EnhancedEarthquakeData) => {
    setHoverInfo({
      quake,
      x: e.clientX,
      y: e.clientY,
    })
  }

  // Handle mouse out
  const handleMouseOut = () => {
    setHoverInfo(null)
  }

  // Format time with relative time
  const formatRelativeTime = (timeStr: string) => {
    const time = new Date(timeStr)
    const now = new Date()
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins} min ago`
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hr ago`
    } else {
      return time.toLocaleString()
    }
  }

  // Get magnitude color
  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 7.0) return "#a8071a" // major
    if (magnitude >= 6.0) return "#f5222d" // strong
    if (magnitude >= 5.0) return "#fa8c16" // moderate
    if (magnitude >= 4.0) return "#faad14" // light
    return "#52c41a" // minor
  }

  // Get confidence level color
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

  return (
    <div className="github-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Earthquake Monitor</h1>
          <div className="dashboard-subtitle">Real-time earthquake data from multiple sources</div>
        </div>

        <div className="dashboard-stats">
          {stats && (
            <>
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.lastHour}</span>
                <span className="stat-label">Last Hour</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.significant}</span>
                <span className="stat-label">Significant</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.merged}</span>
                <span className="stat-label">Merged</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.maxMagnitude.toFixed(1)}</span>
                <span className="stat-label">Max Magnitude</span>
              </div>
            </>
          )}

          <div className="last-updated">
            {lastUpdated ? <>Last updated: {lastUpdated.toLocaleTimeString()}</> : <>Loading...</>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search locations..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Magnitude:</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={filter.minMagnitude}
              onChange={(e) => setFilter({ ...filter, minMagnitude: Number.parseFloat(e.target.value) })}
            />
            <span>{filter.minMagnitude.toFixed(1)}</span>
            <span>-</span>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={filter.maxMagnitude}
              onChange={(e) => setFilter({ ...filter, maxMagnitude: Number.parseFloat(e.target.value) })}
            />
            <span>{filter.maxMagnitude.toFixed(1)}</span>
          </div>

          <div className="filter-group">
            <label>Source:</label>
            <select value={filter.source} onChange={(e) => setFilter({ ...filter, source: e.target.value })}>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source === "all" ? "All Sources" : source}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
          All Earthquakes
        </button>
        <button
          className={`tab ${activeTab === "significant" ? "active" : ""}`}
          onClick={() => setActiveTab("significant")}
        >
          Significant (≥4.0)
        </button>
        <button className={`tab ${activeTab === "recent" ? "active" : ""}`} onClick={() => setActiveTab("recent")}>
          Last Hour
        </button>
        <button className={`tab ${activeTab === "merged" ? "active" : ""}`} onClick={() => setActiveTab("merged")}>
          Merged Data
        </button>
      </div>

      {/* Earthquake List */}
      <div className="earthquake-list">
        {loading && filteredEarthquakes.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading earthquake data...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : filteredEarthquakes.length === 0 ? (
          <div className="empty-state">
            <p>No earthquakes match your filters.</p>
          </div>
        ) : (
          <table className="earthquake-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Magnitude</th>
                <th>Depth</th>
                <th>Location</th>
                <th>Sources</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEarthquakes.map((quake) => {
                const isMerged = quake.sources && quake.sources.length > 1
                const isSignificant = quake.magnitude >= 4.0
                const isRecent = new Date(quake.time) >= new Date(Date.now() - 60 * 60 * 1000)

                return (
                  <tr
                    key={quake.id}
                    className={`
                      ${isMerged ? "merged-row" : ""}
                      ${isSignificant ? "significant-row" : ""}
                      ${isRecent ? "recent-row" : ""}
                    `}
                    onMouseOver={(e) => handleMouseOver(e, quake)}
                    onMouseOut={handleMouseOut}
                  >
                    <td>{formatRelativeTime(quake.time)}</td>
                    <td>
                      <span className="magnitude-badge" style={{ backgroundColor: getMagnitudeColor(quake.magnitude) }}>
                        {quake.magnitude.toFixed(1)}
                      </span>
                    </td>
                    <td>{quake.depth.toFixed(1)} km</td>
                    <td className="location-cell">
                      <div className="location-primary">{quake.location}</div>
                      <div className="location-secondary">{quake.region}</div>
                    </td>
                    <td>
                      {isMerged ? (
                        <div className="sources-badge" style={{ color: getConfidenceColor(quake.confidenceLevel) }}>
                          {quake.sources?.length} sources
                          {quake.confidenceLevel && ` (${quake.confidenceLevel})`}
                        </div>
                      ) : (
                        <div className="single-source">{quake.source}</div>
                      )}
                    </td>
                    <td>
                      <button className="details-button" onClick={() => setSelectedEarthquake(quake)}>
                        Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Hover Info */}
      {hoverInfo && (
        <div
          className="hover-info"
          style={{
            top: `${hoverInfo.y + 10}px`,
            left: `${hoverInfo.x + 10}px`,
          }}
        >
          <div className="hover-header">
            <div className="hover-magnitude" style={{ backgroundColor: getMagnitudeColor(hoverInfo.quake.magnitude) }}>
              {hoverInfo.quake.magnitude.toFixed(1)}
            </div>
            <div className="hover-title">{hoverInfo.quake.location}</div>
          </div>

          <div className="hover-details">
            <div className="hover-detail">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{new Date(hoverInfo.quake.time).toLocaleString()}</span>
            </div>
            <div className="hover-detail">
              <span className="detail-label">Coordinates:</span>
              <span className="detail-value">
                {hoverInfo.quake.latitude.toFixed(4)}, {hoverInfo.quake.longitude.toFixed(4)}
              </span>
            </div>
            <div className="hover-detail">
              <span className="detail-label">Energy Release:</span>
              <span className="detail-value">{hoverInfo.quake.energyRelease.toExponential(2)} J</span>
            </div>

            {hoverInfo.quake.tsunamiRisk > 0 && (
              <div className="hover-detail tsunami-risk">
                <span className="detail-label">Tsunami Risk:</span>
                <span className="detail-value">{(hoverInfo.quake.tsunamiRisk * 100).toFixed(1)}%</span>
              </div>
            )}

            {hoverInfo.quake.sources && hoverInfo.quake.sources.length > 1 && (
              <div className="hover-sources">
                <div className="sources-header">Data Sources:</div>
                <div className="sources-list">
                  {hoverInfo.quake.sources.map((source, index) => (
                    <div key={index} className="source-item">
                      {source.name}: {source.magnitude.toFixed(1)} {source.magnitudeType}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEarthquake && (
        <EarthquakeDetailModal earthquake={selectedEarthquake} onClose={() => setSelectedEarthquake(null)} />
      )}

      <style jsx>{`
        .github-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: #24292e;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .dashboard-title h1 {
          font-size: 24px;
          margin: 0 0 5px 0;
        }
        
        .dashboard-subtitle {
          color: #586069;
          font-size: 14px;
        }
        
        .dashboard-stats {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #f6f8fa;
          padding: 8px 12px;
          border-radius: 6px;
          min-width: 70px;
        }
        
        .stat-value {
          font-weight: 600;
          font-size: 18px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #586069;
        }
        
        .last-updated {
          font-size: 12px;
          color: #586069;
          align-self: flex-end;
        }
        
        .dashboard-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .search-box {
          flex: 1;
          min-width: 200px;
        }
        
        .search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .filter-controls {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #f6f8fa;
          padding: 8px 12px;
          border-radius: 6px;
        }
        
        .filter-group label {
          font-size: 14px;
          font-weight: 500;
        }
        
        .filter-group select {
          padding: 4px 8px;
          border: 1px solid #e1e4e8;
          border-radius: 4px;
          background-color: white;
        }
        
        .dashboard-tabs {
          display: flex;
          border-bottom: 1px solid #e1e4e8;
          margin-bottom: 20px;
        }
        
        .tab {
          padding: 8px 16px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #586069;
        }
        
        .tab:hover {
          color: #0366d6;
        }
        
        .tab.active {
          color: #24292e;
          border-bottom-color: #0366d6;
        }
        
        .earthquake-list {
          background-color: white;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .loading-state, .error-state, .empty-state {
          padding: 40px;
          text-align: center;
          color: #586069;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #0366d6;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .earthquake-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .earthquake-table th {
          text-align: left;
          padding: 12px 16px;
          background-color: #f6f8fa;
          border-bottom: 1px solid #e1e4e8;
          font-weight: 600;
          font-size: 14px;
        }
        
        .earthquake-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e1e4e8;
          font-size: 14px;
        }
        
        .earthquake-table tr:hover {
          background-color: #f6f8fa;
        }
        
        .merged-row {
          background-color: rgba(3, 102, 214, 0.05);
        }
        
        .significant-row td {
          font-weight: 500;
        }
        
        .recent-row {
          animation: highlight 2s ease-in-out;
        }
        
        @keyframes highlight {
          0% { background-color: rgba(46, 204, 113, 0.2); }
          100% { background-color: transparent; }
        }
        
        .magnitude-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          text-align: center;
          min-width: 40px;
        }
        
        .location-cell {
          max-width: 300px;
        }
        
        .location-primary {
          font-weight: 500;
          margin-bottom: 2px;
        }
        
        .location-secondary {
          font-size: 12px;
          color: #586069;
        }
        
        .sources-badge {
          font-weight: 500;
          font-size: 13px;
        }
        
        .single-source {
          font-size: 13px;
          color: #586069;
        }
        
        .details-button {
          padding: 4px 8px;
          background-color: #0366d6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .details-button:hover {
          background-color: #0256b9;
        }
        
        .hover-info {
          position: fixed;
          z-index: 1000;
          background-color: white;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          width: 300px;
          pointer-events: none;
          overflow: hidden;
        }
        
        .hover-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .hover-magnitude {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: white;
          font-weight: 600;
        }
        
        .hover-title {
          font-weight: 600;
          font-size: 14px;
        }
        
        .hover-details {
          padding: 12px;
        }
        
        .hover-detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .detail-label {
          color: #586069;
        }
        
        .detail-value {
          font-weight: 500;
        }
        
        .tsunami-risk {
          color: #d73a49;
          font-weight: 600;
        }
        
        .hover-sources {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e1e4e8;
        }
        
        .sources-header {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 8px;
        }
        
        .sources-list {
          font-size: 12px;
        }
        
        .source-item {
          margin-bottom: 4px;
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 15px;
          }
          
          .dashboard-stats {
            flex-wrap: wrap;
          }
          
          .filter-controls {
            flex-direction: column;
            width: 100%;
          }
          
          .filter-group {
            width: 100%;
          }
          
          .dashboard-tabs {
            overflow-x: auto;
            white-space: nowrap;
          }
          
          .location-cell {
            max-width: 150px;
          }
        }
      `}</style>
    </div>
  )
}
