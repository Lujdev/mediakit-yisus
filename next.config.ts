import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    minimumCacheTTL: 2678400,
    // Next 16 blocks query strings on local images unless they are listed here. Uploaded
    // photos and logos bust their cache with ?v=<version>, so those routes must allow it.
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/api/media/**" },
      { pathname: "/api/brands/**" },
    ],
  },
};

export default nextConfig;
