import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

function getGithubPagesBasePath() {
  if (!isGithubPages) {
    return "";
  }

  if (process.env.GITHUB_PAGES_BASE_PATH) {
    return process.env.GITHUB_PAGES_BASE_PATH;
  }

  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];

  if (!repositoryName || repositoryName.endsWith(".github.io")) {
    return "";
  }

  return `/${repositoryName}`;
}

const githubPagesBasePath = getGithubPagesBasePath();

const nextConfig: NextConfig = {
  assetPrefix: githubPagesBasePath || undefined,
  basePath: githubPagesBasePath || undefined,
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
