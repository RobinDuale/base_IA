// server.js -- Serveur dynamique Base IA (lit Postgres au lieu de générer des fichiers statiques)
// Réutilise tel quel les fonctions de scripts/lib/*.js -- elles sont pures (outils, llms) -> HTML.

const path = require("path");
const express = require("express");
const { recupererItems, remplacerItems } = require("./scripts/lib/db");
const { generateOGImage } = require("./scripts/lib/og-image");
const { genererPageAccueil } = require("./scripts/lib/accueil");
const { genererPageDetail } = require("./scripts/lib/detail");
const { genererPagesPositionnement } = require("./scripts/lib/positionnement");
const { genererPagesHubs } = require("./scripts/lib/hubs");
const {
  genererMarkdownDetail,
  genererMarkdownAccueil,
  genererMarkdownGuides,
} = require("./scripts/lib/markdown");
const {
  genererMentionsLegales,
  genererPageConfirmation,
  genererAdminPropositions,
} = require("./scripts/lib/statiques");
const { genererSitemap, genererLLMsTxt } = require("./scripts/lib/sitemap");

const PORT = process.env.PORT || 3000;
const INVALIDATE_TOKEN = process.env.INVALIDATE_TOKEN;
const CACHE_TTL_MS = 60 * 1000; // filet de sécurité -- l'invalidation manuelle reste la voie principale de fraîcheur

const app = express();
app.use(express.json());

// -- Cache mémoire : évite de retaper Postgres + reconstruire tous les templates à chaque requête --
let cache = null; // { outils, llms, hubs, pagesPositionnement, markdownGuides, ogImage, builtAt }

async function construireCache() {
  const tous = await recupererItems();
  const outils = tous.filter((i) => i.type !== "LLM");
  const llms = tous.filter((i) => i.type === "LLM");
  const hubs = genererPagesHubs(outils, llms);
  const pagesPositionnement = genererPagesPositionnement(outils, llms);
  const markdownGuides = genererMarkdownGuides(outils, llms);
  const categories = new Set(tous.map((o) => o.categorie).filter(Boolean));
  const ogImage = await generateOGImage(outils.length, llms.length, categories.size);

  cache = { outils, llms, hubs, pagesPositionnement, markdownGuides, ogImage, builtAt: Date.now() };
  return cache;
}

async function getCache() {
  if (!cache || Date.now() - cache.builtAt > CACHE_TTL_MS) {
    await construireCache();
  }
  return cache;
}

// -- Sync complète Notion -> Postgres -- appelée par n8n (bouton "Mettre à jour" + après validation d'une proposition) --
// Chargement paresseux de notion.js : ce module exige NOTION_API_KEY et fait process.exit(1) si absent.
// En lazy require, seul /internal/sync est affecté par une clé manquante -- pas tout le serveur.
app.post("/internal/sync", async (req, res) => {
  if (!INVALIDATE_TOKEN || req.headers["x-invalidate-token"] !== INVALIDATE_TOKEN) {
    return res.status(401).json({ status: "error", message: "Non autorisé" });
  }
  try {
    const { recupererItems: recupererItemsNotion } = require("./scripts/lib/notion");
    const items = await recupererItemsNotion();
    await remplacerItems(items);
    await construireCache();
    res.json({ status: "ok", nbItems: items.length, builtAt: cache.builtAt });
  } catch (erreur) {
    console.error("Erreur sync Notion -> Postgres :", erreur.message);
    res.status(500).json({ status: "error", message: erreur.message });
  }
});

// -- Invalidation manuelle (sans repasser par Notion) -- rebuild le cache depuis Postgres tel quel --
app.post("/internal/invalidate", async (req, res) => {
  if (!INVALIDATE_TOKEN || req.headers["x-invalidate-token"] !== INVALIDATE_TOKEN) {
    return res.status(401).json({ status: "error", message: "Non autorisé" });
  }
  try {
    await construireCache();
    res.json({ status: "ok", builtAt: cache.builtAt });
  } catch (erreur) {
    console.error("Erreur invalidation cache :", erreur.message);
    res.status(500).json({ status: "error", message: erreur.message });
  }
});

