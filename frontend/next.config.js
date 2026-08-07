/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Bu deploy'da kok vercel.json'daki "/(.*)" -> frontend catch-all rewrite'i
    // /_next/image isteklerini de frontend servisine yonlendiriyor, dolayisiyla
    // platformun goruntu optimizasyon endpoint'ine hic ulasmiyor ve 404 donuyor.
    // Optimizasyonu kapatinca next/image dogrudan /public altindaki dosyayi
    // servis ediyor (bunlar 200 doniyor).
    unoptimized: true,
  },
};

module.exports = nextConfig;
