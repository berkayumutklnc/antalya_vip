# Antalya VIP Transfer Rezervasyon Sistemi

Modern ve kullanıcı dostu VIP transfer rezervasyon sistemi. Almanya merkezli görünüm ile yurtdışından gelen turistler için tasarlanmıştır.

## 🚀 Özellikler

- **Çoklu Dil Desteği**: Türkçe, Almanca, İngilizce, Rusça
- **Multi-Step Rezervasyon Formu**: 5 adımlı kolay rezervasyon süreci
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Admin Paneli**: Rezervasyon yönetimi ve takvim görünümü
- **Rezervasyon Takip**: Müşteriler rezervasyonlarını takip edebilir
- **Firebase Entegrasyonu**: Güvenli veri yönetimi
- **EmailJS Entegrasyonu**: Otomatik e-posta bildirimleri

## 🛠 Teknolojiler

- **Frontend**: Next.js 15 (App Router, TypeScript)
- **Styling**: TailwindCSS
- **Backend**: Firebase (Firestore + Auth)
- **Form Yönetimi**: React Hook Form + Zod
- **Takvim**: FullCalendar.js
- **E-posta**: EmailJS
- **Hosting**: Vercel (EU Sunucuları)

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları
│   ├── admin/             # Admin paneli
│   ├── reservation/       # Rezervasyon sayfası
│   ├── track/            # Rezervasyon takip
│   ├── impressum/        # Yasal uyarı
│   ├── datenschutz/      # Gizlilik politikası
│   └── agb/              # Kullanım şartları
├── components/            # React bileşenleri
│   ├── Header.tsx        # Site başlığı
│   ├── Footer.tsx        # Site altbilgisi
│   ├── LanguageSelector.tsx # Dil seçici
│   └── ReservationForm.tsx  # Rezervasyon formu
├── contexts/             # React Context'leri
│   └── LanguageContext.tsx # Dil yönetimi
├── data/                 # Statik veriler
│   ├── locations.ts      # Lokasyon verileri
│   └── vehicles.ts       # Araç verileri
├── lib/                  # Yardımcı kütüphaneler
│   ├── firebase.ts       # Firebase yapılandırması
│   └── i18n.ts           # Çoklu dil desteği
└── types/                # TypeScript tip tanımları
    └── index.ts          # Ana tip tanımları
```

## 🚀 Kurulum

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd antalya_vip
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Firebase yapılandırması**
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Tarayıcıda açın**
```
http://localhost:3000
```

## 📋 Kullanım

### Rezervasyon Yapma
1. Ana sayfada "Rezervasyon Yap" butonuna tıklayın
2. 5 adımlı formu doldurun:
   - Lokasyon ve tarih seçimi
   - Kişi sayısı ve bebek koltuğu
   - Araç seçimi
   - İletişim bilgileri
   - Rezervasyon özeti
3. "Onayla" butonuna tıklayarak rezervasyonu tamamlayın

### Rezervasyon Takip
1. "Rezervasyonumu Gör" sayfasına gidin
2. Rezervasyon numarası ve e-posta adresinizi girin
3. Rezervasyon detaylarını görüntüleyin

### Admin Paneli
1. "/admin" sayfasına gidin
2. Admin bilgileriyle giriş yapın
3. Rezervasyonları yönetin ve takvim görünümünü kullanın

## 🌍 Dil Desteği

Sistem 4 dilde desteklenir:
- 🇩🇪 **Almanca** (Varsayılan)
- 🇬🇧 **İngilizce**
- 🇹🇷 **Türkçe**
- 🇷🇺 **Rusça**

Dil seçimi sağ üst köşedeki dil seçiciden yapılabilir.

## 🔧 Geliştirme

### Yeni Sayfa Ekleme
```bash
# Yeni sayfa oluştur
mkdir src/app/new-page
touch src/app/new-page/page.tsx
```

### Yeni Bileşen Ekleme
```bash
# Yeni bileşen oluştur
touch src/components/NewComponent.tsx
```

### Çeviri Ekleme
`src/lib/i18n.ts` dosyasında yeni çeviriler ekleyin.

## 📧 E-posta Bildirimleri

EmailJS kullanılarak otomatik e-posta bildirimleri gönderilir:
- Rezervasyon onayı
- İptal talepleri
- Admin bildirimleri

## 🔒 Güvenlik

- Firebase Security Rules ile veri güvenliği
- Form validasyonu (Zod)
- Admin erişim kontrolü
- HTTPS zorunluluğu

## 🚀 Deployment

### Vercel ile Deployment
1. Vercel hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Environment variables'ları ayarlayın
4. Deploy edin

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

## 📝 Lisans

Bu proje özel kullanım için geliştirilmiştir.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

- **E-posta**: info@antalya-vip-transfer.de
- **Telefon**: +49 123 456 789
- **Adres**: Musterstraße 123, 12345 Musterstadt, Deutschland

---

**Antalya VIP Transfer GmbH** - Lüks ve konforlu seyahat deneyimi
