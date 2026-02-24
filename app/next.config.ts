import type { NextConfig } from "next";

const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGhPages && { output: "export" }),
  basePath: isGhPages ? "/Kraljic_Practice" : "",
  assetPrefix: isGhPages ? "/Kraljic_Practice/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
