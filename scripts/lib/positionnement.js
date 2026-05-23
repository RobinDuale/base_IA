// positionnement.js -- Pages de positionnement SEO (comparatif-llm, automatiser-avec-ia, outils-no-code)

const {
  BASE_URL, META_GOOGLE, META_ROBOTS_INDEX,
  OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, AUTHOR_NAME, AUTHOR_URL,
  DATE_PUBLISHED, DATE_MODIFIED, GA_TAG, COOKIE_BANNER,
} = require("./config");

function genererPagePositionnement({ slug, title, description, h1, intro, sections, outils, llms, schema }) {
  const url = `${BASE_URL}/${slug}.html`;
  const footerHtml = `
  <footer>
    <div class="footer-contenu">
      <div class="footer-gauche">
        <span class="footer-copy">© 2026 Robin Dualé · <a href="https://duale.fr" target="_blank" rel="noopener noreferrer">duale.fr</a></span>
      </div>
      <div class="footer-liens">
        <a href="https://www.linkedin.com/in/robinduale" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://cv-robin.duale.fr" target="_blank" rel="noopener noreferrer">cv-robin.duale.fr</a>
        <a href="/mentions-legales.html">Mentions légales</a>
      </div>
    </div>
  </footer>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <meta name="description" content="${description}"/>
  <meta name="author" content="${AUTHOR_NAME}"/>
${META_ROBOTS_INDEX}
${META_GOOGLE}
  <link rel="canonical" href="${url}"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:url" content="${url}"/>
  <meta property="og:image" content="${OG_IMAGE}"/>
  <meta property="og:image:secure_url" content="${OG_IMAGE}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="${OG_IMAGE_ALT}"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="${SITE_NAME}"/>
  <meta property="article:published_time" content="${DATE_PUBLISHED}"/>
  <meta property="article:modified_time" content="${DATE_MODIFIED}"/>
  <meta property="article:author" content="${AUTHOR_URL}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  <meta name="twitter:image" content="${OG_IMAGE}"/>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png"/>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"/>
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png"/>
  <link rel="apple-touch-icon" sizes="48x48" href="/assets/favicon-48.png"/>
  <script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "${BASE_URL}/"},
        {"@type": "ListItem", "position": 2, "name": "${h1}", "item": "${url}"}
      ]
    },
    ${schema}
  ]
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
    <div class="article-eyebrow">Repere · Lecture 6 min</div>
    <h1 class="article-h1">${h1}</h1>
    <p class="article-lede">${intro}</p>

    <div class="article-meta">
      <div class="article-meta-col">
        <span class="article-meta-label">Auteur</span>
        <span class="article-meta-val">Robin Duale</span>
      </div>
      <div class="article-meta-col">
        <span class="article-meta-label">Publie</span>
        <span class="article-meta-val">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
      </div>
      <div class="article-meta-col">
        <span class="article-meta-label">Sujet</span>
        <span class="article-meta-val">${h1.split(/[?:]/)[0].slice(0, 40)}</span>
      </div>
    </div>

    ${sections}
  </article>
</main>
${footerHtml}
${COOKIE_BANNER}
</body>
</html>`;
}

function schemaArticle({ slug, headline, description }) {
  const url = `${BASE_URL}/${slug}.html`;
  return `{
      "@context": "https://schema.org",
      "@type": ["WebPage", "Article"],
      "headline": "${headline}",
      "description": "${description}",
      "url": "${url}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${url}"
      },
      "datePublished": "${DATE_PUBLISHED}",
      "dateModified": "${DATE_MODIFIED}",
      "inLanguage": "fr",
      "author": {"@type": "Person", "name": "Robin Dualé", "url": "https://cv-robin.duale.fr", "sameAs": "https://www.linkedin.com/in/robinduale"},
      "publisher": {"@type": "Person", "name": "Robin Dualé", "url": "https://cv-robin.duale.fr"}
    }`;
}

