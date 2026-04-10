/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // REQUIRED for Azure Static Web Apps
  output: "export",

  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  // ❌ NO rewrites
  // ❌ NO serverRuntimeConfig
  // ❌ NO standalone
};

export default nextConfig;
