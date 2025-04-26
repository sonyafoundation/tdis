import type { GelismisDepremVerisi } from "./types"
import { tumDepremleriGetir } from "./deprem-api"

class DepremOnbellek {
  private veriler: GelismisDepremVerisi[] = []
  private sonGuncelleme = 0
  private guncellemeAraligi = 5000 // 5 saniye
  private guncellemeSureci: NodeJS.Timeout | null = null
  private guncellemeSuruyor = false
  private hataDenemeSayisi = 0
  private maksimumHataDenemesi = 5
  private hataAraligi = 10000 // 10 saniye

  constructor() {
    // Başlangıçta önbelleği doldur
    this.guncelle()

    // Düzenli güncelleme zamanlaması başlat
    this.guncellemeSureci = setInterval(() => {
      this.guncelle()
    }, this.guncellemeAraligi)
  }

  async getir(): Promise<GelismisDepremVerisi[]> {
    const simdi = Date.now()

    // Önbellek süresi dolmuşsa ve güncelleme devam etmiyorsa, güncelle
    if (simdi - this.sonGuncelleme > this.guncellemeAraligi && !this.guncellemeSuruyor) {
      await this.guncelle()
    }

    return this.veriler
  }

  private async guncelle(): Promise<void> {
    // Eğer güncelleme zaten devam ediyorsa, çık
    if (this.guncellemeSuruyor) {
      return
    }

    this.guncellemeSuruyor = true

    try {
      const yeniVeriler = await tumDepremleriGetir()

      if (yeniVeriler.length > 0) {
        this.veriler = yeniVeriler
        this.sonGuncelleme = Date.now()
        this.hataDenemeSayisi = 0 // Başarılı olduğunda hata sayacını sıfırla
      } else if (this.veriler.length === 0) {
        // Eğer hiç veri yoksa ve yeni veri de gelmezse, tekrar dene
        this.hataDenemeSayisi++

        if (this.hataDenemeSayisi <= this.maksimumHataDenemesi) {
          // Belirli bir süre sonra tekrar dene
          setTimeout(() => this.guncelle(), this.hataAraligi)
        }
      }
    } catch (hata) {
      this.hataDenemeSayisi++

      if (this.hataDenemeSayisi <= this.maksimumHataDenemesi) {
        // Hata durumunda belirli bir süre sonra tekrar dene
        setTimeout(() => this.guncelle(), this.hataAraligi)
      }
    } finally {
      this.guncellemeSuruyor = false
    }
  }

  durdur(): void {
    if (this.guncellemeSureci) {
      clearInterval(this.guncellemeSureci)
      this.guncellemeSureci = null
    }
  }
}

// Singleton örneği oluştur
export const DEPREM_ONBELLEK = new DepremOnbellek()
