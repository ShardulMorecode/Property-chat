/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['pub-d28896f69c604ec5aa743cb0397740d9.r2.dev'],
  },
}

module.exports = nextConfig
