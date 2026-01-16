import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',  // ← Set to 50MB or higher (adjust as needed)
    },
  },
};

export default nextConfig;
