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
  async headers() {
    // Filenames under public/images and public/videos aren't content-hashed
    // (unlike _next/static, which Next already serves immutable for a year),
    // so a full year would risk stale assets after a content update. A week
    // of real caching plus a month of background revalidation still turns
    // every repeat view/navigation into a cache hit instead of a
    // max-age=0/must-revalidate round trip on every request.
    return [
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }],
      },
      {
        source: '/videos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }],
      },
      // The logo/favicon load on every single page but sit at the public/
      // root, so they fall outside both rules above and were serving with
      // no explicit long-lived Cache-Control at all.
      {
        source: '/logo.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }],
      },
      {
        source: '/logo.webp',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }],
      },
      {
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }],
      },
    ];
  },
};

module.exports = nextConfig;
