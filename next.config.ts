import type { NextConfig } from "next";

// Export statique pour GitHub Pages : l'app est 100% client (localStorage),
// aucune fonctionnalité serveur (pas de route handlers, cookies, actions...),
// donc compatible avec `output: "export"`.
//
// Le site est servi depuis /docs sur la branche main (GitHub Pages "classique"),
// à l'URL https://derkitoo.github.io/jjb/ — d'où le basePath fixe ci-dessous.
// Pour builder en local à la racine (npm run dev), NEXT_BASE_PATH n'est pas
// défini et basePath reste vide.
const basePath = process.env.NEXT_BASE_PATH ?? "/jjb";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
};

export default nextConfig;
