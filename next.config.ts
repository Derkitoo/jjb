import type { NextConfig } from "next";

// Export statique pour GitHub Pages : l'app est 100% client (localStorage),
// aucune fonctionnalité serveur (pas de route handlers, cookies, actions...),
// donc compatible avec `output: "export"`.
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

let assetPrefix = "";
let basePath = "";

if (isGithubActions && process.env.GITHUB_REPOSITORY) {
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, "");
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix,
  basePath,
};

export default nextConfig;
