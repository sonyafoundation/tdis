# Deprem Konsolosu

Bu proje, deprem verilerini görselleştirmek ve analiz etmek için geliştirilmiş bir web uygulamasıdır.

## 🚀 Teknolojiler

- **Next.js 15** - React tabanlı web framework
- **TypeScript** - Tip güvenliği için
- **Tailwind CSS** - Stil ve tasarım için
- **Radix UI** - Kullanıcı arayüzü bileşenleri
- **Recharts** - Veri görselleştirme
- **React Hook Form** - Form yönetimi
- **Zod** - Form validasyonu
- **Next Themes** - Tema desteği

## 📦 Bağımlılıklar

Proje, modern web geliştirme araçlarını kullanmaktadır:

- React 19
- Node.js
- pnpm (paket yöneticisi)

## 🛠️ Kurulum

1. Projeyi klonlayın:
```bash
git clone [repo-url]
```

2. Proje dizinine gidin:
```bash
cd earthquakeconsolas
```

3. Bağımlılıkları yükleyin:
```bash
pnpm install
```

4. Geliştirme sunucusunu başlatın:
```bash
pnpm dev
```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## 📁 Proje Yapısı

```
├── app/              # Next.js uygulama sayfaları
├── components/       # Yeniden kullanılabilir UI bileşenleri
├── hooks/           # Özel React hook'ları
├── lib/             # Yardımcı fonksiyonlar ve utilities
├── public/          # Statik dosyalar
├── styles/          # Global stiller
└── types/           # TypeScript tip tanımlamaları
```

## 🔧 Geliştirme

- `pnpm dev` - Geliştirme sunucusunu başlatır
- `pnpm build` - Üretim için projeyi derler
- `pnpm start` - Üretim sunucusunu başlatır
- `pnpm lint` - Kod kalitesi kontrolü yapar

## 📝 Özellikler

- Deprem verilerinin gerçek zamanlı görselleştirilmesi
- Kullanıcı dostu arayüz
- Responsive tasarım
- Karanlık/Aydınlık tema desteği
- Detaylı deprem analizleri

## ⚠️ Hata Yönetimi

Proje aşağıdaki veri kaynaklarından deprem verilerini çeker:

- EMSC (European-Mediterranean Seismological Centre)
- Kandilli Rasathanesi
- AFAD (Afet ve Acil Durum Yönetimi Başkanlığı)
- Kandilli UDIM XML

Veri çekme işlemlerinde aşağıdaki hata durumlarıyla karşılaşabilirsiniz:

1. **Zaman Aşımı Hataları**
   - API istekleri 10 saniye sonra otomatik olarak iptal edilir
   - Boş veri dönen kaynaklar için 3 kez yeniden deneme yapılır

2. **Veri Kaynağı Hataları**
   - Herhangi bir kaynaktan veri alınamazsa, diğer kaynaklardan gelen veriler gösterilmeye devam eder
   - Hata durumları konsola loglanır ve kullanıcıya uygun hata mesajları gösterilir

3. **Çözüm Önerileri**
   - API isteklerinin başarısız olması durumunda:
     - İnternet bağlantınızı kontrol edin
     - API servislerinin erişilebilir olduğundan emin olun
     - Gerekirse proxy ayarlarınızı kontrol edin

## 🤝 Katkıda Bulunma

1. Bu projeyi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın. 