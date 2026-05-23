// hubs.js -- Pages hubs par catégorie pour renforcer le maillage SEO

const {
  BASE_URL, META_GOOGLE, META_ROBOTS_INDEX,
  OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, AUTHOR_NAME,
  DATE_PUBLISHED, DATE_MODIFIED, GA_TAG, COOKIE_BANNER,
} = require("./config");
const { descriptionMeta, echapperJson } = require("./utils");

const HUBS_CATEGORIES = [
  {
    categorie: "LLMs",
    slug: "llms",
    titre: "LLMs : modèles IA, usages et comparatifs · Base IA",
    h1: "LLMs : choisir le bon modèle IA",
    intro: "Claude, ChatGPT, Gemini, Mistral ou Copilot n'ont pas les mêmes forces. Cette page regroupe les grands modèles de langage référencés dans Base IA pour comparer leurs usages, limites et scénarios concrets.",
  },
  {
    categorie: "Productivité",
    slug: "productivite",
    titre: "Outils IA de productivité : sélection 2026 · Base IA",
    h1: "Outils IA pour gagner en productivité",
    intro: "Cette sélection réunit les outils utiles pour organiser le travail, automatiser les tâches répétitives, gérer les données et fluidifier la collaboration.",
  },
  {
    categorie: "No-Code",
    slug: "no-code",
    titre: "Outils No-Code et IA : créer sans coder · Base IA",
    h1: "Outils No-Code pour créer sans coder",
    intro: "Le No-Code permet de créer sites, applications, bases de données et automatisations sans développement classique. Voici les outils référencés dans Base IA pour démarrer ou accélérer.",
  },
  {
    categorie: "Créativité",
    slug: "creativite",
    titre: "Outils IA créatifs : image, vidéo et contenus · Base IA",
    h1: "Outils IA pour créer des contenus",
    intro: "Images, vidéos, avatars et contenus génératifs : cette page regroupe les outils créatifs de Base IA avec leurs cas d'usage et limites.",
  },
];

function urlItem(item) {
  const prefixe = item.type === "LLM" ? "llm" : "outils";
  return `/${prefixe}/${item.slug}.html`;
}

function carteHub(item) {
  return `
    <section class="section" style="margin-bottom:1rem;">
      <h2>${item.nom}</h2>
      <p style="color:var(--gris);font-size:0.95rem;margin-bottom:0.75rem;">${item.description || ""}</p>
      ${item.avantages ? `<p><strong>Points forts :</strong> ${item.avantages.split("\n")[0]}</p>` : ""}
      ${item.limites ? `<p style="margin-top:0.4rem;"><strong>Limites :</strong> ${item.limites.split("\n")[0]}</p>` : ""}
      <a href="${urlItem(item)}" style="display:inline-block;margin-top:0.75rem;color:var(--bleu);font-size:0.9rem;">Fiche complète ${item.nom} &#8594;</a>
    </section>`;
}

function schemaHub(hub, url, items) {
  return `[
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "${BASE_URL}/"},
        {"@type": "ListItem", "position": 2, "name": "${echapperJson(hub.h1)}", "item": "${url}"}
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "${echapperJson(hub.h1)}",
      "description": "${echapperJson(hub.intro)}",
      "url": "${url}",
      "datePublished": "${DATE_PUBLISHED}",
      "dateModified": "${DATE_MODIFIED}",
      "inLanguage": "fr",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Base IA",
        "url": "${BASE_URL}/"
      },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": ${items.length},
        "itemListElement": [
          ${items.map((item, index) => `{"@type":"ListItem","position":${index + 1},"name":"${echapperJson(item.nom)}","url":"${BASE_URL}${urlItem(item)}"}`).join(",\n          ")}
        ]
      }
    }
  ]`;
}

function genererPageHub(hub, items) {
  const url = `${BASE_URL}/categories/${hub.slug}.html`;
  const description = descriptionMeta(hub.intro, `${hub.h1} : sélection Base IA, usages concrets, avantages, limites et fiches détaillées.`);
  const cartes = items.map(carteHub).join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${hub.titre}</title>
  <meta name="description" content="${description}"/>
  <meta name="author" content="${AUTHOR_NAME}"/>
${META_ROBOTS_INDEX}
${META_GOOGLE}
  <link rel="canonical" href="${url}"/>
  <meta property="og:title" content="${hub.titre}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${url}"/>
  <meta property="og:image" content="${OG_IMAGE}"/>
  <meta property="og:image:secure_url" content="${OG_IMAGE}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="${OG_IMAGE_ALT}"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="${SITE_NAME}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${hub.titre}"/>
  <meta name="twitter:description" content="${description}"/>
  <meta name="twitter:image" content="${OG_IMAGE}"/>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"/>
  <script type="application/ld+json">
  ${schemaHub(hub, url, items)}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/styles.css"/>
  ${GA_TAG}
</head>
<body>
<header>
  <h1><a href="/"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:-2px;margin-right:5px;opacity:0.75"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>Base <em>IA</em></a></h1>
  <a class="retour" href="/">&#8592; Retour a la base</a>
</header>

<main>
  <article class="article-positionnement">
    <div class="article-eyebrow">Catégorie · ${items.length} fiche${items.length > 1 ? "s" : ""}</div>
    <h1 class="article-h1">${hub.h1}</h1>
    <p class="article-lede">${hub.intro}</p>
    ${cartes}
  </article>
</main>

<footer>
  <div class="footer-contenu">
    <div class="footer-gauche">
      <span class="footer-copy">© 2026 Robin Dualé · <a href="https://duale.fr" target="_blank" rel="noopener noreferrer">duale.fr</a></span>
    </div>
    <div class="footer-liens">
      <a href="/">Accueil</a>
      <a href="/comparatif-llm.html">Comparatif LLMs</a>
      <a href="/mentions-legales.html">Mentions légales</a>
    </div>
  </div>
</footer>
${COOKIE_BANNER}
</body>
</html>`;
}

function genererPagesHubs(outils, llms) {
  const tous = [...outils, ...llms];
  return HUBS_CATEGORIES
    .map((hub) => {
      const items = tous
        .filter((item) => item.description && (hub.categorie === "LLMs" ? item.categorie === "LLMs" || item.type === "LLM" : item.categorie === hub.categorie))
        .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
      return { ...hub, items, html: genererPageHub(hub, items) };
    })
    .filter((hub) => hub.items.length > 0);
}

module.exports = { HUBS_CATEGORIES, genererPagesHubs };
