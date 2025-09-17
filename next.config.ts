import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
);
  async redirects() {
    return [
      { source: '/', destination: '/de', permanent: true },
    ];
  },
};

export default nextConfig;
