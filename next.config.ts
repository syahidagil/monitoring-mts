import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/pmbm/informasi",
        destination: "/pmbm/pengumuman",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;