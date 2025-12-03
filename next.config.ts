import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    localPatterns: [
      {
        pathname: "/api/og/**",
      },
      {
        pathname: "/images/**",
      },
      {
        pathname: "/post-assets/**",
      },
    ],
  },
};

export default nextConfig;
