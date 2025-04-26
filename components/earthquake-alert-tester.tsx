"use client"

import { useState, memo } from "react"
import MajorEarthquakeAlert from "./major-earthquake-alert"

// Memoize edilmiş MajorEarthquakeAlert bileşeni
const MemoizedMajorEarthquakeAlert = memo(MajorEarthquakeAlert)

export default function EarthquakeAlertTester() {
  const [showAlert, setShowAlert] = useState(false)
  const [magnitude, setMagnitude] = useState(7.2)
  const [tsunamiRisk, setTsunamiRisk] = useState(0.2)

  const handleTestClick = () => {
    setShowAlert(true)
  }

  // Test depremi verisi - her render'da yeniden oluşturmak yerine useMemo kullanabiliriz
  // ancak bu durumda magnitude ve tsunamiRisk değiştiğinde yeniden hesaplanması gerektiği için
  // doğrudan hesaplama daha mantıklı
  const testEarthquake = {
    id: "test-earthquake",
    time: new Date().toISOString(),
    magnitude: magnitude,
    magnitudeType: "Mw",
    depth: 15.5,
    latitude: 40.7128,
    longitude: 29.0626,
    location: "Marmara Denizi, İstanbul açıkları",
    region: "Marmara",
    source: "Test",
    energyRelease: Math.pow(10, 1.5 * magnitude + 4.8),
    tsunamiRisk: tsunamiRisk,
    faultMechanism: "Doğrultu Atımlı",
    ruptureLength: (magnitude - 4) * 3 + 2,
    aftershockProbability: 0.8,
  }

  return (
    <div className="alert-tester">
      <div className="tester-controls">
        <div className="control-group">
          <label htmlFor="magnitude">Test Deprem Büyüklüğü:</label>
          <input
            id="magnitude"
            type="range"
            min="6.5"
            max="8.5"
            step="0.1"
            value={magnitude}
            onChange={(e) => setMagnitude(Number.parseFloat(e.target.value))}
          />
          <span className="value-display">{magnitude.toFixed(1)}</span>
        </div>

        <div className="control-group">
          <label htmlFor="tsunami">Tsunami Riski:</label>
          <input
            id="tsunami"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={tsunamiRisk}
            onChange={(e) => setTsunamiRisk(Number.parseFloat(e.target.value))}
          />
          <span className="value-display">{(tsunamiRisk * 100).toFixed(0)}%</span>
        </div>

        <button className="test-button" onClick={handleTestClick}>
          Büyük Deprem Uyarısını Test Et
        </button>
      </div>

      {showAlert && <MemoizedMajorEarthquakeAlert earthquake={testEarthquake as any} isTest={true} />}

      <style jsx>{`
        .alert-tester {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 900;
        }
        
        .tester-controls {
          background-color: #252525;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 15px;
          width: 300px;
        }
        
        .control-group {
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
        }
        
        .control-group label {
          margin-bottom: 5px;
          font-size: 14px;
          color: #e0e0e0;
        }
        
        .control-group input {
          margin-bottom: 5px;
        }
        
        .value-display {
          font-size: 14px;
          color: #00ff00;
          font-weight: 500;
        }
        
        .test-button {
          width: 100%;
          padding: 10px;
          background-color: #ff6600;
          color: white;
          border: none;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          cursor: pointer;
          margin-top: 10px;
        }
        
        .test-button:hover {
          background-color: #ff3300;
        }
        
        @media (max-width: 768px) {
          .alert-tester {
            bottom: 10px;
            right: 10px;
          }
          
          .tester-controls {
            width: 250px;
          }
        }
      `}</style>
    </div>
  )
}
