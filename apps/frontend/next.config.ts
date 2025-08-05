import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export"
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'legacyknitting-app.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
