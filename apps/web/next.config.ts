import type { NextConfig } from "next"

const API_URL = process.env.API_URL || "http://localhost:8787"

const nextConfig: NextConfig = {
  transpilePackages: ["@gibiverse/ui"],
  experimental: {
    agentUpgrade: "security",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
