import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.44.1.3", "localhost", "127.0.0.1"],
  experimental: {
    // Enable HTTPS in development so navigator.mediaDevices (mic/WebRTC) works
    // Run: npm run dev -- --experimental-https
    // Or access via https://localhost:3010
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/devicons/devicon/icons/**",
      },
    ],
  },
};

export default nextConfig;