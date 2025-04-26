export interface EarthquakeData {
  id: string
  time: string
  magnitude: number
  depth: number
  latitude: number
  longitude: number
  location: string
  source: string
}

export interface SourceInfo {
  name: string
  magnitude: number
  magnitudeType: string
  time: string
  depth: number
  location: string
}

export interface MergeInfo {
  mergedCount: number
  sourceNames: string[]
  magnitudeVariance: number
  depthVariance: number
  locationVariance: number
  timeVariance: number
}

export interface EnhancedEarthquakeData extends EarthquakeData {
  region: string
  magnitudeType: string
  energyRelease: number
  tsunamiRisk: number
  pWaveVelocity?: number
  sWaveVelocity?: number
  felt?: number
  tsunami?: boolean
  intensity?: number
  status?: string
  alert?: string
  significance?: number
  faultMechanism?: string
  aftershockProbability?: number
  stressDropEstimate?: number
  ruptureLength?: number
  historicalContext?: string
  sources?: SourceInfo[]
  confidenceLevel?: "high" | "medium" | "low" | "single-source"
  mergeInfo?: MergeInfo
}

export interface FilterOptions {
  region: string
  minMagnitude: number
  maxMagnitude: number
  startDate: Date | null
  endDate: Date | null
}

export interface ApiSource {
  name: string
  fetchFunction: () => Promise<EnhancedEarthquakeData[]>
}

export interface GelismisDepremVerisi {
  id: string
  zaman: string
  buyukluk: number
  buyuklukTipi: string
  derinlik: number
  enlem: number
  boylam: number
  konum: string
  bolge: string
  il?: string
  ilce?: string
  kaynak: string
  enerjiSalinimJul: number
  tsunamiRiski: number
  pDalgaHizi?: number
  sDalgaHizi?: number
  siddet?: number
  fayMekanizmasi?: string
  artciOlasiligi?: number
  gerilmeDusumu?: number
  kirilmaUzunlugu?: number
  tarihselBaglam?: string
  felt?: number
  tsunami?: boolean
  durum?: string
  uyari?: string
  onem?: number
  zamanDetay: {
    tarih: string
    saat: string
    yerelSaat: string
    gecenSure: string
  }
  kaynaklar?: {
    ad: string
    buyukluk: number
    buyuklukTipi: string
    zaman: string
    derinlik: number
    konum: string
  }[]
  guvenSeviyesi?: "yuksek" | "orta" | "dusuk" | "tek-kaynak"
  birlestirmeBilgisi?: {
    birlestirilmisSayi: number
    kaynakAdlari: string[]
    buyuklukVaryans: number
    derinlikVaryans: number
    konumVaryans: number
    zamanVaryans: number
  }
}

export interface FiltreSecenekleri {
  bolge: string
  il: string
  ilce: string
  minBuyukluk: number
  maxBuyukluk: number
  baslangicTarihi: Date | null
  bitisTarihi: Date | null
}

export interface ApiKaynak {
  ad: string
  getirFonksiyonu: () => Promise<GelismisDepremVerisi[]>
}
