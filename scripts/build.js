// build.js -- Point d'entrée principal
// Orchestre la génération du site statique depuis Notion.
// Ce script est exécuté par GitHub Actions à chaque mise à jour de Notion.

const fs   = require("fs");
const path = require("path");

const { recupererItems }           = require("./lib/notion");
const { generateOGImage }          = require("./lib/og-image");
const { genererPageAccueil }       = require("./lib/accueil");
const { genererPageDetail }        = require("./lib/detail");
const { genererPagesPositionnement } = require("./lib/positionnement");
const { genererPagesHubs }         = require("./lib/hubs");
const {
  genererMarkdownDetail,
  genererMarkdownAccueil,
  genererMarkdownGuides,
} = require("./lib/markdown");
const {
  genererMentionsLegales,
  genererPageConfirmation,
  genererAdminPropositions,
} = require("./lib/statiques");
const { genererSitemap, genererLLMsTxt } = require("./lib/sitemap");
const { creerDossier } = require("./lib/utils");

const DIST_DIR = path.join(__dirname, "..", "dist");

async function main() {
  try {
    // Créer les dossiers de sortie
    creerDossier(DIST_DIR);
    creerDossier(path.join(DIST_DIR, "outils"));
    creerDossier(path.join(DIST_DIR, "llm"));
    creerDossier(path.join(DIST_DIR, "categories"));

    // Copier les fichiers statiques de base
    fs.copyFileSync(path.join(__dirname, "..", "CNAME"), path.join(DIST_DIR, "CNAME"));
    fs.copyFileSync(path.join(__dirname, "..", "src", "robots.txt"), path.join(DIST_DIR, "robots.txt"));
    fs.copyFileSync(path.join(__dirname, "..", "src", "BingSiteAuth.xml"), path.join(DIST_DIR, "BingSiteAuth.xml"));
    fs.copyFileSync(
      path.join(__dirname, "..", "src", "fff05dc2d2973f558bcd5cf3cb8ceee8.txt"),
      path.join(DIST_DIR, "fff05dc2d2973f558bcd5cf3cb8ceee8.txt")
    );

    // Copier les favicons
    creerDossier(path.join(DIST_DIR, "assets"));
    for (const f of ["favicon.ico", "favicon-16.png", "favicon-32.png", "favicon-48.png", "favicon.svg"]) {
      const src = path.join(__dirname, "..", "src", "assets", f);
      const dst = f === "favicon.ico" ? path.join(DIST_DIR, f) : path.join(DIST_DIR, "assets", f);
      if (fs.existsSync(src)) fs.copyFileSync(src, dst);
    }

    // Récupérer les données Notion
    const tous = await recupererItems();
    const outils = tous.filter((i) => i.type !== "LLM");
    const llms   = tous.filter((i) => i.type === "LLM");
    console.log(`${outils.length} outil(s), ${llms.length} LLM(s).`);

    // Générer l'image OG avec les vrais chiffres
    const categories = new Set(tous.map((o) => o.categorie).filter(Boolean));
    const hubs = genererPagesHubs(outils, llms);
    const ogBuffer = await generateOGImage(outils.length, llms.length, categories.size);
    fs.writeFileSync(path.join(DIST_DIR, "assets", "og-default.png"), ogBuffer);

    // Copier la feuille de style
    const css = fs.readFileSync(path.join(__dirname, "..", "src", "styles.css"), "utf8");
    fs.writeFileSync(path.join(DIST_DIR, "styles.css"), css);

    // Fichier de version (pour la détection de fin de build côté front)
    fs.writeFileSync(
      path.join(DIST_DIR, "version.json"),
      JSON.stringify({ built_at: new Date().toISOString() })
    );

    // Pages principales
    fs.writeFileSync(path.join(DIST_DIR, "index.html"),             genererPageAccueil(outils, llms));
    fs.writeFileSync(path.join(DIST_DIR, "index.html.md"),          genererMarkdownAccueil(outils, llms));
    fs.writeFileSync(path.join(DIST_DIR, "mentions-legales.html"),  genererMentionsLegales());
    fs.writeFileSync(path.join(DIST_DIR, "confirmation.html"),      genererPageConfirmation());
    fs.writeFileSync(path.join(DIST_DIR, "admin-propositions.html"),genererAdminPropositions());
    fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"),            genererSitemap(outils, llms, hubs));
    fs.writeFileSync(path.join(DIST_DIR, "llms.txt"),               genererLLMsTxt(outils, llms, hubs));

    // Pages de positionnement SEO
    const pagesPositionnement = genererPagesPositionnement(outils, llms);
    for (const page of pagesPositionnement) {
      fs.writeFileSync(path.join(DIST_DIR, `${page.slug}.html`), page.html);
    }
    for (const page of genererMarkdownGuides(outils, llms)) {
      fs.writeFileSync(path.join(DIST_DIR, `${page.slug}.html.md`), page.markdown);
    }
    for (const hub of hubs) {
      fs.writeFileSync(path.join(DIST_DIR, "categories", `${hub.slug}.html`), hub.html);
    }
    console.log(`Page d'accueil, mentions légales, sitemap, llms.txt et ${pagesPositionnement.length} pages de positionnement générés.`);

    // Pages détail outils
    const tousAlpha = [...tous].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    for (const outil of outils) {
      fs.writeFileSync(
        path.join(DIST_DIR, "outils", `${outil.slug}.html`),
        genererPageDetail(outil, tousAlpha, "outils")
      );
      fs.writeFileSync(
        path.join(DIST_DIR, "outils", `${outil.slug}.html.md`),
        genererMarkdownDetail(outil)
      );
    }
    console.log(`${outils.length} pages outils générées.`);

    // Pages détail LLMs
    for (const llm of llms) {
      fs.writeFileSync(
        path.join(DIST_DIR, "llm", `${llm.slug}.html`),
        genererPageDetail(llm, tousAlpha, "llm")
      );
      fs.writeFileSync(
        path.join(DIST_DIR, "llm", `${llm.slug}.html.md`),
        genererMarkdownDetail(llm)
      );
    }
    console.log(`${llms.length} pages LLMs générées.`);

    console.log("Build terminé. Fichiers dans dist/");
  } catch (erreur) {
    console.error("Erreur lors du build :", erreur.message);
    process.exit(1);
  }
}

main();
