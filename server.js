// server.js -- Serveur dynamique Base IA (lit Notion, sert le site depuis un cache mémoire)
// Réutilise tel quel les fonctions de scripts/lib/*.js -- elles sont pures (outils, llms) -> HTML.
// Notion est la source unique : lue au démarrage et sur synchronisation explicite, jamais à la requête.

const path = require("path");
const express = require("express");
const { recupererItems } = require("./scripts/lib/notion");
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

const app = express();
app.use(express.json());

// -- Cache mémoire : Notion est lu UNIQUEMENT ici (au démarrage + sur synchronisation explicite),
//    jamais à la requête d'un visiteur. Pas de TTL : le cache reste servi tel quel jusqu'à la
//    prochaine synchronisation ("Mettre à jour" / validation d'une proposition). --
let cache = null; // { outils, llms, hubs, pagesPositionnement, markdownGuides, ogImage, builtAt }

async function construireCache() {
  const tous = await recupererItems(); // lecture Notion
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
  // Construction paresseuse si le préchauffage au démarrage a échoué (Notion indisponible à ce moment).
  if (!cache) await construireCache();
  return cache;
}

// -- Rafraîchissement du site depuis Notion -- appelé par n8n (bouton "Mettre à jour" + après validation d'une proposition) --
async function rafraichir(req, res) {
  if (!INVALIDATE_TOKEN || req.headers["x-invalidate-token"] !== INVALIDATE_TOKEN) {
    return res.status(401).json({ status: "error", message: "Non autorisé" });
  }
  try {
    await construireCache();
    res.json({ status: "ok", nbItems: cache.outils.length + cache.llms.length, builtAt: cache.builtAt });
  } catch (erreur) {
    console.error("Erreur rafraîchissement depuis Notion :", erreur.message);
    res.status(500).json({ status: "error", message: erreur.message });
  }
}

app.post("/internal/sync", rafraichir);
app.post("/internal/invalidate", rafraichir); // alias historique -- même comportement

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
  console.log(`Base IA (dynamique, source Notion) en écoute sur le port ${PORT}`);
  // Préchauffage du cache au démarrage, pour que le premier visiteur ait une page prête.
  // Si Notion est indisponible à ce moment, on ne bloque pas le démarrage : le cache sera
  // construit à la première requête (getCache) ou à la prochaine synchronisation.
  construireCache()
    .then(() => console.log(`Cache initial construit depuis Notion (${cache.outils.length + cache.llms.length} items).`))
    .catch((e) => console.error("Cache initial non construit (Notion indisponible ?) :", e.message));
});
