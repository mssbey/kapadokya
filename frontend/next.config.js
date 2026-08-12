/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ResponsivePhoto applies Cloudinary delivery transforms directly and local
    // assets already have generated WebP variants, so a second optimizer is off.
    unoptimized: true,
  },
};

module.exports = nextConfig;
