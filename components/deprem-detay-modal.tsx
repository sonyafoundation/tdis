"use client"

import { useState } from "react"
import type { GelismisDepremVerisi } from "@/lib/types"
import { calculateEnergyRelease } from "@/lib/earthquake-science/depth-analysis"
import { calculateAftershockInfo } from "@/lib/earthquake-science/earthquake-types"
import { findNearestFaults } from "@/lib/fault-lines/turkey-fault-system"

interface DepremDetayModalProps {
  deprem: GelismisDepremVerisi
  onClose: () => void
}

export default function DepremDetayModal({ deprem, onClose }: DepremDetayModalProps) {
  const [activeTab, setActiveTab] = useState<"ozet" | "kaynaklar" | "teknik" | "json">("ozet")

  // Ek bilgileri hesapla
  const enerji = calculateEnergyRelease(deprem.buyukluk)
  const artciInfo = calculateAftershockInfo(deprem.buyukluk)
  const yakinFaylar = findNearestFaults(deprem.enlem, deprem.boylam)

  // Zamanı biçimlendir
  const formatliZaman = new Date(deprem.zaman).toLocaleString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  // Büyüklük rengini al
  const buyuklukRenginiAl = (buyukluk: number) => {
    if (buyukluk >= 7.0) return "#a8071a" // major
    if (buyukluk >= 6.0) return "#f5222d" // strong
    if (buyukluk >= 5.0) return "#fa8c16" // moderate
    if (buyukluk >= 4.0) return "#faad14" // light
    return "#52c41a" // minor
  }

  // Güven seviyesi rengi ve metni
  const guvenBilgisiniAl = () => {
    if (!deprem.guvenSeviyesi || deprem.guvenSeviyesi === "tek-kaynak") {
      return { renk: "#8c8c8c", metin: "Tek Kaynak" }
    }

    switch (deprem.guvenSeviyesi) {
      case "yuksek":
        return { renk: "#52c41a", metin: "Yüksek Güven" }
      case "orta":
        return { renk: "#faad14", metin: "Orta Güven" }
      case "dusuk":
        return { renk: "#f5222d", metin: "Düşük Güven" }
      default:
        return { renk: "#8c8c8c", metin: "Belirsiz" }
    }
  }

  const guvenBilgisi = guvenBilgisiniAl()

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="header-content">
            <div className="magnitude-badge" style={{ backgroundColor: buyuklukRenginiAl(deprem.buyukluk) }}>
              {deprem.buyukluk.toFixed(1)}
            </div>
            <div className="header-text">
              <h2>{deprem.konum}</h2>
              <p>{formatliZaman}</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="tabs">
          <button className={activeTab === "ozet" ? "active" : ""} onClick={() => setActiveTab("ozet")}>
            Özet
          </button>
          <button className={activeTab === "kaynaklar" ? "active" : ""} onClick={() => setActiveTab("kaynaklar")}>
            Veri Kaynakları ({deprem.kaynaklar?.length || 1})
          </button>
          <button className={activeTab === "teknik" ? "active" : ""} onClick={() => setActiveTab("teknik")}>
            Teknik Detaylar
          </button>
          <button className={activeTab === "json" ? "active" : ""} onClick={() => setActiveTab("json")}>
            JSON
          </button>
        </div>

        <div className="modal-content">
          {activeTab === "ozet" && (
            <div className="summary-tab">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Büyüklük:</span>
                  <span className="info-value">
                    {deprem.buyukluk.toFixed(2)} {deprem.buyuklukTipi}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Derinlik:</span>
                  <span className="info-value">{deprem.derinlik.toFixed(1)} km</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Koordinatlar:</span>
                  <span className="info-value">
                    {deprem.enlem.toFixed(4)}, {deprem.boylam.toFixed(4)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Bölge:</span>
                  <span className="info-value">{deprem.bolge}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Veri Güvenilirliği:</span>
                  <span className="info-value confidence" style={{ color: guvenBilgisi.renk }}>
                    {guvenBilgisi.metin}
                    {deprem.birlestirmeBilgisi && ` (${deprem.birlestirmeBilgisi.birlestirilmisSayi} kaynak)`}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Enerji Salınımı:</span>
                  <span className="info-value">{enerji.energyJoules.toExponential(2)} Joule</span>
                </div>
              </div>

              <div className="energy-section">
                <h3>Enerji Analizi</h3>
                <p>{enerji.energyDescription}</p>
                <ul>
                  {enerji.comparisons.map((comparison, index) => (
                    <li key={index}>{comparison}</li>
                  ))}
                </ul>
              </div>

              <div className="aftershock-section">
                <h3>Artçı Deprem Analizi</h3>
                <p>{artciInfo.description}</p>
                <div className="aftershock-stats">
                  <div className="stat-item">
                    <span className="stat-value">{(artciInfo.probability * 100).toFixed(0)}%</span>
                    <span className="stat-label">Olasılık</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{artciInfo.expectedCount}</span>
                    <span className="stat-label">Tahmini Sayı</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{artciInfo.durationDays} gün</span>
                    <span className="stat-label">Süre</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{artciInfo.magnitudeRange.max.toFixed(1)}</span>
                    <span className="stat-label">Max Büyüklük</span>
                  </div>
                </div>
              </div>

              {yakinFaylar.length > 0 && (
                <div className="faults-section">
                  <h3>Yakın Fay Hatları</h3>
                  <div className="faults-list">
                    {yakinFaylar.map((item, index) => (
                      <div key={index} className="fault-item">
                        <h4>
                          {item.fault.name} - {item.segment.name}
                        </h4>
                        <div className="fault-details">
                          <div className="fault-detail">
                            <span className="detail-label">Mesafe:</span>
                            <span className="detail-value">{item.distance} km</span>
                          </div>
                          <div className="fault-detail">
                            <span className="detail-label">Max Potansiyel Büyüklük:</span>
                            <span className="detail-value">{item.segment.maxPotentialMagnitude}</span>
                          </div>
                          <div className="fault-detail">
                            <span className="detail-label">30 Yıllık Kırılma Olasılığı:</span>
                            <span className="detail-value">{(item.ruptureProb30Years * 100).toFixed(1)}%</span>
                          </div>
                          <div className="fault-detail">
                            <span className="detail-label">Son Büyük Deprem:</span>
                            <span className="detail-value">
                              {item.segment.lastMajorEarthquake
                                ? `${item.segment.lastMajorEarthquake.year} (M${item.segment.lastMajorEarthquake.magnitude})`
                                : "Bilinmiyor"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "kaynaklar" && (
            <div className="sources-tab">
              <div className="sources-info">
                {deprem.birlestirmeBilgisi ? (
                  <div className="merge-stats">
                    <h3>Veri Birleştirme İstatistikleri</h3>
                    <div className="stat-grid">
                      <div className="stat-item">
                        <span className="stat-label">Birleştirilen Kaynak Sayısı:</span>
                        <span className="stat-value">{deprem.birlestirmeBilgisi.birlestirilmisSayi}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Büyüklük Varyansı:</span>
                        <span className="stat-value">{deprem.birlestirmeBilgisi.buyuklukVaryans.toFixed(2)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Derinlik Varyansı:</span>
                        <span className="stat-value">{deprem.birlestirmeBilgisi.derinlikVaryans.toFixed(2)} km</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Konum Varyansı:</span>
                        <span className="stat-value">{deprem.birlestirmeBilgisi.konumVaryans.toFixed(2)} km</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Zaman Varyansı:</span>
                        <span className="stat-value">{deprem.birlestirmeBilgisi.zamanVaryans.toFixed(2)} dakika</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="single-source-info">Bu deprem verisi tek bir kaynaktan alınmıştır.</p>
                )}
              </div>

              <h3>Veri Kaynakları</h3>
              <div className="sources-list">
                {(
                  deprem.kaynaklar || [
                    {
                      ad: deprem.kaynak,
                      buyukluk: deprem.buyukluk,
                      buyuklukTipi: deprem.buyuklukTipi,
                      zaman: deprem.zaman,
                      derinlik: deprem.derinlik,
                      konum: deprem.konum,
                    },
                  ]
                ).map((kaynak, index) => (
                  <div key={index} className="source-item">
                    <h4>{kaynak.ad}</h4>
                    <div className="source-details">
                      <div className="source-detail">
                        <span className="detail-label">Büyüklük:</span>
                        <span className="detail-value">
                          {kaynak.buyukluk.toFixed(2)} {kaynak.buyuklukTipi}
                        </span>
                      </div>
                      <div className="source-detail">
                        <span className="detail-label">Derinlik:</span>
                        <span className="detail-value">{kaynak.derinlik.toFixed(1)} km</span>
                      </div>
                      <div className="source-detail">
                        <span className="detail-label">Zaman:</span>
                        <span className="detail-value">{new Date(kaynak.zaman).toLocaleString("tr-TR")}</span>
                      </div>
                      <div className="source-detail">
                        <span className="detail-label">Konum:</span>
                        <span className="detail-value">{kaynak.konum}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "teknik" && (
            <div className="technical-tab">
              <h3>Bilimsel Hesaplamalar</h3>

              <div className="calculation-section">
                <h4>Moment Büyüklüğü (Mw)</h4>
                <div className="formula">
                  M<sub>w</sub> = (2/3) × log<sub>10</sub>(M<sub>0</sub>) - 10.7
                </div>
                <p>
                  Burada M<sub>0</sub> = sismik moment (dyne-cm) = μAD
                  <br />μ = kayanın rijitliği (tipik olarak 3×10<sup>11</sup> dyne/cm²)
                  <br />A = kırılma alanı
                  <br />D = ortalama yer değiştirme
                </p>
              </div>

              <div className="calculation-section">
                <h4>Enerji Salınımı</h4>
                <div className="formula">
                  log<sub>10</sub>(Enerji) = 1.5 × M<sub>w</sub> + 4.8
                </div>
                <p>
                  Hesaplanan enerji: {enerji.energyJoules.toExponential(2)} Joule
                  <br />
                  TNT eşdeğeri: {enerji.energyTNT.toFixed(2)} ton
                  <br />
                  Hiroşima atom bombası eşdeğeri: {enerji.energyHiroshima.toFixed(4)}
                </p>
              </div>

              <div className="calculation-section">
                <h4>Artçı Deprem Tahmini (Omori Yasası)</h4>
                <div className="formula">
                  n(t) = K / (t + c)<sup>p</sup>
                </div>
                <p>
                  Burada:
                  <br />
                  n(t) = t zamanındaki artçı deprem frekansı
                  <br />
                  K, c, p = geçmiş deprem sekanslarından belirlenen sabitler
                  <br />p tipik olarak 0.9-1.5 arasında değişir
                </p>
                <p>
                  Bath Yasası'na göre en büyük artçı depremin büyüklüğü:
                  <br />M<sub>artçı</sub> = M<sub>ana</sub> - 1.2 = {(deprem.buyukluk - 1.2).toFixed(1)}
                </p>
              </div>

              <div className="calculation-section">
                <h4>Coulomb Gerilme Transferi</h4>
                <div className="formula">ΔCFS = Δτ - μ'(Δσn)</div>
                <p>
                  Burada:
                  <br />
                  ΔCFS = Kırılma gerilmesindeki değişim
                  <br />
                  Δτ = Makaslama gerilmesindeki değişim
                  <br />
                  μ' = Etkin sürtünme katsayısı (fay zonları için tipik olarak 0.4)
                  <br />
                  Δσn = Normal gerilmedeki değişim
                </p>
              </div>
            </div>
          )}

          {activeTab === "json" && (
            <div className="json-tab">
              <pre>{JSON.stringify(deprem, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .magnitude-badge {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
        }
        
        .header-text h2 {
          margin: 0;
          font-size: 18px;
        }
        
        .header-text p {
          margin: 4px 0 0 0;
          color: #8c8c8c;
          font-size: 14px;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #8c8c8c;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .tabs button {
          padding: 12px 16px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 14px;
          color: #595959;
        }
        
        .tabs button.active {
          border-bottom-color: #1890ff;
          color: #1890ff;
          font-weight: 500;
        }
        
        .modal-content {
          padding: 24px;
          overflow-y: auto;
          max-height: calc(90vh - 120px);
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 12px;
          color: #8c8c8c;
        }
        
        .info-value {
          font-size: 16px;
          font-weight: 500;
        }
        
        .energy-section,
        .aftershock-section,
        .faults-section {
          margin-bottom: 24px;
        }
        
        .energy-section h3,
        .aftershock-section h3,
        .faults-section h3 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 16px;
          color: #262626;
        }
        
        .energy-section p,
        .aftershock-section p {
          margin-top: 0;
          margin-bottom: 12px;
        }
        
        .aftershock-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .stat-item {
          background-color: #f5f5f5;
          padding: 12px;
          border-radius: 6px;
          min-width: 100px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #1890ff;
          display: block;
        }
        
        .stat-label {
          font-size: 12px;
          color: #8c8c8c;
        }
        
        .faults-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .fault-item {
          background-color: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
        }
        
        .fault-item h4 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 14px;
        }
        
        .fault-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .fault-detail {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          font-size: 12px;
          color: #8c8c8c;
        }
        
        .detail-value {
          font-size: 14px;
          font-weight: 500;
        }
        
        .sources-tab .merge-stats {
          background-color: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        
        .sources-tab .merge-stats h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 16px;
        }
        
        .sources-tab .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .sources-tab .single-source-info {
          background-color: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        
        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .source-item {
          background-color: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
        }
        
        .source-item h4 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 14px;
        }
        
        .source-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .source-detail {
          display: flex;
          flex-direction: column;
        }
        
        .technical-tab .calculation-section {
          margin-bottom: 24px;
        }
        
        .technical-tab h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
        }
        
        .technical-tab h4 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 16px;
          color: #262626;
        }
        
        .technical-tab .formula {
          font-family: 'Courier New', monospace;
          background-color: #f5f5f5;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 12px;
          font-size: 16px;
        }
        
        .json-tab pre {
          background-color: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
          overflow: auto;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          white-space: pre-wrap;
        }
        
        @media (max-width: 768px) {
          .modal-container {
            width: 95%;
            max-height: 95vh;
          }
          
          .tabs {
            overflow-x: auto;
            white-space: nowrap;
          }
          
          .tabs button {
            padding: 12px 10px;
          }
          
          .info-grid,
          .fault-details,
          .sources-tab .stat-grid,
          .source-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