app.get("/version.json", async (req, res) => {
  const c = await getCache();
  res.json({ built_at: new Date(c.builtAt).toISOString() });
});

app.get(["/", "/index.html"], async (req, res) => {
  const { outils, llms } = await getCache();
  res.type("html").send(genererPageAccueil(outils, llms));
});

app.get("/index.html.md", async (req, res) => {
  const { outils, llms } = await getCache();
  res.type("text/markdown").send(genererMarkdownAccueil(outils, llms));
});

app.get("/sitemap.xml", async (req, res) => {
  const { outils, llms, hubs } = await getCache();
  res.type("application/xml").send(genererSitemap(outils, llms, hubs));
});

app.get("/llms.txt", async (req, res) => {
  const { outils, llms, hubs } = await getCache();
  res.type("text/plain").send(genererLLMsTxt(outils, llms, hubs));
});

app.get("/mentions-legales.html", (req, res) => res.type("html").send(genererMentionsLegales()));
app.get("/confirmation.html", (req, res) => res.type("html").send(genererPageConfirmation()));
app.get("/admin-propositions.html", (req, res) => res.type("html").send(genererAdminPropositions()));

app.get("/assets/og-default.png", async (req, res) => {
  const { ogImage } = await getCache();
  res.type("png").send(ogImage);
});

// Pages de positionnement SEO (comparatif-llm.html, automatiser-avec-ia.html, outils-no-code.html)
app.get("/:slug(comparatif-llm|automatiser-avec-ia|outils-no-code).html", async (req, res) => {
  const { pagesPositionnement } = await getCache();
  const page = pagesPositionnement.find((p) => p.slug === req.params.slug);
  if (!page) return res.status(404).send("Page introuvable");
  res.type("html").send(page.html);
});

app.get("/:slug(comparatif-llm|automatiser-avec-ia|outils-no-code).html.md", async (req, res) => {
  const { markdownGuides } = await getCache();
  const page = markdownGuides.find((p) => p.slug === req.params.slug);
  if (!page) return res.status(404).send("Page introuvable");
  res.type("text/markdown").send(page.markdown);
});

app.get("/categories/:slug.html", async (req, res) => {
  const { hubs } = await getCache();
  const hub = hubs.find((h) => h.slug === req.params.slug);
  if (!hub) return res.status(404).send("Catégorie introuvable");
  res.type("html").send(hub.html);
});

// Pages détail -- outils et LLMs partagent le même gabarit (genererPageDetail)
function routeDetail(dossier) {
  app.get(`/${dossier}/:slug.html`, async (req, res) => {
    const { outils, llms } = await getCache();
    const tousAlpha = [...outils, ...llms].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    const item = tousAlpha.find((i) => i.slug === req.params.slug);
    if (!item) return res.status(404).send("Fiche introuvable");
    res.type("html").send(genererPageDetail(item, tousAlpha, dossier));
  });

  app.get(`/${dossier}/:slug.html.md`, async (req, res) => {
    const { outils, llms } = await getCache();
    const item = [...outils, ...llms].find((i) => i.slug === req.params.slug);
    if (!item) return res.status(404).send("Fiche introuvable");
    res.type("text/markdown").send(genererMarkdownDetail(item));
  });
}
routeDetail("outils");
routeDetail("llm");

// Fichiers statiques (styles.css, robots.txt, favicons, BingSiteAuth.xml, etc.)
app.get("/favicon.ico", (req, res) => res.sendFile(path.join(__dirname, "src", "assets", "favicon.ico")));
app.use(express.static(path.join(__dirname, "src")));
app.use("/assets", express.static(path.join(__dirname, "src", "assets")));

app.listen(PORT, () => {
  console.log(`Base IA (dynamique) en écoute sur le port ${PORT}`);
});
