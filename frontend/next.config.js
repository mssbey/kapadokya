/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'img.youtube.com'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
