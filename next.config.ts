import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photography is bundled in `public/photos` — see src/data/images.ts for why.
    // Keeping the list of allowed remote hosts empty makes that constraint explicit.
    remotePatterns: [],
    formats: ["image/webp"],
  },
};

export default nextConfig;
