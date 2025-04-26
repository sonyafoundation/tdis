"use client"

import { useEffect, useRef } from "react"
import type { EnhancedEarthquakeData } from "@/lib/types"
import { calculateEnergyRelease } from "@/lib/earthquake-science/depth-analysis"
import { calculateAftershockInfo } from "@/lib/earthquake-science/earthquake-types"
import { calculateTsunamiRisk } from "@/lib/early-warning/tsunami-risk"
import AdvancedEarthquakeAnalysis from "./advanced-earthquake-analysis"

interface EarthquakeDetailModalProps {
  earthquake: EnhancedEarthquakeData
  onClose: () => void
}

export default function EarthquakeDetailModal({ earthquake, onClose }: EarthquakeDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Close modal when pressing Escape
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [onClose])

  // Calculate energy release
  const energy = calculateEnergyRelease(earthquake.magnitude)

  // Calculate aftershock info
  const aftershockInfo = calculateAftershockInfo(earthquake.magnitude)

  // Calculate tsunami risk
  const tsunamiRiskResult = calculateTsunamiRisk({
    magnitude: earthquake.magnitude,
    depth: earthquake.depth,
    distance: 50, // Assumed distance to coast
    location: earthquake.location,
    underwaterLandslide: false,
    coastalTopography: "open",
    waterDepth: 1000,
  })

  // Get magnitude color
  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 7.0) return "#ff0000" // Red
    if (magnitude >= 6.0) return "#ff6600" // Orange
    if (magnitude >= 5.0) return "#ffcc00" // Yellow
    if (magnitude >= 4.0) return "#66ff33" // Light Green
    return "#00cc00" // Green
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
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <div className="magnitude-display" style={{ backgroundColor: getMagnitudeColor(earthquake.magnitude) }}>
            {earthquake.magnitude.toFixed(1)}
          </div>
          <div className="header-content">
            <h2>{earthquake.location}</h2>
            <p>{new Date(earthquake.time).toLocaleString()}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Magnitude:</span>
                <span className="detail-value">
                  {earthquake.magnitude.toFixed(2)} {earthquake.magnitudeType}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Depth:</span>
                <span className="detail-value">{earthquake.depth.toFixed(2)} km</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Region:</span>
                <span className="detail-value">{earthquake.region}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">
                  {earthquake.latitude.toFixed(4)}, {earthquake.longitude.toFixed(4)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{new Date(earthquake.time).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Source:</span>
                <span className="detail-value">{earthquake.source}</span>
              </div>
            </div>
          </div>

          {earthquake.sources && earthquake.sources.length > 1 && (
            <div className="detail-section">
              <h3>Data Sources</h3>
              <div className="confidence-level">
                <span className="confidence-label">Confidence Level:</span>
                <span className="confidence-value" style={{ color: getConfidenceColor(earthquake.confidenceLevel) }}>
                  {earthquake.confidenceLevel}
                </span>
              </div>
              <div className="sources-list">
                {earthquake.sources.map((source, index) => (
                  <div key={index} className="source-item">
                    <div className="source-name">{source.name}</div>
                    <div className="source-details">
                      <div className="source-detail">
                        <span className="detail-label">Magnitude:</span>
                        <span className="detail-value">
                          {source.magnitude.toFixed(2)} {source.magnitudeType}
                        </span>
                      </div>
                      <div className="source-detail">
                        <span className="detail-label">Depth:</span>
                        <span className="detail-value">{source.depth.toFixed(2)} km</span>
                      </div>
                      <div className="source-detail">
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{new Date(source.time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {earthquake.mergeInfo && (
                <div className="merge-info">
                  <h4>Merge Statistics</h4>
                  <div className="merge-stats">
                    <div className="merge-stat">
                      <span className="stat-label">Magnitude Variance:</span>
                      <span className="stat-value">{earthquake.mergeInfo.magnitudeVariance.toFixed(2)}</span>
                    </div>
                    <div className="merge-stat">
                      <span className="stat-label">Location Variance:</span>
                      <span className="stat-value">{earthquake.mergeInfo.locationVariance.toFixed(2)} km</span>
                    </div>
                    {earthquake.mergeInfo.timeVariance !== undefined && (
                      <div className="merge-stat">
                        <span className="stat-label">Time Variance:</span>
                        <span className="stat-value">{earthquake.mergeInfo.timeVariance.toFixed(2)} min</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="detail-section">
            <h3>Energy Analysis</h3>
            <p className="energy-description">{energy.energyDescription}</p>
            <div className="energy-comparisons">
              <h4>Energy Comparisons</h4>
              <ul>
                {energy.comparisons.map((comparison, index) => (
                  <li key={index}>{comparison}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="detail-section">
            <h3>Aftershock Analysis</h3>
            <p className="aftershock-description">{aftershockInfo.description}</p>
            <div className="aftershock-stats">
              <div className="aftershock-stat">
                <span className="stat-label">Probability:</span>
                <span className="stat-value">{(aftershockInfo.probability * 100).toFixed(0)}%</span>
              </div>
              <div className="aftershock-stat">
                <span className="stat-label">Expected Count:</span>
                <span className="stat-value">{aftershockInfo.expectedCount}</span>
              </div>
              <div className="aftershock-stat">
                <span className="stat-label">Duration:</span>
                <span className="stat-value">{aftershockInfo.durationDays} days</span>
              </div>
              <div className="aftershock-stat">
                <span className="stat-label">Max Magnitude:</span>
                <span className="stat-value">{aftershockInfo.magnitudeRange.max.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Tsunami Risk Analysis</h3>
            <div className={`tsunami-risk-indicator ${tsunamiRiskResult.riskLevel}`}>
              {tsunamiRiskResult.riskLevel.toUpperCase()}
            </div>
            <p className="tsunami-description">{tsunamiRiskResult.description}</p>
            {tsunamiRiskResult.riskLevel !== "none" && (
              <div className="tsunami-details">
                <div className="tsunami-detail">
                  <span className="detail-label">Estimated Wave Height:</span>
                  <span className="detail-value">{tsunamiRiskResult.estimatedWaveHeight.toFixed(1)} m</span>
                </div>
                <div className="tsunami-detail">
                  <span className="detail-label">Estimated Arrival Time:</span>
                  <span className="detail-value">{tsunamiRiskResult.estimatedArrivalTime.toFixed(0)} minutes</span>
                </div>
                <div className="tsunami-detail">
                  <span className="detail-label">Evacuation Recommendation:</span>
                  <span className="detail-value">{tsunamiRiskResult.evacuationRecommendation}</span>
                </div>
              </div>
            )}
          </div>

          {earthquake.faultMechanism && (
            <div className="detail-section">
              <h3>Fault Mechanism</h3>
              <p>{earthquake.faultMechanism}</p>
              {earthquake.ruptureLength && (
                <div className="fault-detail">
                  <span className="detail-label">Rupture Length:</span>
                  <span className="detail-value">{earthquake.ruptureLength.toFixed(1)} km</span>
                </div>
              )}
            </div>
          )}

          {earthquake.historicalContext && (
            <div className="detail-section">
              <h3>Historical Context</h3>
              <p>{earthquake.historicalContext}</p>
            </div>
          )}

          {earthquake.magnitude >= 5.0 && <AdvancedEarthquakeAnalysis earthquake={earthquake} />}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal-container {
          background-color: #1e1e1e;
          border: 1px solid #333;
          border-radius: 4px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          font-family: 'JetBrains Mono', monospace;
          color: #e0e0e0;
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #333;
          background-color: #252525;
          position: sticky;
          top: 0;
          z-index: 1;
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
        
        .header-content {
          flex: 1;
        }
        
        .header-content h2 {
          margin: 0 0 5px 0;
          font-size: 18px;
          color: #00ff00;
        }
        
        .header-content p {
          margin: 0;
          font-size: 14px;
          color: #888;
        }
        
        .close-button {
          background: none;
          border: none;
          color: #888;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          margin-left: 15px;
        }
        
        .close-button:hover {
          color: #00ff00;
        }
        
        .modal-body {
          padding: 15px;
        }
        
        .detail-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #252525;
          border: 1px solid #333;
          border-radius: 4px;
        }
        
        .detail-section h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 16px;
          color: #00ff00;
        }
        
        .detail-section h4 {
          margin: 15px 0 10px 0;
          font-size: 14px;
          color: #00ff00;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
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
        
        .confidence-level {
          margin-bottom: 15px;
        }
        
        .confidence-label {
          font-size: 14px;
          margin-right: 10px;
        }
        
        .confidence-value {
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .sources-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .source-item {
          background-color: #2a2a2a;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 10px;
        }
        
        .source-name {
          font-weight: 500;
          margin-bottom: 8px;
          color: #00ff00;
        }
        
        .source-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .source-detail {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        
        .merge-info {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #333;
        }
        
        .merge-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        
        .merge-stat {
          display: flex;
          flex-direction: column;
          background-color: #2a2a2a;
          padding: 10px;
          border-radius: 4px;
        }
        
        .energy-description, .aftershock-description, .tsunami-description {
          margin-bottom: 15px;
          line-height: 1.5;
        }
        
        .energy-comparisons ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .energy-comparisons li {
          margin-bottom: 5px;
        }
        
        .aftershock-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
        }
        
        .aftershock-stat {
          background-color: #2a2a2a;
          padding: 10px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
        }
        
        .stat-label {
          font-size: 12px;
          color: #888;
        }
        
        .stat-value {
          font-weight: 500;
          color: #00ff00;
        }
        
        .tsunami-risk-indicator {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-weight: bold;
          margin-bottom: 15px;
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
          background-color: #2a2a2a;
          padding: 10px;
          border-radius: 4px;
        }
        
        .fault-detail {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
        }
        
        @media (max-width: 768px) {
          .modal-container {
            width: 100%;
            max-height: 85vh;
          }
          
          .detail-grid, .sources-list, .merge-stats, .aftershock-stats, .tsunami-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
