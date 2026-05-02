import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow network access from mobile device
  allowedDevOrigins: ['192.168.1.11', '192.168.1.11:3000', '192.168.1.11:3001'],
  
  // Next.js 16: devIndicators only supports `false` or `{ position }` (no buildActivity).
  devIndicators: false,

  // Fix for slow filesystem (polling)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // Acknowledge Turbopack to silence the warning/error in Next.js 16
  turbopack: {},

  // Static export for Capacitor
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