function genererPagesPositionnement(outils, llms) {
  const pages = [];

  const PAGES_POSITIONNEMENT = [
    { titre: "Comparatif LLMs 2026", href: "/comparatif-llm.html" },
    { titre: "Automatiser avec l'IA", href: "/automatiser-avec-ia.html" },
    { titre: "Outils No-Code 2026", href: "/outils-no-code.html" },
  ];

  function voirAussi(slugCourant) {
    const autres = PAGES_POSITIONNEMENT.filter(p => !p.href.includes(slugCourant));
    return `
  <section class="section voir-aussi" style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--line);">
    <div class="section-eyebrow">&#9679; Sur Base IA</div>
    <h2>Voir aussi</h2>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
      ${autres.map(p => `<a href="${p.href}" style="padding:6px 14px;border:1.5px solid var(--line);border-radius:999px;font-size:14px;color:var(--ink);transition:border-color 0.15s;" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--line)';this.style.color='var(--ink)'">${p.titre}</a>`).join('')}
    </div>
  </section>`;
  }

  // Page 1 : Comparatif LLMs
  const llmsFiltres = llms.filter((l) => l.description);
  const sectionsLLMs = llmsFiltres.map((l) => `
  <section class="section" style="margin-bottom:1rem;">
    <h2>${l.nom} : ${l.description ? l.description.split(".")[0] : "modèle de langage"}</h2>
    <p style="color:var(--gris);font-size:0.9rem;margin-bottom:0.75rem;">${l.description || ""}</p>
    ${l.avantages ? `<p><strong>Points forts :</strong> ${l.avantages.split("\n")[0]}</p>` : ""}
    ${l.limites ? `<p style="margin-top:0.4rem;"><strong>Limites :</strong> ${l.limites.split("\n")[0]}</p>` : ""}
    <a href="${BASE_URL}/llm/${l.slug}.html" style="display:inline-block;margin-top:0.75rem;color:var(--bleu);font-size:0.9rem;">Fiche complète ${l.nom} →</a>
  </section>`).join("\n");

  pages.push({
    slug: "comparatif-llm",
    title: "Comparatif LLMs 2026 : Claude, ChatGPT, Gemini · Base IA",
    description: "Comparatif des meilleurs LLMs 2026 : Claude, ChatGPT, Gemini, Perplexity, Copilot. Avantages, limites et cas d'usage pour choisir le bon modèle.",
    h1: "Quel LLM choisir en 2026 ? Comparatif des modèles de langage",
    intro: "Les LLMs (Large Language Models) sont au coeur de la révolution IA. Claude, ChatGPT, Gemini, Perplexity et Microsoft Copilot ont chacun des forces distinctes selon l'usage : rédaction, code, recherche, automatisation. Ce comparatif vous aide à choisir le modèle adapté à votre contexte.",
    sections: sectionsLLMs + `
  <section class="section" style="margin-top:1.5rem;">
    <h2>Comment choisir entre ces LLMs ?</h2>
    <p>Le choix d'un LLM dépend de trois critères principaux : la qualité du raisonnement (Claude et GPT-4o excellent), l'accès à l'information en temps réel (Perplexity et Copilot), et le budget (tous proposent une version gratuite). Pour un usage professionnel intensif, tester plusieurs modèles sur vos cas réels reste la meilleure approche.</p>
  </section>` + voirAussi('comparatif-llm'),
    outils, llms,
    schema: schemaArticle({
      slug: "comparatif-llm",
      headline: "Comparatif LLMs 2026 : Claude, ChatGPT, Gemini, Perplexity, Copilot",
      description: "Comparatif des meilleurs modèles de langage : Claude, ChatGPT, Gemini, Perplexity, Microsoft Copilot."
    }),
  });

  // Page 2 : Automatiser avec l'IA
  const outilsAuto = [...outils, ...llms].filter((o) => ["Productivité", "No-Code"].includes(o.categorie) && o.description);
  const sectionsAuto = outilsAuto.map((o) => `
  <section class="section" style="margin-bottom:1rem;">
    <h2>Comment utiliser ${o.nom} pour automatiser ?</h2>
    <p style="color:var(--gris);font-size:0.9rem;margin-bottom:0.75rem;">${o.description || ""}</p>
    ${o.casUsage ? `<p><strong>Cas d'usage :</strong> ${o.casUsage.split("\n")[0]}</p>` : ""}
    <a href="${BASE_URL}/outils/${o.slug}.html" style="display:inline-block;margin-top:0.75rem;color:var(--bleu);font-size:0.9rem;">Fiche complète ${o.nom} →</a>
  </section>`).join("\n");

  pages.push({
    slug: "automatiser-avec-ia",
    title: "Automatiser avec l'IA : outils et méthodes 2026 · Base IA",
    description: "Guide des outils pour automatiser avec l'IA : n8n, Make, Notion, Clay. Workflows concrets et cas d'usage pour débutants et experts.",
    h1: "Comment automatiser ses processus métier avec des outils IA ?",
    intro: "L'automatisation des tâches répétitives est l'un des gains les plus immédiats de l'IA. Des outils comme n8n, Make ou Clay permettent de connecter des services, traiter des données et déclencher des actions sans écrire une ligne de code. Voici les outils clés et comment les utiliser.",
    sections: sectionsAuto + `
  <section class="section" style="margin-top:1.5rem;">
    <h2>Par où commencer pour automatiser avec l'IA ?</h2>
    <p>Commencez par identifier une tâche répétitive qui vous prend du temps : envoi d'emails, mise à jour de base de données, collecte d'informations. Choisissez ensuite l'outil adapté : Make pour les workflows visuels simples, n8n pour plus de flexibilité et d'hébergement autonome. Testez avec un workflow simple avant de passer à des automatisations complexes.</p>
  </section>` + voirAussi('automatiser-avec-ia'),
    outils, llms,
    schema: schemaArticle({
      slug: "automatiser-avec-ia",
      headline: "Automatiser avec l'IA : outils et méthodes 2026",
      description: "Guide des meilleurs outils pour automatiser ses processus avec l'IA."
    }),
  });

  // Page 3 : Outils No-Code
  const outilsNC = outils.filter((o) => ["No-Code"].includes(o.categorie) && o.description);
  const sectionsNC = outilsNC.map((o) => `
  <section class="section" style="margin-bottom:1rem;">
    <h2>${o.nom} : ${o.description ? o.description.split(".")[0] : o.categorie}</h2>
    <p style="color:var(--gris);font-size:0.9rem;margin-bottom:0.75rem;">${o.description || ""}</p>
    ${o.gratuite ? `<p><strong>Version gratuite :</strong> ${o.gratuite.split("\n")[0]}</p>` : ""}
    <a href="${BASE_URL}/outils/${o.slug}.html" style="display:inline-block;margin-top:0.75rem;color:var(--bleu);font-size:0.9rem;">Fiche complète ${o.nom} →</a>
  </section>`).join("\n");

  pages.push({
    slug: "outils-no-code",
    title: "Outils No-Code 2026 : créer sans coder · Base IA",
    description: "Sélection des meilleurs outils No-Code 2026 : Notion, Lovable, Netlify. Créez des applications et sites sans écrire de code. Comparatif et cas d'usage.",
    h1: "Les meilleurs outils No-Code en 2026 pour créer sans coder",
    intro: "Le No-Code démocratise la création d'applications, de sites web et de bases de données. En 2026, des outils comme Notion, Lovable ou Webflow permettent de construire des produits fonctionnels sans compétence technique. Voici la sélection des meilleurs outils No-Code selon les cas d'usage.",
    sections: sectionsNC + `
  <section class="section" style="margin-top:1.5rem;">
    <h2>No-Code ou Low-Code : quelle différence ?</h2>
    <p>Le No-Code (sans code) s'adresse aux non-développeurs qui veulent créer sans apprendre à programmer. Le Low-Code permet d'accélérer le développement en ajoutant du code là où les interfaces visuelles atteignent leurs limites. Pour débuter, le No-Code suffit pour 80 % des besoins courants : bases de données, sites vitrines, formulaires, automatisations simples.</p>
  </section>` + voirAussi('outils-no-code'),
    outils, llms,
    schema: schemaArticle({
      slug: "outils-no-code",
      headline: "Outils No-Code 2026 : créer des applications sans coder",
      description: "Sélection des meilleurs outils No-Code pour créer sans coder."
    }),
  });

  return pages.map((p) => ({ slug: p.slug, html: genererPagePositionnement(p) }));
}

module.exports = { genererPagePositionnement, genererPagesPositionnement };
