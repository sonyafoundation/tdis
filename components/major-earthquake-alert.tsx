"use client"

import { useState, useEffect, memo } from "react"
import type { EnhancedEarthquakeData } from "@/lib/types"

interface MajorEarthquakeAlertProps {
  earthquake: EnhancedEarthquakeData
  isTest?: boolean
}

function MajorEarthquakeAlert({ earthquake, isTest = false }: MajorEarthquakeAlertProps) {
  const [visible, setVisible] = useState(true)
  const [pulsing, setPulsing] = useState(true)

  useEffect(() => {
    // 5 saniye sonra nabız efektini durdur
    const pulseTimer = setTimeout(() => {
      setPulsing(false)
    }, 5000)

    return () => {
      clearTimeout(pulseTimer)
    }
  }, [])

  // Deprem büyüklüğüne göre mesaj ve renk belirle
  const getMessage = () => {
    if (earthquake.magnitude >= 8.0) {
      return "ÇOK ŞİDDETLİ DEPREM! ACİL DURUM PROTOKOLÜ BAŞLATILDI!"
    } else if (earthquake.magnitude >= 7.5) {
      return "ŞİDDETLİ DEPREM! LÜTFEN GÜVENLİ BÖLGELERE GEÇİN!"
    } else if (earthquake.magnitude >= 7.0) {
      return "BÜYÜK DEPREM! DİKKATLİ OLUN!"
    } else {
      return "ÖNEMLİ DEPREM UYARISI!"
    }
  }

  const getColor = () => {
    if (earthquake.magnitude >= 8.0) return "#ff0000" // Kırmızı
    if (earthquake.magnitude >= 7.5) return "#ff3300" // Turuncu-kırmızı
    if (earthquake.magnitude >= 7.0) return "#ff6600" // Turuncu
    return "#ffcc00" // Sarı
  }

  // Tsunami riski varsa ek uyarı
  const hasTsunamiRisk = earthquake.tsunamiRisk > 0.1

  if (!visible) return null

  return (
    <div className={`major-earthquake-alert ${pulsing ? "pulsing" : ""} ${isTest ? "test-mode" : ""}`}>
      <div className="alert-header" style={{ backgroundColor: getColor() }}>
        <div className="alert-icon">⚠️</div>
        <div className="alert-title">{getMessage()}</div>
        <button className="close-button" onClick={() => setVisible(false)}>
          ×
        </button>
      </div>

      <div className="alert-body">
        <div className="alert-info">
          <div className="magnitude-display" style={{ backgroundColor: getColor() }}>
            {earthquake.magnitude.toFixed(1)}
          </div>
          <div className="earthquake-details">
            <div className="detail-location">{earthquake.location}</div>
            <div className="detail-time">{new Date(earthquake.time).toLocaleString()}</div>
            <div className="detail-depth">Derinlik: {earthquake.depth.toFixed(1)} km</div>
          </div>
        </div>

        <div className="alert-message">
          <p>
            <strong>Büyüklük {earthquake.magnitude.toFixed(1)}</strong> deprem meydana geldi. Bu büyüklükteki depremler
            ciddi hasara neden olabilir. Lütfen güvenli bir yerde kalın ve yetkililerin talimatlarını takip edin.
          </p>

          {hasTsunamiRisk && (
            <div className="tsunami-warning">
              <div className="tsunami-icon">🌊</div>
              <div className="tsunami-message">
                <strong>TSUNAMİ RİSKİ!</strong> Kıyı bölgelerinde yaşayanlar yüksek bölgelere çıkmalıdır. Tahmini
                tsunami dalga yüksekliği: {(earthquake.tsunamiRisk * 10).toFixed(1)} metre.
              </div>
            </div>
          )}

          {isTest && <div className="test-banner">TEST MODU - Gerçek bir deprem değildir</div>}
        </div>
      </div>

      <div className="alert-actions">
        <button className="action-button info-button">Detaylı Bilgi</button>
        <button className="action-button safety-button">Güvenlik Önlemleri</button>
        <button className="action-button share-button">Paylaş</button>
      </div>

      <style jsx>{`
        .major-earthquake-alert {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 600px;
          background-color: #1e1e1e;
          border: 2px solid #ff0000;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
          z-index: 1000;
          overflow: hidden;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .pulsing {
          animation: pulse 1s infinite alternate;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
          }
          100% {
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
          }
        }
        
        .test-mode {
          border: 2px dashed #ff6600;
        }
        
        .alert-header {
          display: flex;
          align-items: center;
          padding: 10px 15px;
          color: white;
          font-weight: bold;
        }
        
        .alert-icon {
          font-size: 24px;
          margin-right: 10px;
        }
        
        .alert-title {
          flex: 1;
          font-size: 18px;
          text-transform: uppercase;
        }
        
        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          margin-left: 10px;
        }
        
        .alert-body {
          padding: 15px;
          color: #e0e0e0;
        }
        
        .alert-info {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .magnitude-display {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          margin-right: 15px;
          color: white;
        }
        
        .earthquake-details {
          flex: 1;
        }
        
        .detail-location {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }
        
        .detail-time, .detail-depth {
          font-size: 14px;
          color: #aaa;
        }
        
        .alert-message {
          background-color: #252525;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
          line-height: 1.5;
        }
        
        .tsunami-warning {
          display: flex;
          align-items: center;
          background-color: rgba(0, 100, 255, 0.2);
          border: 1px solid #0066cc;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }
        
        .tsunami-icon {
          font-size: 24px;
          margin-right: 10px;
        }
        
        .tsunami-message {
          flex: 1;
          font-size: 14px;
        }
        
        .test-banner {
          background-color: #ff6600;
          color: white;
          text-align: center;
          padding: 5px;
          margin-top: 10px;
          border-radius: 4px;
          font-weight: bold;
        }
        
        .alert-actions {
          display: flex;
          gap: 10px;
          padding: 0 15px 15px 15px;
        }
        
        .action-button {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .info-button {
          background-color: #2c5282;
          color: white;
        }
        
        .safety-button {
          background-color: #2c7a7b;
          color: white;
        }
        
        .share-button {
          background-color: #4a5568;
          color: white;
        }
        
        @media (max-width: 768px) {
          .major-earthquake-alert {
            width: 95%;
          }
          
          .alert-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

// Memoize edilmiş bileşeni dışa aktar
export default memo(MajorEarthquakeAlert)
