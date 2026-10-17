import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Prism loads language files dynamically on the server.
  serverExternalPackages: ["prismjs"],
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
  transpilePackages: ["markdown-it-prism"],
};

export default nextConfig;
