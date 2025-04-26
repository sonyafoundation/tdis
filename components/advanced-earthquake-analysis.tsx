"use client"

import { useState, useEffect, memo } from "react"
import type { EnhancedEarthquakeData } from "@/lib/types"
import { calculateEnergyRelease } from "@/lib/earthquake-science/depth-analysis"

interface AdvancedEarthquakeAnalysisProps {
  earthquake: EnhancedEarthquakeData
}

function AdvancedEarthquakeAnalysis({ earthquake }: AdvancedEarthquakeAnalysisProps) {
  const [analysisData, setAnalysisData] = useState<any>(null)

  useEffect(() => {
    // Hesaplamaları bir kez yap ve önbelleğe al
    const calculateAnalysisData = () => {
      // Temel enerji hesaplaması
      const energy = calculateEnergyRelease(earthquake.magnitude)

      // Sismik moment hesaplama (M0 = μAD)
      const rigidity = 3.0e10 // N/m²
      const estimatedRuptureLength = earthquake.magnitude < 5 ? 0 : (earthquake.magnitude - 4) * 3 + Math.random() * 5 // km
      const estimatedRuptureWidth = Math.min(20, earthquake.magnitude * 2) // km
      const estimatedDisplacement = Math.pow(10, earthquake.magnitude - 6.0) * 0.1 // metre

      const ruptureArea = estimatedRuptureLength * estimatedRuptureWidth * 1e6 // m²
      const seismicMoment = rigidity * ruptureArea * estimatedDisplacement // N·m

      // Moment büyüklüğü hesaplama
      const calculatedMw = (2 / 3) * Math.log10(seismicMoment) - 6.06

      // Stres düşümü hesaplama
      const circularRadius = Math.sqrt(ruptureArea / Math.PI) // m
      const stressDrop = ((7 / 16) * (seismicMoment / Math.pow(circularRadius, 3))) / 1e6 // MPa

      // Yer ivmesi tahmini
      const distanceToSurface = earthquake.depth // km
      const a = -1.0
      const b = 0.5
      const c_pga = 1.0
      const estimatedPGA = Math.pow(10, a + b * earthquake.magnitude - c_pga * Math.log10(distanceToSurface)) // g

      // Maksimum yer hızı tahmini
      const estimatedPGV = (estimatedPGA * 100) / (2 * Math.PI) // cm/s

      // Deprem enerjisinin yüzde kaçının açığa çıktığı tahmini
      const expectedLargeEQEnergy = Math.pow(10, 4.8 + 1.5 * 7.5) // Joule
      const currentEQEnergy = energy.energyJoules
      const energyReleasePercentage = (currentEQEnergy / expectedLargeEQEnergy) * 100

      // Artçı deprem dağılımı
      const k = Math.pow(10, earthquake.magnitude - 4.5) // Büyüklüğe bağlı K değeri
      const c = 0.1 // gün
      const p = 1.1 // tipik değer

      // İlk 24 saat, 7 gün ve 30 gündeki beklenen artçı deprem sayıları
      const aftershocks24h = Math.round(k * Math.pow(1 / (1 + c), p - 1))
      const aftershocks7d = Math.round(k * Math.pow(7 / (7 + c), p - 1))
      const aftershocks30d = Math.round(k * Math.pow(30 / (30 + c), p - 1))

      // Tsunami dalga yüksekliği tahmini
      const a_tsunami = 0.015
      const b_tsunami = 0.7
      const c_tsunami = 0.005
      const estimatedWaveHeight =
        earthquake.tsunamiRisk > 0
          ? a_tsunami * Math.pow(10, b_tsunami * earthquake.magnitude) * Math.exp(-c_tsunami * earthquake.depth)
          : 0

      // Zemin büyütme faktörü
      const vs30 = 400 // m/s (varsayılan değer)
      const amplificationFactor = 2.5 - 0.003 * vs30 // Basitleştirilmiş formül

      // Deprem şiddeti tahmini
      const estimatedMMI = Math.min(
        12,
        Math.round(2.5 * earthquake.magnitude - 1.5 * Math.log10(distanceToSurface) - 0.5),
      )

      return {
        energy,
        seismicMoment,
        calculatedMw,
        stressDrop,
        estimatedRuptureLength,
        estimatedRuptureWidth,
        estimatedDisplacement,
        estimatedPGA,
        estimatedPGV,
        energyReleasePercentage,
        aftershocks: {
          hours24: aftershocks24h,
          days7: aftershocks7d,
          days30: aftershocks30d,
          bathLaw: earthquake.magnitude - 1.2,
        },
        tsunami: {
          waveHeight: estimatedWaveHeight,
          arrivalTime: earthquake.tsunamiRisk > 0 ? Math.sqrt(50) * 4 : 0,
          inundationDistance: estimatedWaveHeight * 10,
        },
        groundMotion: {
          pga: estimatedPGA,
          pgv: estimatedPGV,
          amplificationFactor,
          mmi: estimatedMMI,
        },
      }
    }

    // Hesaplamaları yap ve state'e kaydet
    setAnalysisData(calculateAnalysisData())
  }, [earthquake])

  if (!analysisData) return <div>Analiz hesaplanıyor...</div>

  return (
    <div className="advanced-analysis">
      <h3 className="analysis-title">Detaylı Sismik Analiz</h3>

      <div className="analysis-section">
        <h4>Sismik Moment ve Enerji Analizi</h4>
        <div className="formula-box">
          <div className="formula">M₀ = μAD</div>
          <div className="formula-description">
            M₀: Sismik moment (N·m), μ: Rijidite (3×10¹⁰ N/m²), A: Fay alanı (m²), D: Yer değiştirme (m)
          </div>
        </div>

        <div className="analysis-grid">
          <div className="analysis-item">
            <span className="item-label">Hesaplanan Sismik Moment:</span>
            <span className="item-value">{analysisData.seismicMoment.toExponential(2)} N·m</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Hesaplanan Moment Büyüklüğü:</span>
            <span className="item-value">Mw {analysisData.calculatedMw.toFixed(2)}</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Açığa Çıkan Enerji:</span>
            <span className="item-value">{analysisData.energy.energyJoules.toExponential(2)} Joule</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">TNT Eşdeğeri:</span>
            <span className="item-value">{analysisData.energy.energyTNT.toFixed(2)} ton</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Beklenen Mw 7.5 Depremine Oranı:</span>
            <span className="item-value">{analysisData.energyReleasePercentage.toExponential(2)}%</span>
          </div>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Fay Kırılma Parametreleri</h4>
        <div className="formula-box">
          <div className="formula">Δσ = (7/16) × (M₀/r³)</div>
          <div className="formula-description">
            Δσ: Stres düşümü (MPa), M₀: Sismik moment (N·m), r: Dairesel kırılma yarıçapı (m)
          </div>
        </div>

        <div className="analysis-grid">
          <div className="analysis-item">
            <span className="item-label">Tahmini Kırılma Uzunluğu:</span>
            <span className="item-value">{analysisData.estimatedRuptureLength.toFixed(1)} km</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Tahmini Kırılma Genişliği:</span>
            <span className="item-value">{analysisData.estimatedRuptureWidth.toFixed(1)} km</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Tahmini Yer Değiştirme:</span>
            <span className="item-value">{analysisData.estimatedDisplacement.toFixed(2)} m</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Stres Düşümü:</span>
            <span className="item-value">{analysisData.stressDrop.toFixed(2)} MPa</span>
          </div>
        </div>
      </div>

      <div className="analysis-section">
        <h4>Artçı Deprem Analizi (Omori Yasası)</h4>
        <div className="formula-box">
          <div className="formula">N(t) = K / (t + c)ᵖ</div>
          <div className="formula-description">N(t): t zamanındaki artçı deprem sayısı, K, c, p: Ampirik sabitler</div>
        </div>

        <div className="analysis-grid">
          <div className="analysis-item">
            <span className="item-label">İlk 24 Saatte Beklenen Artçı Sayısı:</span>
            <span className="item-value">{analysisData.aftershocks.hours24}</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">İlk 7 Günde Beklenen Artçı Sayısı:</span>
            <span className="item-value">{analysisData.aftershocks.days7}</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">İlk 30 Günde Beklenen Artçı Sayısı:</span>
            <span className="item-value">{analysisData.aftershocks.days30}</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">En Büyük Beklenen Artçı (Bath Yasası):</span>
            <span className="item-value">Mw {analysisData.aftershocks.bathLaw.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {earthquake.tsunamiRisk > 0 && (
        <div className="analysis-section">
          <h4>Tsunami Analizi</h4>
          <div className="formula-box">
            <div className="formula">H = a × 10^(b×M) × e^(-c×d)</div>
            <div className="formula-description">
              H: Dalga yüksekliği (m), M: Büyüklük, d: Derinlik (km), a, b, c: Ampirik sabitler
            </div>
          </div>

          <div className="analysis-grid">
            <div className="analysis-item">
              <span className="item-label">Tahmini Dalga Yüksekliği:</span>
              <span className="item-value">{analysisData.tsunami.waveHeight.toFixed(2)} m</span>
            </div>
            <div className="analysis-item">
              <span className="item-label">Tahmini Varış Süresi:</span>
              <span className="item-value">{analysisData.tsunami.arrivalTime.toFixed(0)} dakika</span>
            </div>
            <div className="analysis-item">
              <span className="item-label">Tahmini Su Basma Mesafesi:</span>
              <span className="item-value">{analysisData.tsunami.inundationDistance.toFixed(0)} m</span>
            </div>
          </div>
        </div>
      )}

      <div className="analysis-section">
        <h4>Yer Hareketi Parametreleri</h4>
        <div className="formula-box">
          <div className="formula">log(PGA) = a + b×M - c×log(R)</div>
          <div className="formula-description">
            PGA: En yüksek yer ivmesi (g), M: Büyüklük, R: Mesafe (km), a, b, c: Bölgesel katsayılar
          </div>
        </div>

        <div className="analysis-grid">
          <div className="analysis-item">
            <span className="item-label">Tahmini En Yüksek Yer İvmesi (PGA):</span>
            <span className="item-value">{analysisData.groundMotion.pga.toFixed(3)} g</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Tahmini En Yüksek Yer Hızı (PGV):</span>
            <span className="item-value">{analysisData.groundMotion.pgv.toFixed(1)} cm/s</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Zemin Büyütme Faktörü:</span>
            <span className="item-value">{analysisData.groundMotion.amplificationFactor.toFixed(1)}×</span>
          </div>
          <div className="analysis-item">
            <span className="item-label">Tahmini Şiddet (MMI):</span>
            <span className="item-value">{analysisData.groundMotion.mmi} (Mercalli)</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .advanced-analysis {
          font-family: 'JetBrains Mono', monospace;
          color: #e0e0e0;
          background-color: #252525;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 20px;
          margin-top: 20px;
        }
        
        .analysis-title {
          color: #00ff00;
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .analysis-section {
          margin-bottom: 25px;
          padding: 15px;
          background-color: #2a2a2a;
          border: 1px solid #333;
          border-radius: 4px;
        }
        
        .analysis-section h4 {
          color: #00ff00;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 16px;
        }
        
        .formula-box {
          background-color: #1e1e1e;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 15px;
        }
        
        .formula {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          text-align: center;
          margin-bottom: 5px;
          color: #00ffff;
        }
        
        .formula-description {
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        
        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
        }
        
        .analysis-item {
          display: flex;
          flex-direction: column;
          background-color: #1e1e1e;
          padding: 10px;
          border-radius: 4px;
        }
        
        .item-label {
          font-size: 12px;
          color: #888;
          margin-bottom: 5px;
        }
        
        .item-value {
          font-size: 14px;
          font-weight: 500;
          color: #00ff00;
        }
        
        @media (max-width: 768px) {
          .analysis-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

// Memoize edilmiş bileşeni dışa aktar
export default memo(AdvancedEarthquakeAnalysis)
