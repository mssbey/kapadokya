# Discovery Cappadocia

Discovery Cappadocia; çok dilli tur kataloğu, gerçek zamanlı müsaitlik, rezervasyon, Stripe/iyzico ödeme akışları ve operasyon ekibi için kapsamlı bir yönetim paneli sunan tam yığın bir seyahat platformudur.

PostgreSQL artık tur içeriği, fiyat, çeviri, görsel, ek hizmet ve satış durumunun tek gerçek veri kaynağıdır. Admin panelinde yapılan bir değişiklik aynı API üzerinden ana sayfa, tur listesi, detay, sitemap ve rezervasyon akışına ulaşır. Eski statik tur/fiyat fallback’i kullanılmaz.

> Üretim veritabanına migration uygulamadan önce mutlaka doğrulanmış bir yedek alın. Gerçek `.env` dosyaları ve ödeme/depolama anahtarları repoya eklenmemelidir.

## İçindekiler

- [Öne çıkan özellikler](#öne-çıkan-özellikler)
- [Mimari](#mimari)
- [Teknoloji yığını](#teknoloji-yığını)
- [Yerel kurulum](#yerel-kurulum)
- [Ortam değişkenleri](#ortam-değişkenleri)
- [Veri modeli ve migration](#veri-modeli-ve-migration)
- [Admin paneli](#admin-paneli)
- [Rezervasyon ve ödeme güvenliği](#rezervasyon-ve-ödeme-güvenliği)
- [Medya yönetimi](#medya-yönetimi)
- [API özeti](#api-özeti)
- [Test ve kalite kontrolleri](#test-ve-kalite-kontrolleri)
- [Canlı dağıtım](#canlı-dağıtım)
- [Yedekleme ve geri yükleme](#yedekleme-ve-geri-yükleme)
- [Canlıya çıkış kontrol listesi](#canlıya-çıkış-kontrol-listesi)
- [Bilinen operasyonel notlar](#bilinen-operasyonel-notlar)

## Öne çıkan özellikler

### Canlı müşteri sitesi

- İngilizce, Türkçe, İspanyolca, İtalyanca ve Rusça locale rotaları
- PostgreSQL/API tabanlı ana sayfa vitrinleri, katalog, arama, kategori ve tur detayları
- Locale’e göre `TourTranslation`, eksik içerikte kontrollü İngilizce fallback
- Veritabanı tabanlı SEO başlığı/açıklaması, canonical slug, Open Graph ve dinamik sitemap
- Slug değişikliklerinde eski URL’yi yeni canonical URL’ye yönlendiren alias sistemi
- Taban fiyat, aktif indirim ve tarih fiyatının liste/detay/rezervasyonda ortak hesaplanması
- Güvenli yükleniyor, boş ve API hata durumları; eski fiyat gösteren mock fallback yoktur
- Yedi adımlı misafir veya üyeli rezervasyon akışı
- Responsive tasarım, koyu tema, erişilebilir form kontrolleri ve mobil kullanım

### Yönetim paneli

- Backend’de JWT doğrulaması ve `ADMIN` rolüyle korunan tüm `/api/admin/*` uçları
- `httpOnly` oturum cookie’si, double-submit CSRF koruması ve login rate limit
- Beş dil sekmeli tur editörü
- Tam tur CRUD, kopyalama, önizleme, soft-delete, hızlı fiyat ve toplu aktif/pasif işlemleri
- Cloudinary’ye çoklu yükleme, ilerleme, kapak, alt metin, sıralama ve güvenli silme
- 30/60/90 günlük müsaitlik; toplu gün/hafta günü, kapasite, blok ve özel fiyat yönetimi
- Aranabilir/filtrelenebilir rezervasyonlar, durum geçmişi, iç not, CSV ve yazdırma görünümü
- Ödeme, kullanıcı+misafir müşteri, müşteri rezervasyon geçmişi ve promosyon yönetimi
- Günlük/aylık/toplam gelir, rezervasyon durumları, kapasite uyarıları, son satışlar ve en çok satan turlar
- Admin mutation, ödeme ve medya işlemleri için audit kayıtları

## Mimari

```mermaid
flowchart LR
    C[Müşteri / Admin] --> F[Next.js frontend · Vercel]
    F -->|HTTPS REST + cookie/CSRF| B[Express API · uzun yaşayan container]
    F -.->|wss| B
    B --> P[(PostgreSQL)]
    B --> R[(Redis)]
    B --> CL[Cloudinary]
    B --> S[Stripe]
    B --> I[iyzico]
    S -->|imzalı webhook| B
    I -->|callback + API doğrulama| B
```

Önerilen üretim yerleşimi:

- Frontend: Vercel
- Express API/WebSocket: Render, Railway, Fly.io veya eşdeğer uzun yaşayan Node.js/container servisi
- Veritabanı: yönetilen PostgreSQL; mümkünse pooler URL’si ve sınırlı bağlantı sayısı
- Cache: yönetilen Redis
- Medya: Cloudinary

`vercel.json` yalnızca frontend’i derler. Express API’nin Vercel fonksiyonu gibi çalıştığı varsayılmaz. Backend için [backend/Dockerfile](backend/Dockerfile) ve örnek [render.yaml](render.yaml) sağlanır.

## Teknoloji yığını

| Katman | Teknoloji |
| --- | --- |
| Frontend | Next.js 15 App Router, React 18, TypeScript |
| Arayüz | Tailwind CSS, Framer Motion, Lucide |
| İstemci durumu | Zustand |
| API istemcisi | Axios / server-side Fetch |
| Backend | Node.js, Express 4, TypeScript, Zod |
| Veritabanı | PostgreSQL, Prisma ORM |
| Cache | Redis / ioredis; yoksa güvenli cache’siz çalışma |
| Oturum | JWT’nin `httpOnly` cookie içinde taşınması, bcrypt, CSRF token |
| Medya | Cloudinary; `MediaStorage` servis soyutlaması |
| Ödeme | Stripe PaymentIntent/webhook, iyzico Checkout Form/callback |
| Gerçek zaman | `ws` WebSocket sunucusu |
| Yerel servisler | Docker Compose |

Node.js 20 LTS ve npm önerilir.

## Proje yapısı

```text
discovery-cappadocia/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── create-admin.ts
│   ├── src/
│   │   ├── lib/          # Prisma, Redis, katalog, session, slug, audit
│   │   ├── middleware/   # auth ve merkezi hata yönetimi
│   │   ├── routes/       # public, ödeme ve admin REST uçları
│   │   ├── services/     # storage ve rezervasyon durum işlemleri
│   │   └── index.ts
│   ├── tests/run.ts
│   └── Dockerfile
├── frontend/
│   ├── src/app/[locale]/
│   ├── src/components/admin/
│   ├── src/lib/catalogApi.ts
│   └── src/store/
├── docker-compose.yml
├── render.yaml
└── vercel.json
```

## Yerel kurulum

### 1. Servisleri başlatın

```bash
docker compose up -d postgres redis
```

Compose varsayılanları PostgreSQL için `postgres:postgres`, veritabanı için `discovery_cappadocia`, Redis için `localhost:6379` kullanır. Bu değerler yalnızca yerel geliştirme içindir.

### 2. Ortam dosyalarını oluşturun

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

Bash:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 3. Backend’i hazırlayın

```bash
cd backend
npm ci
npm run prisma:generate
npm run prisma:deploy
```

İsteğe bağlı demo içerik yalnızca geliştirmede:

```bash
npm run prisma:seed
```

Seed üretimde varsayılan olarak engellidir; mevcut tur, çeviri, müsaitlik, rezervasyon veya admin içeriğini güncellemez. Eksik demo kayıtlarını oluşturur. Üretimde seed’i rutin deploy adımı yapmayın.

### 4. İlk admini güvenli oluşturun

`backend/.env` içine bir defalığına `ADMIN_EMAIL`, en az 12 karakterli `ADMIN_PASSWORD`, `ADMIN_NAME` ve isteğe bağlı `ADMIN_PHONE` yazın:

```bash
npm run admin:create
```

Komut kullanıcıyı güvenli bcrypt hash’iyle oluşturur veya belirtilen hesabı admin yapar. İşlemden sonra `ADMIN_PASSWORD` değerini ortamdan kaldırın/rotate edin. Seed sabit admin veya sabit parola oluşturmaz.

### 5. Uygulamaları çalıştırın

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm ci
npm run dev
```

Örnek adresler:

- Site: `http://localhost:3000/tr`
- Admin: `http://localhost:3000/tr/admin`
- API health: `http://localhost:4000/health`
- WebSocket: `ws://localhost:4000/ws`

## Ortam değişkenleri

Gerçek değerlerin tamamı secret manager/Vercel/hosting panelinde tutulmalıdır.

### Backend

| Değişken | Gerekli | Açıklama |
| --- | --- | --- |
| `PORT` | Hayır | API portu; örnek `4000`, kod varsayılanı `5000` |
| `NODE_ENV` | Evet | `development`, `test` veya `production` |
| `BACKEND_URL` | iyzico için | Dışarıdan erişilen HTTPS API kökü; ör. `https://api.example.com` |
| `DATABASE_URL` | Evet | PostgreSQL bağlantısı; production’da pooler/SSL ayarlarını sağlayıcıya göre ekleyin |
| `REDIS_URL` | Önerilir | Redis bağlantısı; erişilemezse API cache olmadan devam eder |
| `JWT_SECRET` | Evet | En az 32 rastgele bayt; hiçbir public değişkende bulunmamalı |
| `COOKIE_SECURE` | Production | HTTPS’te `true`; production kodu da secure cookie zorlar |
| `COOKIE_SAME_SITE` | Evet | Aynı site alt alanlarında `lax`; ilgisiz domainlerde `none` + HTTPS |
| `COOKIE_DOMAIN` | Hayır | Paylaşılan üst domain gerekiyorsa `.example.com` |
| `FRONTEND_URL` | Evet | Tek izinli CORS origin’i |
| `FRONTEND_URLS` | Preview için | Virgülle ayrılmış kesin origin listesi; wildcard kullanmayın |
| `STRIPE_SECRET_KEY` | Stripe için | Server secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe için | Endpoint signing secret |
| `IYZICO_API_KEY` | iyzico için | Sandbox/canlı API anahtarı |
| `IYZICO_SECRET_KEY` | iyzico için | Sandbox/canlı secret |
| `IYZICO_BASE_URL` | iyzico için | Sandbox veya canlı API URL’si |
| `IYZICO_DEFAULT_IDENTITY_NUMBER` | iyzico için | Sağlayıcı isteğinde gerekli operasyonel varsayılan |
| `IYZICO_DEFAULT_ADDRESS` | iyzico için | Sağlayıcı isteğinde gerekli operasyonel varsayılan |
| `CLOUDINARY_CLOUD_NAME` | Upload için | Cloudinary cloud adı |
| `CLOUDINARY_API_KEY` | Upload için | Sadece backend anahtarı |
| `CLOUDINARY_API_SECRET` | Upload için | Sadece backend secret; `NEXT_PUBLIC_*` yapmayın |
| `CLOUDINARY_FOLDER` | Hayır | Varsayılan `discovery-cappadocia/tours` |
| `MAX_IMAGE_UPLOAD_MB` | Hayır | Backend upload limiti; varsayılan 8 MB |
| `ALLOWED_MEDIA_HOSTS` | Dış URL için | Virgülle ayrılmış HTTPS host allowlist’i |
| `ADMIN_EMAIL` | Provision sırasında | Tek seferlik admin e-postası |
| `ADMIN_PASSWORD` | Provision sırasında | En az 12 karakter; sonrasında kaldırın |
| `ADMIN_NAME`, `ADMIN_PHONE` | Hayır | Admin profil alanları |
| `ALLOW_PRODUCTION_SEED` | Hayır | Varsayılan `false`; rutin production’da açmayın |

### Frontend / Vercel

| Değişken | Gerekli | Açıklama |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Evet | Tarayıcının eriştiği tam API yolu; ör. `https://api.example.com/api` |
| `API_INTERNAL_URL` | Önerilir | Server-side katalog/sitemap fetch URL’si; private backend URL olabilir |
| `NEXT_PUBLIC_WS_URL` | WebSocket için | Production’da `wss://api.example.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe için | Publishable key; secret değildir |
| `NEXT_PUBLIC_SITE_URL` | Evet | Canonical public site kökü |
| `NEXT_PUBLIC_GTM_ID` | Hayır | Google Tag Manager container kimliği |

`API_INTERNAL_URL` ve `NEXT_PUBLIC_API_URL` `/api` gibi relative verilirse server-side fetch bunu `NEXT_PUBLIC_SITE_URL` ile mutlak URL’ye çevirir. Ayrı backend dağıtımında iki değeri de tam URL yapmak daha nettir.

## Veri modeli ve migration

Başlıca modeller:

- `Tour`: satış, fiyat, tur tipi, kapasite varsayılanları, yayın/öne çıkarma/rezervasyon ve soft-delete alanları
- `TourTranslation`: `(tourId, locale)` benzersiz; içerik, buluşma, iptal ve SEO
- `TourImage`: provider/storage kimliği, güvenli URL, metadata, alt metin, sıra ve kapak
- `TourSlugAlias`: eski slug → canonical tur eşlemesi
- `TourUpsell`: tur ek hizmetleri
- `Availability`: tarih bazlı kapasite, kalan koltuk, fiyat override ve blok
- `Booking`: benzersiz rezervasyon numarası, server fiyat kırılımı, promo claim ve kısa ömürlü payment access hash’i
- `BookingStatusHistory`: idempotent durum geçiş geçmişi
- `Payment`: provider referansı, tutar, para birimi, hata ve işlem zamanı
- `PaymentWebhookEvent`: `(provider, eventId)` benzersiz webhook idempotency kaydı
- `PromoCode`: tarih, limit, minimum sepet, para birimi ve tur kapsamı
- `AuditLog`: aktör, işlem, entity ve güvenli metadata

Migration sırası:

1. `20240201000000_baseline`: temiz PostgreSQL’de orijinal şemanın tamamını kurar.
2. `20260807120000_booking_trust_features`: misafir rezervasyonu ve promosyon altyapısını ekler.
3. `20260812170000_admin_live_catalog`: canlı katalog, çeviri, medya, alias, audit, fiyat ve ödeme güvenliği modellerini veri kaybetmeden ekler; eski İngilizce tur alanları ve `images[]` kayıtlarını yeni tablolara taşır.

Temiz veritabanı:

```bash
cd backend
npm run prisma:deploy
```

Mevcut eski üretim veritabanı için:

1. Snapshot/`pg_dump` alın ve restore ederek doğrulayın.
2. `_prisma_migrations` tablosunu ve mevcut tabloları inceleyin.
3. Veritabanında baseline tabloları zaten mevcutsa ve orijinal şemayla eşleşiyorsa yalnızca baseline’ı uygulanmış olarak işaretleyin:

```bash
npx prisma migrate resolve --applied 20240201000000_baseline
npm run prisma:deploy
```

Bu `resolve` komutunu boş veritabanında veya şema eşleşmesi doğrulanmadan çalıştırmayın. Production’da `prisma db push` kullanmayın.

## Admin paneli

Admin rotası locale önekini korur: `/en/admin`, `/tr/admin` vb. Sidebar Türkçe/İngilizce locale’e uyumludur; tur içeriği beş locale’de yönetilir.

### Turlar

- Arama, kategori/durum filtresi ve sayfalama
- Beş dilde başlık, kısa/uzun açıklama, highlights, dahil/hariç, buluşma, iptal, SEO
- Benzersiz slug ve değişiklikte otomatik alias
- Kategori, tur tipi, video, süre/saat, kapasite ve katılımcı kuralları
- Taban/indirimli fiyat, currency, çocuk oranı ve özel tur çarpanı
- Aktif, öne çıkan, rezervasyona açık ve sıra alanları
- Ek hizmetler
- Önizleme, kopyalama, hızlı fiyat, toplu durum ve soft-delete
- Kaydedilmemiş değişiklik uyarısı ve çift gönderim engeli

Rezervasyonu olan tur fiziksel silinmez; pasif ve soft-delete yapılır.

### Müsaitlik

- 30/60/90 günlük operasyon görünümü
- Tek gün veya tarih aralığında kapasite, özel fiyat ve blok
- Hafta günü seçerek toplu uygulama
- Satılan/kalan, düşük kapasite, tükenmiş ve eksik kayıt gösterimi
- Kapasite mevcut satılan koltuğun altına indirilemez
- Tarihi bloklamak mevcut rezervasyonları otomatik iptal etmez
- Mutation sonrasında ilgili Redis katalog/müsaitlik anahtarları temizlenir

### Rezervasyonlar

- Rezervasyon numarası, müşteri, iletişim, tur/tarih, kişi, özel tur, upsell, promo ve fiyat kırılımı
- Tur, tarih aralığı, rezervasyon ve ödeme durumu filtreleri
- En yeni/en eski sıralama, sayfalama ve arama
- Detay modalı, iç not, durum geçmişi, CSV ve yazdırma
- Masaüstü tablo ve mobil kart görünümü

### Müşteriler ve promosyonlar

- Üyeler ve misafirler aynı yetkili görünümde birleştirilir
- İsim/e-posta/telefon araması, sayfalama ve tıklanabilir rezervasyon geçmişi
- Promo: yüzde/sabit, tarih, kullanım limiti/sayısı, minimum sepet, currency, tur kapsamı ve aktiflik

## Rezervasyon ve ödeme güvenliği

1. Backend aktif/yayınlanmış/rezervasyona açık turu, tarihi, koltuğu ve seçilen upsell’leri doğrular.
2. Fiyat backend’de tarih override → aktif indirim → taban fiyat sırasıyla hesaplanır. Frontend’den toplam fiyat kabul edilmez.
3. Koltuk düşme, promo claim ve rezervasyon oluşturma transaction içinde atomiktir.
4. Misafir rezervasyonu için ham değeri sadece oluşturma yanıtında dönen, hash’i DB’de tutulan kısa ömürlü payment access token oluşturulur.
5. Üye sahipliği, admin rolü veya doğru payment token olmadan ödeme başlatılamaz.
6. Aynı rezervasyon için aktif provider session tekrar oluşturulmaz; Stripe idempotency key kullanılır.

Stripe webhook:

- Ham body üzerinde signing secret ile imza doğrulanır.
- `PaymentWebhookEvent(provider,eventId)` tekrarları engeller.
- Başarılı ödeme rezervasyonu `CONFIRMED`, refund güvenli şekilde `CANCELLED` yapar.
- Kart numarası/CVC hiçbir zaman backend’e veya veritabanına gelmez.

iyzico callback:

- Callback’teki token tek başına güvenilmez.
- Backend iyzico API’den Checkout Form sonucunu yeniden getirir.
- `basketId`, tutar, currency ve payment status DB kaydıyla eşleşmeden ödeme tamamlanmaz.
- Başarısızlık nedeni admin ödeme ekranında saklanır.

Rezervasyon durumları `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`’dır. Tekrarlanan iptal koltuğu ikinci kez eklemez. `CANCELLED` durumundan çıkarken koltuk yeniden atomik rezerve edilir; kapasite yoksa geçiş reddedilir.

## Medya yönetimi

Upload’lar uygulama diskine yazılmaz. Backend `MediaStorage` arayüzü üzerinden Cloudinary kullanır; ileride S3/R2 adaptörü aynı servis sınırında eklenebilir.

- Kabul edilen türler: JPEG, PNG, WebP
- Varsayılan limit: dosya başına 8 MB
- Multer memory storage → Cloudinary signed server upload
- Cloudinary secret’ları tarayıcıya gönderilmez
- Çoklu yükleme ve frontend upload progress
- Kapak, sıra ve alt metin DB’de tutulur
- Silme önce ilişki/kimlik doğrular; sonra Cloudinary `destroy(..., invalidate:true)` ve DB temizliği yapar
- Dış URL yalnız HTTPS ve `ALLOWED_MEDIA_HOSTS` listesindeyse kabul edilir
- Cloudinary teslim URL’lerinde `f_auto`, `q_auto` ve genişlik dönüşümleri uygulanır

Cloudinary panelinde bir cloud oluşturun, server-side API key/secret değerlerini backend ortamına ekleyin. Unsigned browser upload preset gerekmez.

## API özeti

Tüm API yolları `/api` öneki altındadır. Başarılı yanıtlar `{ success: true, data, ... }`, hatalar merkezi handler üzerinden güvenli `message` ile döner.

### Public/auth

| Metot | Yol | Amaç |
| --- | --- | --- |
| `POST` | `/auth/register` | Üye oluşturur, session+CSRF cookie set eder |
| `POST` | `/auth/login` | Rate limited login |
| `POST` | `/auth/logout` | Cookie’leri temizler; CSRF gerekir |
| `GET` | `/auth/me` | Aktif kullanıcı |
| `GET` | `/tours` | Locale, arama, kategori ve featured katalog |
| `GET` | `/tours/category/:category` | Kategori; dinamik slug’dan önce tanımlıdır |
| `GET` | `/tours/:slug` | Locale detay ve canonical alias metadata |
| `GET` | `/availability/:tourId` | Tarih aralığı müsaitlik |
| `GET` | `/availability/:tourId/:date` | Tek gün |
| `GET` | `/availability/last-minute/list` | Yakın tarih fırsatları |
| `POST` | `/bookings` | Atomik rezervasyon ve server pricing |
| `GET` | `/bookings/my` | Üyenin rezervasyonları |
| `POST` | `/payments/create-intent` | Sahiplik/token kontrollü Stripe/iyzico başlangıcı |
| `POST` | `/payments/webhook/stripe` | İmzalı/idempotent Stripe webhook |
| `POST` | `/payments/webhook/iyzico` | API üzerinden doğrulanan iyzico callback |

### Admin

`/admin/dashboard`, `/admin/analytics/revenue`, `/admin/tours`, `/admin/bookings`, `/admin/availability`, `/admin/payments`, `/admin/customers`, `/admin/promo-codes`, `/admin/audit-logs` uçları ve bunların mutation/detail/export alt uçları ADMIN rolü gerektirir. Medya upload/reorder/update/delete uçları `/admin/tours/:tourId/images...` altındadır.

Sayfalı uçlar `page`, `limit`, `total`, `totalPages` değerlerini döner. Browser cookie oturumu kullanırken mutation istekleri `dc_csrf` cookie değerini `x-csrf-token` başlığında göndermelidir; ortak Axios istemcisi bunu otomatik yapar. Bearer token desteği servis/test istemcileri içindir.

## Test ve kalite kontrolleri

Backend:

```bash
cd backend
npm run check       # prisma validate + tsc --noEmit
npm run build
```

Entegrasyon testi yalnızca adı `test` veya `migration_test` içeren izole PostgreSQL URL’sini kabul eder:

PowerShell:

```powershell
$env:TEST_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/discovery_cappadocia_test?schema=public'
$env:DATABASE_URL=$env:TEST_DATABASE_URL
npm run prisma:deploy
npm test
```

Test; admin yetkisi, admin→public locale katalog, fiyat tutarlılığı/tarih override, slug alias, rota sırası, eşzamanlı kapasite, idempotent iptal, güvenli reaktivasyon, promo süre/atomik limit, ödeme erişimi ve imzalı/tekrarlanan Stripe webhook’u doğrular. Test gerçek/production DB’de çalışmayı bilinçli olarak reddeder.

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Next production build TypeScript kontrolünü ve EN/TR/ES/IT/RU statik rotalarını üretmeyi kapsar. Bağımlılık denetimi:

```bash
npm audit --omit=dev
```

Frontend’de Next’in iç bağımlılıklarını güvenlik düzeltmeli doğrudan `postcss`/`sharp` sürümleriyle eşitleyen npm overrides bulunur. Backend’de iyzico’nun HTTP istemci zincirindeki `qs`/`uuid` sürümleri güvenli sürümlere sabitlenir.

## Canlı dağıtım

### 1. Veritabanı ve Redis

1. Yönetilen PostgreSQL oluşturun; mümkünse uygulama runtime’ı için pooled URL, migration için sağlayıcının önerdiği direct URL yaklaşımını kullanın.
2. Prod snapshot/backup politikasını açın.
3. Migration öncesi backup alın.
4. `npm run prisma:deploy` uygulayın; eski DB ise yukarıdaki baseline prosedürünü izleyin.
5. Yönetilen Redis oluşturup `REDIS_URL` ekleyin.

### 2. Backend container

Render Blueprint için kökteki `render.yaml` başlangıç noktasıdır. Alternatif platformda:

- Root/context: `backend`
- Dockerfile: `backend/Dockerfile`
- Health: `/health`
- Container komutu migration deploy’dan sonra `node dist/index.js` çalıştırır
- Kalıcı disk gerektirmez; upload Cloudinary’dedir
- Public domain: tercihen `api.discoverycappadocia.com`

Backend ortamına tüm secret’ları ekleyin. `FRONTEND_URLS` içine production ve gerçekten ihtiyaç duyulan preview origin’lerini açıkça yazın. Her preview URL’sine wildcard CORS açmayın.

### 3. Vercel frontend

Kökteki `vercel.json` monorepo frontend build’ini tanımlar:

- Install: `npm --prefix frontend ci`
- Build: `npm --prefix frontend run build`
- Output: `frontend/.next`

Vercel environment’larını Production ve Preview için ayrı girin. Production örneği:

```text
NEXT_PUBLIC_API_URL=https://api.discoverycappadocia.com/api
API_INTERNAL_URL=https://api.discoverycappadocia.com/api
NEXT_PUBLIC_WS_URL=wss://api.discoverycappadocia.com
NEXT_PUBLIC_SITE_URL=https://discoverycappadocia.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Custom domain/DNS tamamlanmadan canlı cookie, CORS ve webhook testi yapmayın. Frontend ve API aynı üst domain altındaysa `SameSite=Lax` daha güvenilir bir oturum deneyimi sağlar.

### 4. Stripe

Stripe Dashboard → Webhooks altında şu HTTPS endpoint’i ekleyin:

```text
https://api.discoverycappadocia.com/api/payments/webhook/stripe
```

En az `payment_intent.succeeded`, `payment_intent.payment_failed` ve `charge.refunded` event’lerini seçin. Endpoint signing secret’ı backend `STRIPE_WEBHOOK_SECRET` olarak girin. Önce test mode’da ödeme + webhook retry, sonra live key’lerle küçük tutarlı kontrollü işlem yapın.

### 5. iyzico

- Önce sandbox key/secret ve `https://sandbox-api.iyzipay.com` kullanın.
- `BACKEND_URL` dışarıdan erişilebilir API kökü olmalıdır.
- Callback: `BACKEND_URL/api/payments/webhook/iyzico`
- Sandbox’ta başarı, ret, tekrar callback ve tutar/currency eşleşmezliği senaryolarını test edin.
- Canlı anahtara geçmeden önce iyzico hesabındaki para birimi ve zorunlu alıcı alanlarını doğrulayın.

### 6. Cloudinary

- Cloud oluşturun ve API credentials’ı yalnız backend’e girin.
- Folder ve dönüşüm/teslim limitlerini gözden geçirin.
- Admin’den gerçek JPEG/PNG/WebP çoklu upload, kapak, sıra ve silme testi yapın.
- Deploy sonrasında URL’nin çalıştığını ve silinen asset’in invalidate edildiğini kontrol edin.

## Yedekleme ve geri yükleme

Örnek mantıksal yedek:

```bash
pg_dump --format=custom --no-owner --no-acl "$DATABASE_URL" --file discovery-before-migration.dump
```

Geri yüklemeyi production üzerinde doğrudan denemeyin; önce boş doğrulama veritabanında:

```bash
createdb discovery_restore_test
pg_restore --no-owner --no-acl --dbname discovery_restore_test discovery-before-migration.dump
```

Ardından tablo/satır sayıları, kritik rezervasyonlar, ödeme toplamları ve `npx prisma migrate status` kontrol edilmelidir. Cloudinary asset yedekleme/retention politikası DB yedeğinden ayrıdır; ikisini birlikte planlayın.

## Canlıya çıkış kontrol listesi

- [ ] Production DB snapshot alındı ve restore testi yapıldı
- [ ] Baseline durumu doğrulandı, `prisma migrate deploy` başarıyla tamamlandı
- [ ] `npm run admin:create` ile benzersiz güçlü parolalı admin oluşturuldu; provisioning parolası kaldırıldı
- [ ] Backend ve frontend environment’ları Production/Preview için ayrıldı
- [ ] `JWT_SECRET` güçlü ve yalnız backend’de
- [ ] HTTPS, cookie domain/SameSite, kesin CORS origin’leri doğrulandı
- [ ] Cloudinary çoklu upload, kapak, sıralama, alt metin ve silme gerçek hesapla test edildi
- [ ] Stripe test webhook/retry başarılı; sonra live endpoint secret girildi
- [ ] iyzico sandbox callback/API doğrulaması başarılı; canlı credentials ayrı girildi
- [ ] `/health`, public katalog, admin login, mutation+CSRF ve logout smoke testleri geçti
- [ ] Eşzamanlı son koltuk, iptal/geri alma, date override ve promo limit senaryoları staging’de geçti
- [ ] `wss://.../ws` uzun bağlantı testi yapıldı
- [ ] `npm audit --omit=dev`, backend check/build/test ve frontend build geçti
- [ ] Hukuki metinler, iptal/iade politikası ve mesafeli satış metni yetkili hukuk danışmanınca onaylandı
- [ ] İzleme, hata alarmı, DB backup ve ödeme webhook alarmı kuruldu

## Bilinen operasyonel notlar

- Cloudinary, Stripe ve iyzico gerçek hesapları/secret’ları repoda olmadığı için entegrasyon testleri local mock’a çevrilmez. Canlı/sandbox panel smoke testleri dağıtım sorumlusunun manuel adımıdır.
- WebSocket istemcileri tek Node.js sürecinin belleğindedir. Birden fazla backend instance çalıştırılacaksa mesaj fan-out için Redis Pub/Sub veya yönetilen realtime servisi ekleyin.
- Yönetim panelinin navigasyon kabuğu Türkçe/İngilizce locale’e uyumludur; tur içeriği beş dilde tam yönetilir. Operasyonel form metinlerinin bir bölümü İngilizcedir ve merkezi admin sözlüğüne taşınabilir.
- Müşteri listesi üyeler ve misafirleri bir araya getirir; çok büyük veri hacminde guest aggregation için materialized view veya ayrı `Customer` modeli değerlendirilmelidir.
- Hukuki sayfalar taslak niteliğindedir; canlıya çıkıştan önce hukuki onay zorunludur.

## Sorun giderme

### Admin giriş yapıyor fakat mutation 403 dönüyor

- Tarayıcıda `dc_session` ve `dc_csrf` cookie’lerini kontrol edin.
- Frontend ortak Axios istemcisinin `withCredentials` ve `x-csrf-token` gönderdiğini doğrulayın.
- Farklı üst domain kullanıyorsanız `COOKIE_SAME_SITE=none`, HTTPS ve `COOKIE_SECURE=true` gerekir.
- API origin’inin `FRONTEND_URLS` içinde birebir bulunduğunu doğrulayın.

### Site katalog göstermiyor

- Backend `/health` ve `/api/tours?locale=tr` yanıtını kontrol edin.
- Vercel’de `NEXT_PUBLIC_API_URL` ve server-side `API_INTERNAL_URL` değerlerini doğrulayın.
- Turun `isActive=true`, `isBookingEnabled=true` ve `deletedAt=null` olduğunu kontrol edin.
- Redis’i temizlemek yerine önce admin mutation’ın cache invalidation logunu/yanıtını inceleyin; Redis yoksa API zaten DB’den devam eder.

### Görsel yüklenmiyor

- Cloudinary üç credential’ının yalnız backend’de ve aynı cloud’a ait olduğunu doğrulayın.
- Dosyanın JPEG/PNG/WebP ve `MAX_IMAGE_UPLOAD_MB` altında olduğunu kontrol edin.
- Dış URL kullanıyorsanız HTTPS host’un `ALLOWED_MEDIA_HOSTS` listesinde olması gerekir.

### Ödeme callback’i işlenmiyor

- Stripe’ta endpoint secret ile API key’i karıştırmayın; teslim logunda HTTP durumunu inceleyin.
- iyzico için `BACKEND_URL`, sandbox/canlı base URL ve credentials aynı ortamı göstermelidir.
- Backend ödeme kaydı, `PaymentWebhookEvent` ve audit logunu birlikte inceleyin; hassas kart verisini loglamayın.

## Lisans

Özel projedir. İzinsiz dağıtım ve yeniden kullanım yapılamaz.
