import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = isGithubPages ? "/three.js-game-portfolio" : "";

const nextConfig: NextConfig = {
  assetPrefix: githubPagesBasePath || undefined,
  basePath: githubPagesBasePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: githubPagesBasePath,
  },
  images: {
    unoptimized: true,
  },
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
