/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Define server configuration
  experimental: {
    // The serverComponentsExternalPackages option has been moved
  },
  // Use serverExternalPackages instead
  serverExternalPackages: [],
}

module.exports = nextConfig 