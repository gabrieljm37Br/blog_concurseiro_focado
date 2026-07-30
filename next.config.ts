import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/termos",
        destination: "/termos-de-uso",
        permanent: true,
      },
      {
        source: "/privacidade",
        destination: "/politica-de-privacidade",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
