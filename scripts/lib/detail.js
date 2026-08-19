// detail.js -- Génération des pages détail outil/LLM

const {
  BASE_URL, META_GOOGLE, META_ROBOTS_INDEX,
  OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, AUTHOR_NAME, AUTHOR_URL,
  DATE_MODIFIED, COULEURS_CATEGORIE, COULEURS_TAG,
  GA_TAG, COOKIE_BANNER,
} = require("./config");
const { descriptionMeta, formatDateParis, echapperJson, echapperHtml, urlSure } = require("./utils");

function badgeTag(tag) {
  const couleur = COULEURS_TAG[tag.trim()] || "#6b7280";
  return `<span class="tag-fiche" style="background:${couleur}">${tag.trim()}</span>`;
}

function badgeCategorie(categorie) {
  const couleur = COULEURS_CATEGORIE[categorie] || "#6b7280";
  return `<span class="badge" style="background:${couleur}">${categorie}</span>`;
}

function badgeNiveau(niveau) {
  const couleurs = { Débutant: "#22c55e", Intermédiaire: "#f97316", Avancé: "#ef4444" };
  const couleur = couleurs[niveau] || "#6b7280";
  return niveau ? `<span class="badge" style="background:${couleur}">${niveau}</span>` : "";
}

// Page détail (commune Outils et LLMs)
function genererPageDetail(item, liste, prefixe) {
  function renderContenu(contenu) {
    // Listes numérotées : "1. A. 2. B." ou "1. A\n2. B"
    const numInline = contenu.match(/\d+\.\s/g);
    if (numInline && numInline.length >= 2) {
      const items = contenu.split(/\d+\.\s+/).map(l => l.replace(/\.\s*$/, '').trim()).filter(l => l);
      return `<ol>${items.map(l => `<li>${l}</li>`).join('')}</ol>`;
    }
    // Listes à tirets : "- A\n- B"
    const lignes = contenu.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(l => l);
    if (lignes.length >= 2) return `<ul>${lignes.map(l => `<li>${l}</li>`).join('')}</ul>`;
    return `<p>${contenu}</p>`;
  }

  function renderScenario(contenu) {
    const numInline = contenu.match(/\d+\.\s/g);
    if (numInline && numInline.length >= 2) {
      const items = contenu.split(/\d+\.\s+/).map(l => l.replace(/\.\s*$/, '').trim()).filter(l => l);
      return `<ol class="scenario-liste">${items.map(l => `<li>${l}</li>`).join('')}</ol>`;
    }
    return `<p class="scenario-texte">${contenu}</p>`;
  }

  function section(type, label, titre, contenu) {
    if (!contenu) return "";
    return `
    <section class="section" data-type="${type}">
      <div class="section-eyebrow">${label}</div>
      <h2>${titre}</h2>
      ${renderContenu(contenu)}
    </section>`;
  }

  function sectionPair(s1, s2) {
    if (!s1 && !s2) return "";
    return `<div class="section-pair">${s1 || '<div></div>'}${s2 || '<div></div>'}</div>`;
  }

  function sectionComplementaires(contenu) {
    if (!contenu) return "";
    const slugIndex = {};
    for (const t of liste) {
      slugIndex[t.nom.toLowerCase().trim()] = t;
    }
    const noms = contenu.split(/[\n,]/).map(n => n.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
    const liens = noms.map(nom => {
      const match = slugIndex[nom.toLowerCase().trim()];
      if (match) {
        const href = match.type === 'LLM' ? `/llm/${match.slug}.html` : `/outils/${match.slug}.html`;
        return `<a href="${href}" class="lien-complementaire">${nom}</a>`;
      }
      return `<span>${nom}</span>`;
    });
    if (!liens.length) return "";
    return `
    <section class="section" data-type="usage">
      <div class="section-eyebrow">&#9679; Usage</div>
      <h2>Avec quels outils ${item.nom} est-il complementaire ?</h2>
      <div class="complementaires-liste">${liens.join('')}</div>
    </section>`;
  }

  function pointsCles(avantages, description) {
    const source = avantages || description || "";
    if (!source) return "";
    const lignes = source
      .split(/[\n.]/)
      .map((l) => l.replace(/^[-•*]\s*/, "").trim())
      .filter((l) => l.length > 15)
      .slice(0, 3);
    if (!lignes.length) return "";
    return `
    <div class="keypoints">
      <div class="keypoints-titre">Les ${lignes.length} points a retenir</div>
      <ul class="keypoints-liste">
        ${lignes.map((l, i) => `<li><span class="keypoints-num">0${i + 1}</span><span>${l}.</span></li>`).join("\n        ")}
      </ul>
    </div>`;
  }

  const listeSorted = [...liste].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

  const catsPresentes = new Set(listeSorted.map(o => o.type === 'LLM' ? 'LLMs' : (o.categorie || '')).filter(Boolean));
  const ordreOnglets = ['LLMs', 'Productivité', 'No-Code', 'Créativité'];
  const ongletsSidebar = ['Tous', ...ordreOnglets.filter(c => catsPresentes.has(c))];
  const ongletsSidebarHtml = ongletsSidebar
    .map(c => `<button class="nav-onglet${c === 'Tous' ? ' actif' : ''}" data-cat="${c}" onclick="filtrerSidebarCat('${c}')">${c.toUpperCase()}</button>`)
    .join('');

  const liensBarreLaterale = listeSorted
    .map((o) => {
      const couleur = COULEURS_CATEGORIE[o.categorie] || "#6b7280";
      const href = o.type === "LLM" ? `/llm/${o.slug}.html` : `/outils/${o.slug}.html`;
      const cat = o.type === 'LLM' ? 'LLMs' : (o.categorie || '');
      return `<a href="${href}" class="${o.slug === item.slug ? "actif" : ""}" data-cat="${cat}">
        <span class="nav-dot" style="background:${couleur}"></span>
        <span>${o.nom}</span>
      </a>`;
    })
    .join("\n        ");

  const catColor = item.type === "LLM" ? "#8b5cf6" : (COULEURS_CATEGORIE[item.categorie] || "#6b7280");
  const catColorSoft = catColor + "14";
  const categorieLabel = item.type === "LLM" ? "LLM" : (item.categorie || "Outil");

  // datePublished / dateModified : dates réelles depuis Notion, formatées timezone Paris
  // Format ISO 8601 complet obligatoire pour GSC : "2026-05-21T00:00:00+02:00"
  // +02:00 en été (avr-oct), +01:00 en hiver (nov-mars)
  const datePublished = formatDateParis(item.dateCreation);
  const dateModified  = formatDateParis(item.dateModification);

  const titrePage = item.type === "LLM" ? `${item.nom} -- LLM` : item.nom;
  const badgeType = item.type === "LLM"
    ? `<span class="badge" style="background:#8b5cf6">LLM</span>`
    : badgeCategorie(item.categorie);

  const hasScenarios = item.scenarioSimple || item.scenarioIntermediaire || item.scenarioAvance;

  const specRows = [
    ["Categorie", categorieLabel],
    item.niveau ? ["Niveau", item.niveau] : null,
    item.gratuite ? ["Gratuité", "Freemium"] : null,
    item.lienOfficiel ? ["Site officiel", item.lienOfficiel.replace(/^https?:\/\//, "").replace(/\/$/, "")] : null,
  ].filter(Boolean);

  const specSheetHtml = `
    <div class="spec-sheet">
      <div class="spec-sheet-titre">En resume</div>
      ${specRows.map(([k, v]) => `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`).join("")}
    </div>`;

  const barreScenariosHtml = `
    <aside class="barre-scenarios">
      ${hasScenarios ? `
      <p class="barre-scenarios-titre">Scenarios d'usage</p>
      ${item.scenarioSimple ? `
      <div class="scenario">
        <h3 class="scenario-niveau scenario-simple">Debutant</h3>
        ${renderScenario(item.scenarioSimple)}
      </div>` : ""}
      ${item.scenarioIntermediaire ? `
      <div class="scenario">
        <h3 class="scenario-niveau scenario-intermediaire">Intermediaire</h3>
        ${renderScenario(item.scenarioIntermediaire)}
      </div>` : ""}
      ${item.scenarioAvance ? `
      <div class="scenario">
        <h3 class="scenario-niveau scenario-avance">Avance</h3>
        ${renderScenario(item.scenarioAvance)}
      </div>` : ""}
      ` : ""}
      ${specSheetHtml}
    </aside>`;

  // b porte les valeurs brutes de Notion. Elles servent au JSON-LD, qui a son propre
  // echappement, et a la troncature : tronquer du texte deja echappe couperait une
  // entite HTML en deux et afficherait "&am" en fin de description.
  const b = item.brut || item;
  const typeLabel = item.type === "LLM" ? "LLM" : (b.categorie || "Outil IA");
  const titleSuffix = item.type === "LLM" ? "avis, comparatif et fonctionnalités" : "avis, cas d'usage et prix";
  const titleDetailBrut = `${b.nom} : ${titleSuffix} · Base IA`;
  const titleDetail = echapperHtml(titleDetailBrut);
  const descFallback = `Fiche complète sur ${b.nom} : avantages, limites, cas d'usage et scénarios. ${typeLabel} sélectionné dans la Base IA de Robin Dualé.`;
  const descDetailBrut = descriptionMeta(b.description, descFallback);
  const descDetail = echapperHtml(descDetailBrut);
  const urlDetail = `${BASE_URL}/${prefixe}/${item.slug}.html`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${titleDetail}</title>
  <meta name="description" content="${descDetail}"/>
  <meta name="author" content="${AUTHOR_NAME}"/>
${META_ROBOTS_INDEX}
${META_GOOGLE}
  <link rel="canonical" href="${urlDetail}"/>
  <meta property="og:title" content="${titleDetail}"/>
  <meta property="og:description" content="${descDetail}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:url" content="${urlDetail}"/>
  <meta property="og:image" content="${OG_IMAGE}"/>
  <meta property="og:image:secure_url" content="${OG_IMAGE}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="${OG_IMAGE_ALT}"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="${SITE_NAME}"/>
  <meta property="article:published_time" content="${datePublished}"/>
  <meta property="article:modified_time" content="${dateModified}"/>
  <meta property="article:author" content="${AUTHOR_URL}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${titleDetail}"/>
  <meta name="twitter:description" content="${descDetail}"/>
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
        {"@type": "ListItem", "position": 2, "name": "${echapperJson(b.nom)}", "item": "${urlDetail}"}
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "${echapperJson(b.nom)}",
      "description": "${echapperJson(descDetailBrut)}",
      "applicationCategory": "${item.type === "LLM" ? "AIApplication" : "WebApplication"}",
      "operatingSystem": "Web",
      ${urlSure(b.lienOfficiel) ? `"url": "${echapperJson(urlSure(b.lienOfficiel))}",` : ""}
      "mainEntityOfPage": "${urlDetail}",
      "datePublished": "${datePublished}",
      "dateModified": "${dateModified}",
      "image": {
        "@type": "ImageObject",
        "url": "${OG_IMAGE}",
        "width": 1200,
        "height": 630
      },
      "author": {
        "@type": "Person",
        "name": "Robin Dualé",
        "url": "https://cv-robin.duale.fr",
        "sameAs": "https://www.linkedin.com/in/robinduale"
      }
    }${(() => {
  const faqPairs = [
    b.quandUtiliser ? { q: `Quand utiliser ${b.nom} ?`, a: b.quandUtiliser } : null,
    b.avantages    ? { q: `Quels sont les avantages de ${b.nom} ?`, a: b.avantages } : null,
    b.limites      ? { q: `Quelles sont les limites de ${b.nom} ?`, a: b.limites } : null,
    b.modeleEconomique ? { q: `Quel est le modèle économique de ${b.nom} ?`, a: b.modeleEconomique + (b.quandPayer ? ' ' + b.quandPayer : '') } : null,
  ].filter(Boolean);
  if (!faqPairs.length) return '';
  const items = faqPairs.map(p => `{"@type":"Question","name":"${echapperJson(p.q)}","acceptedAnswer":{"@type":"Answer","text":"${echapperJson(p.a)}"}}`).join(',');
  return `,\n    {\n      "@context": "https://schema.org",\n      "@type": "FAQPage",\n      "mainEntity": [${items}]\n    }`;
})()}
  ]
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="../styles.css"/>
  ${GA_TAG}
</head>
<body style="--cat-color:${catColor};--cat-color-soft:${catColorSoft};">
  <div class="cat-band"></div>

  <header>
    <h1><a href="../index.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:-2px;margin-right:5px;opacity:0.75"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>Base <em>IA</em></a></h1>
    <a class="retour" href="../index.html">&#8592; Retour a la base</a>
  </header>

  <div class="mise-en-page">
    <nav class="barre-laterale">
      <div class="nav-onglets-sidebar">${ongletsSidebarHtml}</div>
      <div class="nav-recherche-wrap">
        <input type="search" id="nav-recherche" class="nav-recherche" placeholder="Rechercher..." autocomplete="off" oninput="filtrerNav(this.value)"/>
      </div>
      ${liensBarreLaterale}
    </nav>
    <script>
    var _navCatActive = 'Tous';
    function filtrerNav(q) {
      var val = q.toLowerCase().trim();
      document.querySelectorAll('.barre-laterale a[data-cat]').forEach(function(a) {
        var nom = a.querySelector('span:last-child');
        var matchCat = _navCatActive === 'Tous' || a.dataset.cat === _navCatActive;
        var matchSearch = !val || (nom && nom.textContent.toLowerCase().includes(val));
        a.style.display = (matchCat && matchSearch) ? '' : 'none';
      });
    }
    function filtrerSidebarCat(cat) {
      _navCatActive = cat;
      document.querySelectorAll('.nav-onglet').forEach(function(btn) {
        btn.classList.toggle('actif', btn.dataset.cat === cat);
      });
      var input = document.getElementById('nav-recherche');
      filtrerNav(input ? input.value : '');
    }
    </script>

    <main class="fiche">
      <div class="fiche-hero">
        <div class="fiche-eyebrow">${item.type === "LLM" ? "Grand modele" : "Outil"} · ${categorieLabel}</div>
        <h1>${item.nom}</h1>
        <div class="badges">
          <span class="badge-cat">${categorieLabel}</span>
          ${item.niveau ? `<span class="badge-neutre">Niveau ${item.niveau}</span>` : ""}
          ${item.gratuite ? `<span class="badge-gratuit">Freemium</span>` : ""}
          <span class="badge-neutre">${item.type || "Outil"}</span>
        </div>
        ${item.description ? `<p class="fiche-lede">${item.description}</p>` : ""}
        <div class="fiche-actions">
          ${urlSure(b.lienOfficiel) ? `<a class="fiche-action fiche-action--primary" href="${echapperHtml(urlSure(b.lienOfficiel))}" target="_blank" rel="noopener noreferrer">Site officiel &#8599;</a>` : ""}
          ${item.alternatives ? `<a class="fiche-action" href="#alternatives">Voir les alternatives</a>` : ""}
        </div>
      </div>

      ${item.tags ? `<div class="tags-fiche"><span class="tags-label"># tags</span>${item.tags.split(",").map(badgeTag).join("")}</div>` : ""}

      ${pointsCles(item.avantages, item.description)}

      ${section('intro', '&#9679; Presentation', `A quoi sert ${item.nom} ?`, item.description)}
      ${section('intro', '&#9679; Presentation', `Son role dans l'ecosysteme IA`, item.roleEcosysteme)}

      ${sectionPair(
        section('usage', '&#9679; Usage', `Quand utiliser ${item.nom}`, item.quandUtiliser),
        section('eco', '&#9679; Economique', `Ce que comprend la version gratuite`, item.gratuite)
      )}

      ${sectionPair(
        section('fort', '&#9679; Points forts', `Pourquoi utiliser ${item.nom}`, item.avantages),
        section('faible', '&#9679; Limites', `Les limites a connaitre`, item.limites)
      )}

      ${section('usage', '&#9679; Usage', `Cas d'usage concrets`, item.casUsage)}
      ${section('usage', '&#9679; Usage', `Comment je l'utilise dans mon contexte`, item.casUsagePourMoi)}
      ${section('usage', '&#9679; Usage', `Exemples et workflows avec ${item.nom}`, item.exemplesWorkflows)}
      ${sectionComplementaires(item.complementaireAvec)}

      ${sectionPair(
        section('eco', '&#9679; Economique', `Modele economique de ${item.nom}`, item.modeleEconomique),
        section('eco', '&#9679; Economique', `Quand passer a la version payante`, item.quandPayer)
      )}

      <div id="alternatives">
        ${section('intro', '&#9679; Alternatives', `Quelles alternatives a ${item.nom} ?`, item.alternatives)}
      </div>

      ${section('notes', '&#9679; Carnet', `Notes personnelles sur ${item.nom}`, item.notePersonnelles)}

      ${(() => {
        const liens = [];
        if (item.type === 'LLM') liens.push({ titre: 'Comparatif LLMs 2026', href: '/comparatif-llm.html' });
        if (['No-Code', 'Productivité'].includes(item.categorie)) liens.push({ titre: "Automatiser avec l'IA", href: '/automatiser-avec-ia.html' });
        if (item.categorie === 'No-Code') liens.push({ titre: 'Outils No-Code 2026', href: '/outils-no-code.html' });
        if (!liens.length) return '';
        return `<div class="fiche-voir-aussi">
          <span class="fiche-voir-aussi-label">Lire aussi</span>
          ${liens.map(l => `<a href="${l.href}">${l.titre}</a>`).join('')}
        </div>`;
      })()}
    </main>

    ${barreScenariosHtml}
  </div>

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
  </footer>


${COOKIE_BANNER}
</body>
</html>`;
}

module.exports = { genererPageDetail };
