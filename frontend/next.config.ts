import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001', // Specify the port your backend is running on
        pathname: '/uploads/**', // Allow images from the uploads directory
      },
    ],
  },
};

export default nextConfig;
