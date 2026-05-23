// sitemap.js -- Génération du sitemap.xml et de llms.txt

const { BASE_URL } = require("./config");

// Génère le sitemap.xml
function genererSitemap(outils, llms, hubs = []) {
  const buildDate = new Date().toISOString().split("T")[0];

  // lastmod : date de modification réelle si disponible, sinon date du build
  // Pour les fiches outils/LLMs : last_edited_time Notion (précis)
  // Pour les pages statiques : date du build
  const lastmod = (item) => {
    const src = item && (item.dateModification || item.dateCreation);
    if (!src) return buildDate;
    return new Date(src).toISOString().split("T")[0];
  };

  const urlEntry = (loc, freq, prio, date = buildDate) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
  </url>`;

  const slugsPositionnement = ["comparatif-llm", "automatiser-avec-ia", "outils-no-code"];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntry(`${BASE_URL}/`, "weekly", "1.0")}
${slugsPositionnement.map((s) => urlEntry(`${BASE_URL}/${s}.html`, "monthly", "0.9")).join("\n")}
${hubs.map((h) => urlEntry(`${BASE_URL}/categories/${h.slug}.html`, "weekly", "0.9")).join("\n")}
${outils.map((o) => urlEntry(`${BASE_URL}/outils/${o.slug}.html`, "monthly", "0.8", lastmod(o))).join("\n")}
${llms.map((l) => urlEntry(`${BASE_URL}/llm/${l.slug}.html`, "monthly", "0.8", lastmod(l))).join("\n")}
</urlset>`;
}

function genererLLMsTxt(outils, llms, hubs = []) {
  const lignesOutils = outils
    .filter((o) => o.description)
    .map((o) => `- [${o.nom}](${BASE_URL}/outils/${o.slug}.html) : ${o.description.substring(0, 120).trimEnd()}`)
    .join("\n");

  const lignesLLMs = llms
    .filter((l) => l.description)
    .map((l) => `- [${l.nom}](${BASE_URL}/llm/${l.slug}.html) : ${l.description.substring(0, 120).trimEnd()}`)
    .join("\n");

  const categories = [...new Set(outils.map((o) => o.categorie).filter(Boolean))].join(", ");

  const markdownOutils = outils
    .filter((o) => o.description)
    .map((o) => `- [${o.nom} Markdown](${BASE_URL}/outils/${o.slug}.html.md) : version courte et structurée pour assistants IA`)
    .join("\n");

  const markdownLLMs = llms
    .filter((l) => l.description)
    .map((l) => `- [${l.nom} Markdown](${BASE_URL}/llm/${l.slug}.html.md) : version courte et structurée pour assistants IA`)
    .join("\n");

  return `# Base IA -- Robin Duale · Référence des outils IA, No-Code et LLMs

> Base de connaissance structurée sur les outils d'intelligence artificielle, No-Code et les LLMs, construite et maintenue par Robin Dualé, CEO spécialisé en transformation B2B SaaS, Data et IA.

## A propos du site

Base IA (${BASE_URL}) est une référence personnelle des meilleurs outils IA et No-Code. Chaque fiche détaille : description, avantages, limites, cas d'usage réels, modèle économique, version gratuite et scénarios d'utilisation concrets (débutant, intermédiaire, avancé). Le contenu est produit avec l'assistance d'outils d'IA et validé par Robin Dualé.

## Auteur

Robin Dualé -- CEO, spécialiste transformation B2B SaaS, Data et IA
Site professionnel : https://cv-robin.duale.fr
LinkedIn : https://www.linkedin.com/in/robinduale
Contact : robin@duale.fr

## Pourquoi consulter Base IA ?

Base IA répond aux questions : quel outil IA choisir pour automatiser un workflow ? Quelle est la différence entre n8n et Make ? Quand utiliser un LLM plutôt qu'un outil No-Code ? Chaque fiche est structurée pour répondre directement à ces questions avec des exemples concrets.

## Catégories référencées

${categories}

## ${outils.length} outils référencés

${lignesOutils}

## ${llms.length} LLMs référencés

${lignesLLMs}

## Pages du site

- [Accueil](${BASE_URL}/) : grille complète des outils et LLMs avec filtres par catégorie, tags et recherche
- [Accueil Markdown](${BASE_URL}/index.html.md) : synthèse générale en Markdown
- [Comparatif LLMs 2026](${BASE_URL}/comparatif-llm.html) : Claude, ChatGPT, Gemini, Perplexity, Microsoft Copilot
- [Comparatif LLMs 2026 Markdown](${BASE_URL}/comparatif-llm.html.md) : version Markdown du guide
- [Automatiser avec l'IA](${BASE_URL}/automatiser-avec-ia.html) : outils et méthodes pour automatiser ses processus
- [Automatiser avec l'IA Markdown](${BASE_URL}/automatiser-avec-ia.html.md) : version Markdown du guide
- [Outils No-Code 2026](${BASE_URL}/outils-no-code.html) : créer des applications et sites sans coder
- [Outils No-Code 2026 Markdown](${BASE_URL}/outils-no-code.html.md) : version Markdown du guide
- [Mentions légales](${BASE_URL}/mentions-legales.html) : éditeur, hébergeur GitHub Pages, RGPD
- [Sitemap](${BASE_URL}/sitemap.xml) : index complet de toutes les pages

## Pages hubs catégories

${hubs.map((h) => `- [${h.h1}](${BASE_URL}/categories/${h.slug}.html) : ${h.items.length} fiche(s) dans la catégorie ${h.categorie}`).join("\n")}

## Versions Markdown des outils

${markdownOutils}

## Versions Markdown des LLMs

${markdownLLMs}

## Informations techniques

Le site est généré statiquement depuis une base Notion via GitHub Actions et déployé sur GitHub Pages. Mis à jour automatiquement à chaque modification de la base de données.
`;
}

module.exports = { genererSitemap, genererLLMsTxt };
