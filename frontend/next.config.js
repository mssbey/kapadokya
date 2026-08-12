/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ResponsivePhoto applies Cloudinary delivery transforms directly and local
    // assets already have generated WebP variants, so a second optimizer is off.
    unoptimized: true,
  },
  // The Vercel "services" deploy (vercel.json) doesn't support Edge Functions,
  // so middleware has to run on Node.js instead of the Edge runtime default.
  experimental: {
    nodeMiddleware: true,
  },
};

module.exports = nextConfig;
