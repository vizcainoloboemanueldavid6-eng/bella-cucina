/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site: `next build` emits ./out, deployable to any CDN or static host.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
