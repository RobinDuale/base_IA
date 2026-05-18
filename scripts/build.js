// build.js -- Script principal
// Ce script lit les outils depuis Notion et génère les pages HTML du site.
// Il est exécuté par GitHub Actions à chaque mise à jour de Notion.

const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// --- Configuration ---

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = "b6a3c72949e546f89c6dfc990689298e";
const DIST_DIR = path.join(__dirname, "..", "dist");


if (!NOTION_API_KEY) {
  console.error("Erreur : la variable NOTION_API_KEY est manquante.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

// --- Fonctions utilitaires ---

function creerDossier(chemin) {
  if (!fs.existsSync(chemin)) {
    fs.mkdirSync(chemin, { recursive: true });
  }
}

function slugifier(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extraireTexte(propriete) {
  if (!propriete) return "";
  if (propriete.type === "title") return propriete.title.map((t) => t.plain_text).join("");
  if (propriete.type === "rich_text") return propriete.rich_text.map((t) => t.plain_text).join("");
  if (propriete.type === "select") return propriete.select ? propriete.select.name : "";
  if (propriete.type === "multi_select") return propriete.multi_select.map((t) => t.name).join(", ");
  if (propriete.type === "url") return propriete.url || "";
  if (propriete.type === "status") return propriete.status ? propriete.status.name : "";
  if (propriete.type === "number") return propriete.number !== null && propriete.number !== undefined ? propriete.number : null;
  return "";
}

// --- Récupération des données Notion ---

async function recupererItems() {
  console.log("Lecture des items depuis Notion...");
  const items = [];
  let curseur = undefined;

  do {
    const reponse = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      start_cursor: curseur,
    });

    for (const page of reponse.results) {
      const p = page.properties;
      items.push({
        id: page.id,
        slug: slugifier(extraireTexte(p["Nom"])),
        nom: extraireTexte(p["Nom"]),
        type: extraireTexte(p["Type"]),
        ordre: extraireTexte(p["Ordre"]),
        categorie: extraireTexte(p["Catégorie"]),
        niveau: extraireTexte(p["Niveau"]),
        priorite: extraireTexte(p["Priorité"]),
        statut: extraireTexte(p["Statut d'apprentissage"]),
        description: extraireTexte(p["Description simple"]),
        avantages: extraireTexte(p["Avantages"]),
        limites: extraireTexte(p["Limites"]),
        casUsage: extraireTexte(p["Cas d'usage"]),
        casUsagePourMoi: extraireTexte(p["Cas d'usage pour moi"]),
        alternatives: extraireTexte(p["Alternatives"]),
        modeleEconomique: extraireTexte(p["Modèle économique"]),
        quandPayer: extraireTexte(p["Quand payer"]),
        lienOfficiel: extraireTexte(p["Lien officiel"]),
        notePersonnelles: extraireTexte(p["Notes personnelles"]),
        tags: extraireTexte(p["Tags"]),
        complementaireAvec: extraireTexte(p["Complémentaire avec"]),
        exemplesWorkflows: extraireTexte(p["Exemples & Workflows"]),
        quandUtiliser: extraireTexte(p["Quand utiliser cet outil"]),
        roleEcosysteme: extraireTexte(p["Rôle dans l'écosystème"]),
        gratuite: extraireTexte(p["Gratuité"]),
        scenarioSimple: extraireTexte(p["Scénario simple"]),
        scenarioIntermediaire: extraireTexte(p["Scénario intermédiaire"]),
        scenarioAvance: extraireTexte(p["Scénario avancé"]),
      });
    }

    curseur = reponse.has_more ? reponse.next_cursor : undefined;
  } while (curseur);

  // Trier par Ordre (nulls en dernier, puis par nom)
  items.sort((a, b) => {
    if (a.ordre === null && b.ordre === null) return a.nom.localeCompare(b.nom);
    if (a.ordre === null) return 1;
    if (b.ordre === null) return -1;
    return a.ordre - b.ordre;
  });

  console.log(`${items.length} item(s) récupéré(s).`);
  return items;
}

// --- Génération du HTML ---

const COULEURS_TAG = {
  CRM:          "#3b82f6",
  Veille:       "#22c55e",
  Prospection:  "#f97316",
  Workflow:     "#8b5cf6",
  Scraping:     "#d97706",
  IA:           "#ec4899",
  Hébergement:  "#14b8a6",
};

function badgeTag(tag) {
  const couleur = COULEURS_TAG[tag.trim()] || "#6b7280";
  return `<span class="tag-fiche" style="background:${couleur}">${tag.trim()}</span>`;
}

const COULEURS_CATEGORIE = {
  IA: "#3b82f6",
  "No-Code": "#22c55e",
  Automatisation: "#f97316",
  "Base de données": "#8b5cf6",
  Développement: "#ef4444",
  Productivité: "#eab308",
  Scraping: "#a16207",
  Hébergement: "#ec4899",
};

function badgeCategorie(categorie) {
  const couleur = COULEURS_CATEGORIE[categorie] || "#6b7280";
  return `<span class="badge" style="background:${couleur}">${categorie}</span>`;
}

function badgeNiveau(niveau) {
  const couleurs = { Débutant: "#22c55e", Intermédiaire: "#f97316", Avancé: "#ef4444" };
  const couleur = couleurs[niveau] || "#6b7280";
  return niveau ? `<span class="badge" style="background:${couleur}">${niveau}</span>` : "";
}

// --- Fonctions SEO ---

const BASE_URL = "https://ia.duale.fr";

const GA_TAG = `<script>
  function loadGA() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-61ZR41S7J7';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-61ZR41S7J7');
  }
  function acceptCookies() {
    localStorage.setItem('cookie_consent', 'accepted');
    var b = document.getElementById('cookie-banner');
    if (b) b.style.display = 'none';
    loadGA();
  }
  function refuseCookies() {
    localStorage.setItem('cookie_consent', 'refused');
    var b = document.getElementById('cookie-banner');
    if (b) b.style.display = 'none';
  }
  (function() {
    var consent = localStorage.getItem('cookie_consent');
    if (consent === 'accepted') {
      loadGA();
    } else if (consent === null) {
      document.addEventListener('DOMContentLoaded', function() {
        var b = document.getElementById('cookie-banner');
        if (b) b.style.display = 'flex';
      });
    }
  })();
</script>`;

const COOKIE_BANNER = `<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:1200px;z-index:9999;background:var(--ink);padding:20px 56px;display:none;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;box-shadow:0 -4px 24px rgba(26,23,18,0.2);">
  <p style="font-family:var(--font-body);font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6;flex:1;margin:0;">Ce site utilise Google Analytics pour mesurer son audience de facon anonymisee. Acceptez-vous le depot de cookies analytiques ? <a href="/mentions-legales.html" style="color:#fff;text-decoration:underline;">En savoir plus</a></p>
  <div style="display:flex;gap:10px;flex-shrink:0;">
    <button onclick="acceptCookies()" style="padding:9px 22px;background:var(--accent);color:#fff;font-family:var(--font-mono);font-size:12px;text-transform:uppercase;letter-spacing:0.12em;border:none;border-radius:var(--rayon-pill);cursor:pointer;">Accepter</button>
    <button onclick="refuseCookies()" style="padding:9px 22px;background:transparent;color:rgba(255,255,255,0.6);font-family:var(--font-mono);font-size:12px;text-transform:uppercase;letter-spacing:0.12em;border:1px solid rgba(255,255,255,0.25);border-radius:var(--rayon-pill);cursor:pointer;">Refuser</button>
  </div>
</div>`;
const OG_IMAGE = `${BASE_URL}/assets/og-default.png`;
const OG_IMAGE_ALT = "Base IA -- Référence des outils IA et No-Code par Robin Dualé";
const SITE_NAME = "Base IA · Robin Dualé";

// Tronque une description pour les meta tags (130-155 chars)
function descriptionMeta(texte, fallback) {
  if (!texte) return fallback;
  if (texte.length >= 130 && texte.length <= 155) return texte;
  if (texte.length > 155) return texte.substring(0, 152) + "...";
  return texte.length >= 80 ? texte : fallback;
}

// Génère un PNG solide (fond uni) en pur Node.js, sans dépendance externe
function genererPNGSolide(largeur, hauteur, r, g, b) {
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[i] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const typeBuf = Buffer.from(type);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largeur, 0);
  ihdr.writeUInt32BE(hauteur, 4);
  ihdr.writeUInt8(8, 8); ihdr.writeUInt8(2, 9);
  ihdr.writeUInt8(0, 10); ihdr.writeUInt8(0, 11); ihdr.writeUInt8(0, 12);
  const rowSize = largeur * 3 + 1;
  const raw = Buffer.alloc(hauteur * rowSize);
  for (let y = 0; y < hauteur; y++) {
    const off = y * rowSize;
    raw[off] = 0;
    for (let x = 0; x < largeur; x++) {
      raw[off + x * 3 + 1] = r;
      raw[off + x * 3 + 2] = g;
      raw[off + x * 3 + 3] = b;
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Génère le sitemap.xml
function genererSitemap(outils, llms) {
  const date = new Date().toISOString().split("T")[0];
  const urlEntry = (loc, freq, prio) => `  <url>
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
${outils.map((o) => urlEntry(`${BASE_URL}/outils/${o.slug}.html`, "monthly", "0.8")).join("\n")}
${llms.map((l) => urlEntry(`${BASE_URL}/llm/${l.slug}.html`, "monthly", "0.8")).join("\n")}
</urlset>`;
}

// Page d'accueil avec onglets Outils / LLMs
function genererPageAccueil(outils, llms) {
  const categories = [...new Set(outils.map((o) => o.categorie).filter(Boolean))];
  const tagsOutils = [...new Set(outils.flatMap((o) => o.tags ? o.tags.split(",").map((t) => t.trim()) : []).filter(Boolean))];
  const filtresUniques = [...new Set([...categories, ...tagsOutils])].sort();

  const filtres = filtresUniques
    .map((f) => {
      const couleur = COULEURS_CATEGORIE[f] || COULEURS_TAG[f] || "#6b7280";
      return `<button class="filtre" data-filtre="${f}" style="--filtre-couleur:${couleur}">${f}</button>`;
    })
    .join("\n        ");

  function genererCarte(item, prefixe, estLLM) {
    const couleurCat = estLLM
      ? "#8b5cf6"
      : (COULEURS_CATEGORIE[item.categorie] || "#6b7280");
    const tagsArray = item.tags ? item.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const tagsBadges = tagsArray.slice(0, 3).map(t => {
      const c = COULEURS_TAG[t] || "#6b7280";
      return `<span class="carte-tag" style="color:${c}">${t}</span>`;
    }).join("");
    const categorieLabel = estLLM ? "LLM" : (item.categorie || "");
    const typeLabel = estLLM ? "Modele" : (item.type || "Outil");

    return `
    <a class="carte" href="${prefixe}/${item.slug}.html" data-categorie="${item.categorie}" data-tags="${item.tags || ""}" data-notion-id="${item.id}">
      <div class="carte-accent" style="background:${couleurCat}"></div>
      <div class="carte-body">
        <div class="carte-head">
          <div class="carte-cat">${categorieLabel}</div>
          <div class="carte-type">${typeLabel}</div>
        </div>
        <h2 class="carte-nom">${item.nom}</h2>
        ${item.description ? `<p class="carte-description">${item.description}</p>` : ""}
        <div class="carte-foot">
          <div class="carte-tags">${tagsBadges}</div>
          <span class="carte-arrow">&#8594;</span>
        </div>
      </div>
    </a>`;
  }

  const cartesOutils = outils.map(o => genererCarte(o, "outils", false)).join("\n");
  const cartesLLMs = llms.map(l => genererCarte(l, "llm", true)).join("\n");

  const DESC_HOME = "Référence des meilleurs outils IA, No-Code et LLMs sélectionnés par Robin Dualé. Fiches détaillées, scénarios d'usage et modèles économiques.";
  const TITLE_HOME = "Base IA · Outils IA, No-Code et LLMs · Robin Dualé";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${TITLE_HOME}</title>
  <meta name="description" content="${DESC_HOME}"/>
  <link rel="canonical" href="${BASE_URL}/"/>
  <meta property="og:title" content="${TITLE_HOME}"/>
  <meta property="og:description" content="${DESC_HOME}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${BASE_URL}/"/>
  <meta property="og:image" content="${OG_IMAGE}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="${OG_IMAGE_ALT}"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="${SITE_NAME}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${TITLE_HOME}"/>
  <meta name="twitter:description" content="${DESC_HOME}"/>
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
      "@type": "WebSite",
      "name": "Base IA",
      "description": "${DESC_HOME}",
      "url": "${BASE_URL}/",
      "inLanguage": "fr",
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
      },
      "publisher": {
        "@type": "Person",
        "name": "Robin Dualé",
        "url": "https://cv-robin.duale.fr",
        "sameAs": "https://www.linkedin.com/in/robinduale"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Meilleurs outils IA, No-Code et LLMs",
      "description": "Sélection personnelle des outils IA, No-Code et LLMs avec fiches détaillées.",
      "url": "${BASE_URL}/",
      "numberOfItems": ${outils.length + llms.length},
      "itemListElement": [
        ${outils.map((o, i) => `{"@type":"ListItem","position":${i + 1},"name":"${o.nom}","url":"${BASE_URL}/outils/${o.slug}.html"}`).join(",\n        ")},
        ${llms.map((l, i) => `{"@type":"ListItem","position":${outils.length + i + 1},"name":"${l.nom}","url":"${BASE_URL}/llm/${l.slug}.html"}`).join(",\n        ")}
      ]
    }
  ]
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="styles.css"/>
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
  ${GA_TAG}
</head>
<body>
  <header>
    <h1><a href="/">Base <em>IA</em></a></h1>
  </header>

  <main>
    <section class="hero">
      <div class="hero-eyebrow">Mise a jour le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      <h2>Une bibliotheque <em>vivante</em><br/>des outils IA &amp; No-Code.</h2>
      <p class="hero-intro">
        Claude pour coder, Gémini pour rédiger, n8n pour automatiser, Notion pour structurer. Une référence pratique des meilleurs outils IA et No-Code.<br/>
        Points forts, gratuité, modèle économique, forces, limites, scénario et cas d'usage concrets pour choisir le bon outil au bon moment.
      </p>
      <div class="kpis">
        <div class="kpi">
          <div class="kpi-num">${outils.length}</div>
          <div class="kpi-label">Outils references</div>
        </div>
        <div class="kpi">
          <div class="kpi-num">${llms.length}</div>
          <div class="kpi-label">Grands modeles</div>
        </div>
        <div class="kpi">
          <div class="kpi-num">${categories.length}</div>
          <div class="kpi-label">Categories</div>
        </div>
        <div class="kpi">
          <div class="kpi-num">${tagsOutils.length}</div>
          <div class="kpi-label">Cas d'usage</div>
        </div>
      </div>
    </section>

    <div class="barre-recherche">
      <input type="search" id="recherche-global" class="champ-recherche" placeholder="Rechercher un outil ou un LLM..." oninput="filtrerGlobal()" autocomplete="off"/>
    </div>

    <div class="onglets" id="barre-onglets">
      <div class="onglets-gauche">
        <button class="onglet actif" onclick="afficherOnglet(this, 'outils')">Outils</button>
        <button class="onglet" onclick="afficherOnglet(this, 'llms')">LLMs</button>
      </div>
      <button class="onglet-proposer" onclick="ouvrirModalProposition()">
        <span class="onglet-proposer-plus">+</span>
        Proposer un nouvel outil
      </button>
    </div>

    <div id="section-outils">
      <div class="filtres">
        <button class="filtre actif" data-filtre="tous">Tous</button>
        ${filtres}
      </div>

      <div class="barre-actions">
        <button class="btn-reorganiser admin-zone" id="btnReorganiser" onclick="toggleReorganisation()" style="display:none">Réorganiser</button>
        <button class="btn-sauvegarder" id="btnSauvegarder" onclick="sauvegarderOrdre(this)" style="display:none">Sauvegarder l'ordre</button>
        <button class="btn-annuler" id="btnAnnuler" onclick="annulerReorganisation()" style="display:none">Annuler</button>
      </div>

      <div class="grille" id="grille">
        ${cartesOutils}
      </div>
    </div>

    <div id="section-llms" style="display:none">
      <div class="barre-actions">
        <button class="btn-reorganiser admin-zone" id="btnReorganiserLLM" onclick="toggleReorg('grille-llms', 'btnReorganiserLLM', 'btnSauvegarderLLM', 'btnAnnulerLLM')" style="display:none">Réorganiser</button>
        <button class="btn-sauvegarder" id="btnSauvegarderLLM" onclick="sauvegarderOrdreGrille('grille-llms', 'btnReorganiserLLM', this)" style="display:none">Sauvegarder l'ordre</button>
        <button class="btn-annuler" id="btnAnnulerLLM" onclick="annulerReorg('grille-llms', 'btnReorganiserLLM', 'btnSauvegarderLLM', 'btnAnnulerLLM')" style="display:none">Annuler</button>
      </div>
      <div class="grille" id="grille-llms">
        ${cartesLLMs}
      </div>
    </div>
  </main>

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
      <button class="btn-refresh admin-zone" onclick="rafraichirSite(this)" style="display:none">Mettre à jour le site</button>
      <a class="admin-zone" href="/admin-propositions.html" style="display:none;font-size:0.82rem;color:#888;text-decoration:none;padding:4px 8px;border:1px solid #ddd;border-radius:3px;" onmouseover="this.style.color='#333'" onmouseout="this.style.color='#888'">Propositions</a>
      <button onclick="ouvrirModalAdmin()" title="Administration" aria-label="Accès administration" style="background:none;border:none;cursor:pointer;color:#bbb;font-size:17px;padding:4px 6px;line-height:1;" onmouseover="this.style.color='#555'" onmouseout="this.style.color='#bbb'">⚙</button>
    </div>
  </footer>

  <script>
    function afficherOnglet(btn, nom) {
      document.querySelectorAll('.onglet').forEach(b => b.classList.remove('actif'));
      btn.classList.add('actif');
      document.getElementById('section-outils').style.display = nom === 'outils' ? '' : 'none';
      document.getElementById('section-llms').style.display = nom === 'llms' ? '' : 'none';
      window._ongletActif = nom;
    }

    function filtrerGlobal() {
      const query = document.getElementById('recherche-global').value.toLowerCase().trim();
      const barreOnglets = document.getElementById('barre-onglets');

      if (query) {
        // Mode recherche : afficher les deux sections
        barreOnglets.style.display = 'none';
        document.getElementById('section-outils').style.display = '';
        document.getElementById('section-llms').style.display = '';

        // Filtrer les cartes outils
        const filtreActif = document.querySelector('.filtre.actif')?.dataset.filtre || 'tous';
        document.querySelectorAll('#section-outils .carte').forEach(carte => {
          const nom = (carte.querySelector('.carte-nom')?.textContent || '').toLowerCase();
          const desc = (carte.querySelector('.carte-description')?.textContent || '').toLowerCase();
          const matchQuery = nom.includes(query) || desc.includes(query);
          const tags = (carte.dataset.tags || '').split(',').map(t => t.trim());
          const matchFiltre = filtreActif === 'tous' || carte.dataset.categorie === filtreActif || tags.includes(filtreActif);
          carte.style.display = matchQuery && matchFiltre ? '' : 'none';
        });

        // Filtrer les cartes LLMs
        document.querySelectorAll('#section-llms .carte').forEach(carte => {
          const nom = (carte.querySelector('.carte-nom')?.textContent || '').toLowerCase();
          const desc = (carte.querySelector('.carte-description')?.textContent || '').toLowerCase();
          carte.style.display = nom.includes(query) || desc.includes(query) ? '' : 'none';
        });
      } else {
        // Recherche vide : revenir à l'onglet actif
        barreOnglets.style.display = '';
        const ongletActif = window._ongletActif || 'outils';
        document.getElementById('section-outils').style.display = ongletActif === 'outils' ? '' : 'none';
        document.getElementById('section-llms').style.display = ongletActif === 'llms' ? '' : 'none';
        // Réafficher toutes les cartes
        document.querySelectorAll('.carte').forEach(c => c.style.display = '');
        filtrerOutils();
      }
    }

    function rafraichirSite(btn) {
      const cliqueLe = new Date().toISOString();
      btn.disabled = true;
      btn.textContent = "Déclenchement en cours...";
      fetch("https://n8n.srv1161197.hstgr.cloud/webhook/base-ia-refresh")
        .then(() => {
          btn.textContent = "Build lancé -- vérification en cours...";
          attendreMiseAJour(btn, cliqueLe);
        })
        .catch(() => {
          btn.textContent = "Erreur -- réessaie dans un moment";
          btn.disabled = false;
        });
    }

    function attendreMiseAJour(btn, cliqueLe) {
      const TIMEOUT = 5 * 60 * 1000;
      const INTERVALLE = 10 * 1000;
      const debut = Date.now();
      const interval = setInterval(() => {
        if (Date.now() - debut > TIMEOUT) {
          clearInterval(interval);
          btn.textContent = "Délai dépassé -- réessaie";
          btn.disabled = false;
          return;
        }
        fetch(window.location.origin + "/version.json?t=" + Date.now())
          .then((r) => r.json())
          .then((data) => {
            if (data.built_at > cliqueLe) {
              clearInterval(interval);
              btn.textContent = "Site mis à jour !";
              setTimeout(() => { btn.textContent = "Mettre à jour le site"; btn.disabled = false; }, 4000);
            }
          })
          .catch(() => {});
      }, INTERVALLE);
    }
  </script>

  <script>
    const sortables = {};
    const ordresInitiaux = {};

    function toggleReorg(grilleId, btnRId, btnSId, btnAId) {
      const grille = document.getElementById(grilleId);
      const btnR = document.getElementById(btnRId);
      const btnS = document.getElementById(btnSId);
      const btnA = document.getElementById(btnAId);
      ordresInitiaux[grilleId] = Array.from(grille.children).map(c => c.dataset.notionId);
      grille.classList.add("mode-reorganisation");
      btnR.style.display = "none";
      btnS.style.display = "";
      btnA.style.display = "";
      sortables[grilleId] = new Sortable(grille, { animation: 150, ghostClass: "carte-ghost", onEnd: () => {} });
    }

    function annulerReorg(grilleId, btnRId, btnSId, btnAId) {
      desactiverReorg(grilleId, btnRId, btnSId, btnAId);
      const grille = document.getElementById(grilleId);
      (ordresInitiaux[grilleId] || []).forEach(id => {
        const carte = grille.querySelector('[data-notion-id="' + id + '"]');
        if (carte) grille.appendChild(carte);
      });
    }

    function desactiverReorg(grilleId, btnRId, btnSId, btnAId) {
      const grille = document.getElementById(grilleId);
      document.getElementById(btnRId).style.display = "";
      document.getElementById(btnSId).style.display = "none";
      document.getElementById(btnAId).style.display = "none";
      grille.classList.remove("mode-reorganisation");
      if (sortables[grilleId]) { sortables[grilleId].destroy(); delete sortables[grilleId]; }
    }

    function sauvegarderOrdreGrille(grilleId, btnRId, btn) {
      const grille = document.getElementById(grilleId);
      const btnSId = btn.id;
      const btnAId = btnSId.replace("Sauvegarder", "Annuler");
      const ordre = Array.from(grille.children).map((carte, index) => ({ id: carte.dataset.notionId, ordre: index + 1 }));
      btn.disabled = true;
      btn.textContent = "Sauvegarde en cours...";
      fetch("https://n8n.srv1161197.hstgr.cloud/webhook/base-ia-reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordre })
      })
        .then(() => {
          btn.textContent = "Sauvegardé -- build en cours...";
          desactiverReorg(grilleId, btnRId, btnSId, btnAId);
          const btnR = document.getElementById(btnRId);
          btnR.disabled = true;
          attendreMiseAJour(btnR, new Date().toISOString());
        })
        .catch(() => { btn.textContent = "Erreur -- réessaie"; btn.disabled = false; });
    }

    // Alias pour la grille outils (compatibilité boutons HTML)
    function toggleReorganisation() { toggleReorg('grille', 'btnReorganiser', 'btnSauvegarder', 'btnAnnuler'); }
    function annulerReorganisation() { annulerReorg('grille', 'btnReorganiser', 'btnSauvegarder', 'btnAnnuler'); }
    function sauvegarderOrdre(btn) { sauvegarderOrdreGrille('grille', 'btnReorganiser', btn); }
  </script>

  <script>
    function filtrerOutils() {
      const query = (document.getElementById("recherche-global")?.value || "").toLowerCase().trim();
      const filtreActif = document.querySelector(".filtre.actif")?.dataset.filtre || "tous";
      document.querySelectorAll("#section-outils .carte").forEach((carte) => {
        const nom = (carte.querySelector(".carte-nom")?.textContent || "").toLowerCase();
        const desc = (carte.querySelector(".carte-description")?.textContent || "").toLowerCase();
        const matchQuery = !query || nom.includes(query) || desc.includes(query);
        const tags = (carte.dataset.tags || "").split(",").map((t) => t.trim());
        const matchFiltre = filtreActif === "tous" || carte.dataset.categorie === filtreActif || tags.includes(filtreActif);
        carte.style.display = matchQuery && matchFiltre ? "" : "none";
      });
    }

    function filtrerLLMs() {
      const query = (document.getElementById("recherche-global")?.value || "").toLowerCase().trim();
      document.querySelectorAll("#section-llms .carte").forEach((carte) => {
        const nom = (carte.querySelector(".carte-nom")?.textContent || "").toLowerCase();
        const desc = (carte.querySelector(".carte-description")?.textContent || "").toLowerCase();
        const match = !query || nom.includes(query) || desc.includes(query);
        carte.style.display = match ? "" : "none";
      });
    }

    document.querySelectorAll(".filtre").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filtre").forEach((b) => {
          b.classList.remove("actif");
          b.style.borderColor = "";
          b.style.color = "";
        });
        btn.classList.add("actif");
        filtrerOutils();
      });
      btn.addEventListener("mouseenter", () => {
        if (!btn.classList.contains("actif")) {
          const couleur = getComputedStyle(btn).getPropertyValue("--filtre-couleur").trim();
          btn.style.borderColor = couleur;
          btn.style.color = couleur;
        }
      });
      btn.addEventListener("mouseleave", () => {
        if (!btn.classList.contains("actif")) {
          btn.style.borderColor = "";
          btn.style.color = "";
        }
      });
    });
  </script>

  <div id="modal-proposition" onclick="if(event.target===this)fermerModalProposition()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998;align-items:center;justify-content:center;">
    <div style="background:#fff;border-radius:6px;padding:32px 36px;width:100%;max-width:460px;margin:16px;position:relative;box-shadow:0 8px 24px rgba(0,0,0,.15);">
      <button onclick="fermerModalProposition()" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:#bbb;line-height:1;">×</button>
      <p style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#999;margin-bottom:20px;">Proposer un outil · Base IA</p>
      <div id="prop-step1">
        <label style="display:block;font-size:13px;color:#555;margin-bottom:8px;">Quel outil souhaitez-vous ajouter ?</label>
        <input type="text" id="prop-nom" placeholder="ex: Zapier, Notion, Midjourney..." style="width:100%;padding:9px 12px;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;outline:none;margin-bottom:12px;box-sizing:border-box;" onkeydown="if(event.key==='Enter')verifierOutil()"/>
        <div id="prop-erreur1" style="display:none;color:#dc2626;font-size:12px;margin-bottom:8px;"></div>
        <button type="button" onclick="verifierOutil()" style="width:100%;padding:10px;background:#1a1712;color:#fff;border:none;border-radius:3px;font-size:14px;font-weight:500;cursor:pointer;">Vérifier l'outil →</button>
      </div>
      <div id="prop-loading" style="display:none;text-align:center;padding:1.5rem 0;color:#888;font-size:14px;">Vérification en cours...</div>
      <div id="prop-existe" style="display:none;">
        <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:4px;padding:12px 16px;margin-bottom:16px;font-size:14px;color:#92400e;"><strong id="prop-nom-existe"></strong> est déjà dans la base.</div>
        <button type="button" onclick="propReset()" style="width:100%;padding:9px;background:none;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;cursor:pointer;color:#555;">Proposer un autre outil</button>
      </div>
      <div id="prop-notaitool" style="display:none;">
        <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:4px;padding:12px 16px;margin-bottom:16px;font-size:14px;color:#92400e;">L'outil spécifié n'a pas été identifié comme un outil IA ou No-Code répertorié. Confirmer la demande ou fermer.</div>
        <div style="display:flex;gap:8px;">
          <button type="button" onclick="propConfirmerMalgre()" style="flex:1;padding:9px;background:#1a1712;color:#fff;border:none;border-radius:3px;font-size:14px;cursor:pointer;">Confirmer la demande</button>
          <button type="button" onclick="fermerModalProposition()" style="flex:1;padding:9px;background:none;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;cursor:pointer;color:#555;">Fermer</button>
        </div>
      </div>
      <div id="prop-step2" style="display:none;">
        <div id="prop-bloc-gemini" style="display:none;background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#0c4a6e;"><strong>Outil IA/No-Code confirmé.</strong> <span id="prop-desc-gemini"></span></div>
        <input type="hidden" id="prop-nom-hidden"/>
        <label style="display:block;font-size:12px;font-weight:600;text-transform:uppercase;color:#888;margin-bottom:5px;">URL officielle <span style="color:#ef4444">*</span></label>
        <input type="url" id="prop-url" placeholder="https://..." style="width:100%;padding:9px 12px;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;outline:none;margin-bottom:12px;box-sizing:border-box;"/>
        <label style="display:block;font-size:12px;font-weight:600;text-transform:uppercase;color:#888;margin-bottom:5px;">Votre email <span style="color:#ef4444">*</span></label>
        <input type="email" id="prop-email" placeholder="votre@email.com" style="width:100%;padding:9px 12px;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;outline:none;margin-bottom:12px;box-sizing:border-box;"/>
        <div id="prop-erreur2" style="display:none;color:#dc2626;font-size:12px;margin-bottom:8px;"></div>
        <p style="font-size:11px;color:#aaa;margin-bottom:12px;">Un email de confirmation vous sera envoyé. Votre email n'est utilisé que pour cette proposition.</p>
        <button type="button" onclick="soumettreProposition()" style="width:100%;padding:10px;background:#1a1712;color:#fff;border:none;border-radius:3px;font-size:14px;font-weight:500;cursor:pointer;">Envoyer ma proposition →</button>
      </div>
      <div id="prop-succes" style="display:none;text-align:center;padding:1rem 0;">
        <div style="width:48px;height:48px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.5rem;color:#fff;">✓</div>
        <p style="font-weight:600;margin-bottom:0.5rem;">Proposition envoyée !</p>
        <p style="color:#888;font-size:14px;">Vérifiez votre boite mail pour confirmer votre adresse.</p>
      </div>
    </div>
  </div>
  <script>
    function ouvrirModalProposition() {
      propReset();
      document.getElementById('modal-proposition').style.display = 'flex';
      setTimeout(() => document.getElementById('prop-nom').focus(), 50);
    }
    function fermerModalProposition() { document.getElementById('modal-proposition').style.display = 'none'; }
    function propReset() {
      propShowStep('step1');
      ['prop-nom','prop-url','prop-email'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
      document.getElementById('prop-bloc-gemini').style.display = 'none';
    }
    function propShowStep(step) {
      ['step1','loading','existe','notaitool','step2','succes'].forEach(s => {
        document.getElementById('prop-' + s).style.display = s === step ? '' : 'none';
      });
    }
    function propConfirmerMalgre() { propShowStep('step2'); }
    async function verifierOutil() {
      const nom = document.getElementById('prop-nom').value.trim();
      const errEl = document.getElementById('prop-erreur1');
      errEl.style.display = 'none';
      if (!nom) { document.getElementById('prop-nom').focus(); return; }
      propShowStep('loading');
      try {
        const r = await fetch('https://n8n.srv1161197.hstgr.cloud/webhook/check-tool', {
          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ nom })
        });
        if (!r.ok) throw new Error('Erreur serveur ' + r.status);
        const data = await r.json();
        if (data.exists) {
          document.getElementById('prop-nom-existe').textContent = nom;
          propShowStep('existe');
        } else {
          document.getElementById('prop-nom-hidden').value = nom;
          if (data.description && data.isAiTool !== false) {
            document.getElementById('prop-desc-gemini').textContent = data.description;
            document.getElementById('prop-bloc-gemini').style.display = '';
          }
          if (data.officialUrl) document.getElementById('prop-url').value = data.officialUrl;
          if (data.isAiTool === false) {
            propShowStep('notaitool');
          } else {
            propShowStep('step2');
          }
        }
      } catch(e) {
        propShowStep('step1');
        errEl.textContent = "Impossible de vérifier l'outil. Réessayez dans un instant.";
        errEl.style.display = '';
      }
    }
    async function soumettreProposition() {
      const outil = document.getElementById('prop-nom-hidden').value;
      const url = document.getElementById('prop-url').value.trim();
      const email = document.getElementById('prop-email').value.trim();
      const description = '';
      const errEl = document.getElementById('prop-erreur2');
      errEl.style.display = 'none';
      if (!url) { document.getElementById('prop-url').focus(); return; }
      if (!email) { document.getElementById('prop-email').focus(); return; }
      propShowStep('loading');
      try {
        const r = await fetch('https://n8n.srv1161197.hstgr.cloud/webhook/submit-proposal', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ outil, email, url, description })
        });
        if (!r.ok) throw new Error('Erreur serveur ' + r.status);
        propShowStep('succes');
      } catch(e) {
        propShowStep('step2');
        errEl.textContent = 'Une erreur est survenue. Réessayez dans un instant.';
        errEl.style.display = '';
      }
    }
  </script>

  <div id="modal-admin" onclick="if(event.target===this)fermerModalAdmin()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;align-items:center;justify-content:center;">
    <div style="background:#fff;border-radius:6px;padding:32px 36px;width:100%;max-width:340px;margin:16px;position:relative;box-shadow:0 8px 24px rgba(0,0,0,.15);">
      <button onclick="fermerModalAdmin()" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:#bbb;line-height:1;">×</button>
      <p style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#999;margin-bottom:20px;">Administration · Base IA</p>
      <div id="panel-login">
        <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;color:#888;margin-bottom:6px;">Clé d'accès</label>
        <input type="password" id="input-cle-admin" placeholder="••••••••" style="width:100%;padding:9px 12px;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;font-family:monospace;outline:none;margin-bottom:8px;box-sizing:border-box;" onkeydown="if(event.key==='Enter')connecterAdmin()"/>
        <div id="erreur-admin" style="display:none;color:#c0392b;font-size:13px;margin-bottom:8px;">Clé incorrecte.</div>
        <button onclick="connecterAdmin()" style="width:100%;padding:10px;background:#1a1712;color:#fff;border:none;border-radius:3px;font-size:14px;font-weight:500;cursor:pointer;">Accéder</button>
      </div>
      <div id="panel-admin" style="display:none">
        <p style="color:#27ae60;font-size:14px;margin-bottom:16px;">Mode admin actif.</p>
        <button onclick="deconnecterAdmin()" style="width:100%;padding:10px;background:none;border:1px solid #e0d9cc;border-radius:3px;font-size:14px;cursor:pointer;color:#c0392b;">Se déconnecter</button>
      </div>
    </div>
  </div>
  <script>
    function getAdminCookie() {
      return document.cookie.split(';').some(c => c.trim() === 'admin_duale=1');
    }
    function setAdminCookie() {
      document.cookie = 'admin_duale=1; domain=.duale.fr; path=/; max-age=86400; SameSite=Lax';
    }
    function deleteAdminCookie() {
      document.cookie = 'admin_duale=; domain=.duale.fr; path=/; max-age=0';
    }
    function initAdminMode() {
      if (getAdminCookie()) activerAdmin();
    }
    function activerAdmin() {
      document.querySelectorAll('.admin-zone').forEach(el => el.style.display = '');
    }
    function ouvrirModalAdmin() {
      const estAdmin = getAdminCookie();
      document.getElementById('panel-login').style.display = estAdmin ? 'none' : '';
      document.getElementById('panel-admin').style.display = estAdmin ? '' : 'none';
      document.getElementById('erreur-admin').style.display = 'none';
      if (!estAdmin) document.getElementById('input-cle-admin').value = '';
      document.getElementById('modal-admin').style.display = 'flex';
      if (!estAdmin) setTimeout(() => document.getElementById('input-cle-admin').focus(), 50);
    }
    function fermerModalAdmin() {
      document.getElementById('modal-admin').style.display = 'none';
    }
    async function connecterAdmin() {
      const val = document.getElementById('input-cle-admin').value.trim();
      const errEl = document.getElementById('erreur-admin');
      if (!val) { errEl.style.display = 'block'; return; }
      try {
        const r = await fetch('https://api.github.com/user', {
          headers: { Authorization: 'token ' + val }
        });
        if (r.ok) { validerAdmin(); return; }
      } catch(e) {}
      errEl.style.display = 'block';
    }
    function validerAdmin() {
      setAdminCookie();
      document.getElementById('panel-login').style.display = 'none';
      document.getElementById('panel-admin').style.display = '';
      activerAdmin();
    }
    function deconnecterAdmin() {
      deleteAdminCookie();
      document.querySelectorAll('.admin-zone').forEach(el => el.style.display = 'none');
      fermerModalAdmin();
    }
    initAdminMode();
  </script>
${COOKIE_BANNER}
</body>
</html>`;
}

function genererPageConfirmation() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Proposition confirmée · Base IA</title>
  <meta name="robots" content="noindex, nofollow"/>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/styles.css"/>
  ${GA_TAG}
</head>
<body>
<header>
  <h1><a href="/">Base <em>IA</em></a></h1>
  <a class="retour" href="/">&#8592; Retour a la base</a>
</header>

<main>
  <div class="page-simple" style="text-align:center;padding-top:64px;">
    <div style="width:56px;height:56px;background:#2a7256;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;font-size:1.5rem;color:#fff;font-weight:500;">&#10003;</div>
    <div class="page-simple-eyebrow">Proposition recue</div>
    <h1 class="page-simple-h1">Merci pour votre contribution&nbsp;!</h1>
    <p style="font-size:18px;line-height:1.65;color:var(--ink);max-width:480px;margin:0 auto 32px;">
      Votre email a bien ete confirme. Robin va examiner votre proposition -- vous recevrez un message si l'outil est valide et ajoute a la base.
    </p>
    <a href="/" class="fiche-action fiche-action--primary" style="font-weight:500;">Retour a Base IA &#8594;</a>
  </div>
</main>
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

function genererAdminPropositions() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Propositions · Admin · Base IA</title>
  <meta name="robots" content="noindex, nofollow"/>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
  <link rel="stylesheet" href="/styles.css"/>
  ${GA_TAG}
  <style>
    .prop-table { width:100%; border-collapse:collapse; font-size:0.9rem; }
    .prop-table th { text-align:left; padding:10px 12px; border-bottom:2px solid #e5e1d8; font-weight:600; color:#555; font-size:0.8rem; text-transform:uppercase; letter-spacing:.04em; }
    .prop-table td { padding:10px 12px; border-bottom:1px solid #f0ece4; vertical-align:top; }
    .prop-table tr:hover td { background:rgba(255,255,255,0.06); }
    .statut-badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:600; white-space:nowrap; }
    .statut-recue { background:#f3f4f6; color:#6b7280; }
    .statut-email { background:#dbeafe; color:#1d4ed8; }
    .statut-encours { background:#fef3c7; color:#92400e; }
    .statut-validee { background:#d1fae5; color:#065f46; }
    .statut-rejetee { background:#fee2e2; color:#991b1b; }
    .btn-valider { background:#22c55e; color:#fff; border:none; padding:5px 12px; border-radius:3px; cursor:pointer; font-size:0.8rem; font-weight:600; margin-right:6px; }
    .btn-rejeter { background:#ef4444; color:#fff; border:none; padding:5px 12px; border-radius:3px; cursor:pointer; font-size:0.8rem; font-weight:600; }
    .btn-valider:disabled, .btn-rejeter:disabled { opacity:.4; cursor:not-allowed; }
    .filter-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1.5rem; }
    .filter-tab { padding:5px 14px; border:1px solid #d0c9bc; border-radius:20px; cursor:pointer; font-size:0.82rem; background:#fff; }
    .filter-tab.actif { background:#1a1712; color:#fff; border-color:#1a1712; }
    .prop-nom { font-weight:600; }
    .prop-url { font-size:0.8rem; word-break:break-all; }
    .prop-desc { font-size:0.82rem; color:#666; max-width:280px; line-height:1.5; }
    #loading-msg { color:#888; padding:2rem 0; text-align:center; }
    #error-msg { color:#dc2626; padding:1rem; background:#fee2e2; border-radius:4px; display:none; }
    .compteur { font-size:0.82rem; color:#888; margin-bottom:1rem; }
  </style>
</head>
<body>
<header>
  <a class="retour" href="/">← Base IA</a>
  <h1>Propositions d'outils</h1>
</header>
<main>
  <div id="admin-guard" style="display:none;max-width:480px;margin:3rem auto;text-align:center;">
    <p style="color:#dc2626;font-weight:600;">Accès réservé à l'admin.</p>
    <a href="/" style="color:#888;font-size:0.9rem;">← Retour à l'accueil</a>
  </div>

  <div id="admin-content" style="display:none;">
    <div id="error-msg"></div>

    <div class="filter-tabs">
      <button class="filter-tab actif" onclick="filtrerStatut('tous', this)">Toutes</button>
      <button class="filter-tab" onclick="filtrerStatut('Reçue', this)">Reçue</button>
      <button class="filter-tab" onclick="filtrerStatut('Email validé', this)">Email validé</button>
      <button class="filter-tab" onclick="filtrerStatut('En cours', this)">En cours</button>
      <button class="filter-tab" onclick="filtrerStatut('Validée', this)">Validée</button>
      <button class="filter-tab" onclick="filtrerStatut('Rejetée', this)">Rejetée</button>
    </div>

    <div class="compteur" id="compteur"></div>
    <div id="loading-msg">Chargement des propositions...</div>

    <div id="table-wrapper" style="display:none;overflow-x:auto;">
      <table class="prop-table">
        <thead>
          <tr>
            <th>Outil</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
  </div>
</main>
<footer>
  <div class="footer-contenu">
    <div class="footer-gauche">
      <span class="footer-copy">© 2026 Robin Dualé · <a href="https://duale.fr" target="_blank" rel="noopener noreferrer">duale.fr</a></span>
    </div>
    <div class="footer-liens">
      <a href="/">Accueil</a>
      <a href="/mentions-legales.html">Mentions légales</a>
    </div>
  </div>
</footer>
<script>
const N8N = 'https://n8n.srv1161197.hstgr.cloud/webhook';
let toutesPropositions = [];
let filtreActif = 'tous';

function isAdmin() {
  return document.cookie.split(';').some(c => c.trim() === 'admin_duale=1');
}

function statutClasse(statut) {
  if (statut === 'Reçue') return 'statut-recue';
  if (statut === 'Email validé') return 'statut-email';
  if (statut === 'En cours') return 'statut-encours';
  if (statut === 'Validée') return 'statut-validee';
  if (statut === 'Rejetée') return 'statut-rejetee';
  return 'statut-recue';
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function renderLigne(p) {
  const peutAgir = ['Email validé', 'Email valide', 'Reçue', 'En cours'].includes(p.statut);
  return \`<tr data-statut="\${p.statut}" data-id="\${p.id}">
    <td>
      <div class="prop-nom">\${escHtml(p.nom)}</div>
      <div class="prop-url">\${p.url ? \`<a href="\${escHtml(p.url)}" target="_blank" rel="noopener noreferrer">\${escHtml(p.url)}</a>\` : '-'}</div>
    </td>
    <td>\${escHtml(p.email || '-')}</td>
    <td><span class="statut-badge \${statutClasse(p.statut)}">\${escHtml(p.statut)}</span></td>
    <td style="white-space:nowrap;font-size:0.8rem;">\${formatDate(p.date)}</td>
    <td><div class="prop-desc">\${escHtml(p.description || '-')}</div></td>
    <td style="white-space:nowrap;">
      \${peutAgir ? \`
        <button class="btn-valider" onclick="agir('\${p.id}', 'valider', this)">Valider</button>
        <button class="btn-rejeter" onclick="agir('\${p.id}', 'rejeter', this)">Rejeter</button>
      \` : '-'}
    </td>
  </tr>\`;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function filtrerStatut(statut, btn) {
  filtreActif = statut;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('actif'));
  btn.classList.add('actif');
  afficherPropositions();
}

function afficherPropositions() {
  const liste = filtreActif === 'tous' ? toutesPropositions : toutesPropositions.filter(p => p.statut === filtreActif);
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = liste.length ? liste.map(renderLigne).join('') : '<tr><td colspan="6" style="text-align:center;color:#888;padding:2rem;">Aucune proposition dans cette catégorie.</td></tr>';
  document.getElementById('compteur').textContent = liste.length + ' proposition' + (liste.length > 1 ? 's' : '') + (filtreActif !== 'tous' ? ' · ' + filtreActif : '');
}

async function chargerPropositions() {
  try {
    const res = await fetch(N8N + '/admin-proposals');
    if (!res.ok) throw new Error('Erreur ' + res.status);
    const data = await res.json();
    toutesPropositions = data.proposals || [];
    document.getElementById('loading-msg').style.display = 'none';
    document.getElementById('table-wrapper').style.display = '';
    afficherPropositions();
  } catch(e) {
    document.getElementById('loading-msg').style.display = 'none';
    const err = document.getElementById('error-msg');
    err.style.display = '';
    err.textContent = 'Impossible de charger les propositions : ' + e.message;
  }
}

async function agir(pageId, action, btn) {
  const row = btn.closest('tr');
  row.querySelectorAll('button').forEach(b => b.disabled = true);
  btn.textContent = action === 'valider' ? 'En cours...' : 'Rejet...';
  try {
    const res = await fetch(N8N + '/admin-validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, action })
    });
    if (!res.ok) throw new Error('Erreur ' + res.status);
    const data = await res.json();
    btn.textContent = action === 'valider' ? 'Validé ✓' : 'Rejeté ✓';
    btn.style.background = action === 'valider' ? '#16a34a' : '#b91c1c';
    const badge = row.querySelector('.statut-badge');
    if (badge) {
      const newStatut = action === 'valider' ? 'Validée' : 'Rejetée';
      badge.textContent = newStatut;
      badge.className = 'statut-badge ' + statutClasse(newStatut);
    }
    row.querySelectorAll('button').forEach(b => { b.disabled = true; });
    const idx = toutesPropositions.findIndex(p => p.id === pageId);
    if (idx >= 0) toutesPropositions[idx].statut = action === 'valider' ? 'Validée' : 'Rejetée';
  } catch(e) {
    alert('Erreur : ' + e.message);
    row.querySelectorAll('button').forEach(b => b.disabled = false);
    btn.textContent = action === 'valider' ? 'Valider' : 'Rejeter';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!isAdmin()) {
    document.getElementById('admin-guard').style.display = '';
  } else {
    document.getElementById('admin-content').style.display = '';
    chargerPropositions();
  }
});
</script>
${COOKIE_BANNER}
</body>
</html>`;
}

// Page détail (commune Outils et LLMs)
function genererPageDetail(item, liste, prefixe) {
  function section(type, label, titre, contenu) {
    if (!contenu) return "";
    return `
    <section class="section" data-type="${type}">
      <div class="section-eyebrow">${label}</div>
      <h2>${titre}</h2>
      <p>${contenu.replace(/\n/g, "<br/>")}</p>
    </section>`;
  }

  function sectionPair(s1, s2) {
    if (!s1 && !s2) return "";
    return `<div class="section-pair">${s1 || '<div></div>'}${s2 || '<div></div>'}</div>`;
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

  const liensBarreLaterale = liste
    .map((o) => {
      const couleur = o.type === "LLM" ? "#8b5cf6" : (COULEURS_CATEGORIE[o.categorie] || "#6b7280");
      return `<a href="${o.slug}.html" class="${o.slug === item.slug ? "actif" : ""}">
        <span class="nav-dot" style="background:${couleur}"></span>
        <span>${o.nom}</span>
      </a>`;
    })
    .join("\n        ");

  const catColor = item.type === "LLM" ? "#8b5cf6" : (COULEURS_CATEGORIE[item.categorie] || "#6b7280");
  const catColorSoft = catColor + "14";
  const categorieLabel = item.type === "LLM" ? "LLM" : (item.categorie || "Outil");

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
        <p class="scenario-texte">${item.scenarioSimple}</p>
      </div>` : ""}
      ${item.scenarioIntermediaire ? `
      <div class="scenario">
        <h3 class="scenario-niveau scenario-intermediaire">Intermediaire</h3>
        <p class="scenario-texte">${item.scenarioIntermediaire}</p>
      </div>` : ""}
      ${item.scenarioAvance ? `
      <div class="scenario">
        <h3 class="scenario-niveau scenario-avance">Avance</h3>
        <p class="scenario-texte">${item.scenarioAvance}</p>
      </div>` : ""}
      ` : ""}
      ${specSheetHtml}
    </aside>`;

  const typeLabel = item.type === "LLM" ? "LLM" : (item.categorie || "Outil IA");
  const titleDetail = `${item.nom} · ${typeLabel} · Base IA`;
  const descFallback = `Fiche complète sur ${item.nom} : avantages, limites, cas d'usage et scénarios. ${typeLabel} sélectionné dans la Base IA de Robin Dualé.`;
  const descDetail = descriptionMeta(item.description, descFallback);
  const urlDetail = `${BASE_URL}/${prefixe}/${item.slug}.html`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${titleDetail}</title>
  <meta name="description" content="${descDetail}"/>
  <link rel="canonical" href="${urlDetail}"/>
  <meta property="og:title" content="${titleDetail}"/>
  <meta property="og:description" content="${descDetail}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${urlDetail}"/>
  <meta property="og:image" content="${OG_IMAGE}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="${OG_IMAGE_ALT}"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="${SITE_NAME}"/>
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
        {"@type": "ListItem", "position": 2, "name": "${item.nom}", "item": "${urlDetail}"}
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "${item.nom}",
      "description": "${descDetail}",
      "applicationCategory": "${item.type === "LLM" ? "AIApplication" : "WebApplication"}",
      "operatingSystem": "Web",
      ${item.lienOfficiel ? `"url": "${item.lienOfficiel}",` : ""}
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
    }
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
    <h1><a href="../index.html">Base <em>IA</em></a></h1>
    <a class="retour" href="../index.html">&#8592; Retour a la base</a>
  </header>

  <div class="mise-en-page">
    <nav class="barre-laterale">
      <p class="barre-laterale-titre">${item.type === "LLM" ? "Tous les LLMs" : "Tous les outils"}</p>
      ${liensBarreLaterale}
    </nav>

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
          ${item.lienOfficiel ? `<a class="fiche-action fiche-action--primary" href="${item.lienOfficiel}" target="_blank" rel="noopener noreferrer">Site officiel &#8599;</a>` : ""}
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
      ${section('usage', '&#9679; Usage', `Avec quels outils ${item.nom} est-il complementaire ?`, item.complementaireAvec)}

      ${sectionPair(
        section('eco', '&#9679; Economique', `Modele economique de ${item.nom}`, item.modeleEconomique),
        section('eco', '&#9679; Economique', `Quand passer a la version payante`, item.quandPayer)
      )}

      <div id="alternatives">
        ${section('intro', '&#9679; Alternatives', `Quelles alternatives a ${item.nom} ?`, item.alternatives)}
      </div>

      ${section('notes', '&#9679; Carnet', `Notes personnelles sur ${item.nom}`, item.notePersonnelles)}
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
      <button class="btn-refresh admin-zone" onclick="rafraichirSite(this)" style="display:none">Mettre à jour le site</button>
      <button onclick="ouvrirModalAdmin()" title="Administration" aria-label="Accès administration" style="background:none;border:none;cursor:pointer;color:#bbb;font-size:17px;padding:4px 6px;line-height:1;" onmouseover="this.style.color='#555'" onmouseout="this.style.color='#bbb'">⚙</button>
    </div>
  </footer>

  <script>
    function rafraichirSite(btn) {
      const cliqueLe = new Date().toISOString();
      btn.disabled = true;
      btn.textContent = "Déclenchement en cours...";
      fetch("https://n8n.srv1161197.hstgr.cloud/webhook/base-ia-refresh")
        .then(() => {
          btn.textContent = "Build lancé -- vérification en cours...";
          attendreMiseAJour(btn, cliqueLe);
        })
        .catch(() => { btn.textContent = "Erreur -- réessaie dans un moment"; btn.disabled = false; });
    }

    function attendreMiseAJour(btn, cliqueLe) {
      const TIMEOUT = 5 * 60 * 1000;
      const INTERVALLE = 10 * 1000;
      const debut = Date.now();
      const interval = setInterval(() => {
        if (Date.now() - debut > TIMEOUT) {
          clearInterval(interval);
          btn.textContent = "Délai dépassé -- réessaie";
          btn.disabled = false;
          return;
        }
        fetch(window.location.origin + "/version.json?t=" + Date.now())
          .then((r) => r.json())
          .then((data) => {
            if (data.built_at > cliqueLe) {
              clearInterval(interval);
              btn.textContent = "Site mis à jour !";
              setTimeout(() => { btn.textContent = "Mettre à jour le site"; btn.disabled = false; }, 4000);
            }
          })
          .catch(() => {});
      }, INTERVALLE);
    }
  </script>

  <div id="modal-admin" onclick="if(event.target===this)fermerModalAdmin()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;align-items:center;justify-content:center;">
    <div style="background:#fff;border-radius:6px;padding:32px 36px;width:100%;max-width:340px;margin:16px;position:relative;box-shadow:0 8px 24px rgba(0,0,0,.15);">
      <button onclick="fermerModalAdmin()" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:#bbb;line-height:1;">×</button>
      <p style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#999;margin-bottom:20px;">Administration · Base IA</p>
      <div id="panel-login">
        <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;color:#888;margin-bottom:6px;">Clé d'accès</label>
        <input type="password" id="input-cle-admin" placeholder="••••••••" style="width:100%;padding:9px 12px;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;font-family:monospace;outline:none;margin-bottom:8px;box-sizing:border-box;" onkeydown="if(event.key==='Enter')connecterAdmin()"/>
        <div id="erreur-admin" style="display:none;color:#c0392b;font-size:13px;margin-bottom:8px;">Clé incorrecte.</div>
        <button onclick="connecterAdmin()" style="width:100%;padding:10px;background:#1a1712;color:#fff;border:none;border-radius:3px;font-size:14px;font-weight:500;cursor:pointer;">Accéder</button>
      </div>
      <div id="panel-admin" style="display:none">
        <p style="color:#27ae60;font-size:14px;margin-bottom:16px;">Mode admin actif.</p>
        <button onclick="deconnecterAdmin()" style="width:100%;padding:10px;background:none;border:1px solid #e0d9cc;border-radius:3px;font-size:14px;cursor:pointer;color:#c0392b;">Se déconnecter</button>
      </div>
    </div>
  </div>
  <script>
    function getAdminCookie() {
      return document.cookie.split(';').some(c => c.trim() === 'admin_duale=1');
    }
    function setAdminCookie() {
      document.cookie = 'admin_duale=1; domain=.duale.fr; path=/; max-age=86400; SameSite=Lax';
    }
    function deleteAdminCookie() {
      document.cookie = 'admin_duale=; domain=.duale.fr; path=/; max-age=0';
    }
    function initAdminMode() {
      if (getAdminCookie()) activerAdmin();
    }
    function activerAdmin() {
      document.querySelectorAll('.admin-zone').forEach(el => el.style.display = '');
    }
    function ouvrirModalAdmin() {
      const estAdmin = getAdminCookie();
      document.getElementById('panel-login').style.display = estAdmin ? 'none' : '';
      document.getElementById('panel-admin').style.display = estAdmin ? '' : 'none';
      document.getElementById('erreur-admin').style.display = 'none';
      if (!estAdmin) document.getElementById('input-cle-admin').value = '';
      document.getElementById('modal-admin').style.display = 'flex';
      if (!estAdmin) setTimeout(() => document.getElementById('input-cle-admin').focus(), 50);
    }
    function fermerModalAdmin() {
      document.getElementById('modal-admin').style.display = 'none';
    }
    async function connecterAdmin() {
      const val = document.getElementById('input-cle-admin').value.trim();
      const errEl = document.getElementById('erreur-admin');
      if (!val) { errEl.style.display = 'block'; return; }
      try {
        const r = await fetch('https://api.github.com/user', {
          headers: { Authorization: 'token ' + val }
        });
        if (r.ok) { validerAdmin(); return; }
      } catch(e) {}
      errEl.style.display = 'block';
    }
    function validerAdmin() {
      setAdminCookie();
      document.getElementById('panel-login').style.display = 'none';
      document.getElementById('panel-admin').style.display = '';
      activerAdmin();
    }
    function deconnecterAdmin() {
      deleteAdminCookie();
      document.querySelectorAll('.admin-zone').forEach(el => el.style.display = 'none');
      fermerModalAdmin();
    }
    initAdminMode();
  </script>
${COOKIE_BANNER}
</body>
</html>`;
}

// --- Programme principal ---

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
  <link rel="canonical" href="${url}"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${url}"/>
  <meta property="og:image" content="${OG_IMAGE}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="${OG_IMAGE_ALT}"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="${SITE_NAME}"/>
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
  <h1><a href="/">Base <em>IA</em></a></h1>
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

function genererPagesPositionnement(outils, llms) {
  const pages = [];

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
    title: "Quel LLM choisir en 2026 ? Comparatif Claude, ChatGPT, Gemini · Base IA",
    description: "Comparatif des meilleurs LLMs en 2026 : Claude, ChatGPT, Gemini, Perplexity, Microsoft Copilot. Avantages, limites et cas d'usage pour choisir le bon modèle.",
    h1: "Quel LLM choisir en 2026 ? Comparatif des modèles de langage",
    intro: "Les LLMs (Large Language Models) sont au coeur de la révolution IA. Claude, ChatGPT, Gemini, Perplexity et Microsoft Copilot ont chacun des forces distinctes selon l'usage : rédaction, code, recherche, automatisation. Ce comparatif vous aide à choisir le modèle adapté à votre contexte.",
    sections: sectionsLLMs + `
  <section class="section" style="margin-top:1.5rem;">
    <h2>Comment choisir entre ces LLMs ?</h2>
    <p>Le choix d'un LLM dépend de trois critères principaux : la qualité du raisonnement (Claude et GPT-4o excellent), l'accès à l'information en temps réel (Perplexity et Copilot), et le budget (tous proposent une version gratuite). Pour un usage professionnel intensif, tester plusieurs modèles sur vos cas réels reste la meilleure approche.</p>
  </section>`,
    outils, llms,
    schema: `{
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Comparatif LLMs 2026",
      "description": "Comparatif des meilleurs modèles de langage : Claude, ChatGPT, Gemini, Perplexity, Microsoft Copilot.",
      "url": "${BASE_URL}/comparatif-llm.html",
      "author": {"@type": "Person", "name": "Robin Dualé", "url": "https://cv-robin.duale.fr", "sameAs": "https://www.linkedin.com/in/robinduale"}
    }`,
  });

  // Page 2 : Automatiser avec l'IA
  const outilsAuto = outils.filter((o) => ["Automatisation", "IA", "No-Code"].includes(o.categorie) && o.description);
  const sectionsAuto = outilsAuto.map((o) => `
  <section class="section" style="margin-bottom:1rem;">
    <h2>Comment utiliser ${o.nom} pour automatiser ?</h2>
    <p style="color:var(--gris);font-size:0.9rem;margin-bottom:0.75rem;">${o.description || ""}</p>
    ${o.casUsage ? `<p><strong>Cas d'usage :</strong> ${o.casUsage.split("\n")[0]}</p>` : ""}
    <a href="${BASE_URL}/outils/${o.slug}.html" style="display:inline-block;margin-top:0.75rem;color:var(--bleu);font-size:0.9rem;">Fiche complète ${o.nom} →</a>
  </section>`).join("\n");

  pages.push({
    slug: "automatiser-avec-ia",
    title: "Automatiser ses processus avec l'IA : outils et méthodes · Base IA",
    description: "Guide des meilleurs outils pour automatiser ses processus métier avec l'IA : n8n, Make, Notion, Clay. Workflows concrets, cas d'usage et comparatif pour débutants et experts.",
    h1: "Comment automatiser ses processus métier avec des outils IA ?",
    intro: "L'automatisation des tâches répétitives est l'un des gains les plus immédiats de l'IA. Des outils comme n8n, Make ou Clay permettent de connecter des services, traiter des données et déclencher des actions sans écrire une ligne de code. Voici les outils clés et comment les utiliser.",
    sections: sectionsAuto + `
  <section class="section" style="margin-top:1.5rem;">
    <h2>Par où commencer pour automatiser avec l'IA ?</h2>
    <p>Commencez par identifier une tâche répétitive qui vous prend du temps : envoi d'emails, mise à jour de base de données, collecte d'informations. Choisissez ensuite l'outil adapté : Make pour les workflows visuels simples, n8n pour plus de flexibilité et d'hébergement autonome. Testez avec un workflow simple avant de passer à des automatisations complexes.</p>
  </section>`,
    outils, llms,
    schema: `{
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Automatiser avec l'IA",
      "description": "Guide des meilleurs outils pour automatiser ses processus avec l'IA.",
      "url": "${BASE_URL}/automatiser-avec-ia.html",
      "author": {"@type": "Person", "name": "Robin Dualé", "url": "https://cv-robin.duale.fr", "sameAs": "https://www.linkedin.com/in/robinduale"}
    }`,
  });

  // Page 3 : Outils No-Code
  const outilsNC = outils.filter((o) => ["No-Code", "Développement", "Hébergement"].includes(o.categorie) && o.description);
  const sectionsNC = outilsNC.map((o) => `
  <section class="section" style="margin-bottom:1rem;">
    <h2>${o.nom} : ${o.description ? o.description.split(".")[0] : o.categorie}</h2>
    <p style="color:var(--gris);font-size:0.9rem;margin-bottom:0.75rem;">${o.description || ""}</p>
    ${o.gratuite ? `<p><strong>Version gratuite :</strong> ${o.gratuite.split("\n")[0]}</p>` : ""}
    <a href="${BASE_URL}/outils/${o.slug}.html" style="display:inline-block;margin-top:0.75rem;color:var(--bleu);font-size:0.9rem;">Fiche complète ${o.nom} →</a>
  </section>`).join("\n");

  pages.push({
    slug: "outils-no-code",
    title: "Meilleurs outils No-Code en 2026 : créer sans coder · Base IA",
    description: "Sélection des meilleurs outils No-Code en 2026 : Notion, Lovable, GitHub Pages, Netlify. Créez des applications, sites et bases de données sans écrire de code.",
    h1: "Les meilleurs outils No-Code en 2026 pour créer sans coder",
    intro: "Le No-Code démocratise la création d'applications, de sites web et de bases de données. En 2026, des outils comme Notion, Lovable ou Webflow permettent de construire des produits fonctionnels sans compétence technique. Voici la sélection des meilleurs outils No-Code selon les cas d'usage.",
    sections: sectionsNC + `
  <section class="section" style="margin-top:1.5rem;">
    <h2>No-Code ou Low-Code : quelle différence ?</h2>
    <p>Le No-Code (sans code) s'adresse aux non-développeurs qui veulent créer sans apprendre à programmer. Le Low-Code permet d'accélérer le développement en ajoutant du code là où les interfaces visuelles atteignent leurs limites. Pour débuter, le No-Code suffit pour 80 % des besoins courants : bases de données, sites vitrines, formulaires, automatisations simples.</p>
  </section>`,
    outils, llms,
    schema: `{
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Outils No-Code 2026",
      "description": "Sélection des meilleurs outils No-Code pour créer sans coder.",
      "url": "${BASE_URL}/outils-no-code.html",
      "author": {"@type": "Person", "name": "Robin Dualé", "url": "https://cv-robin.duale.fr", "sameAs": "https://www.linkedin.com/in/robinduale"}
    }`,
  });

  return pages.map((p) => ({ slug: p.slug, html: genererPagePositionnement(p) }));
}

function genererLLMsTxt(outils, llms) {
  const lignesOutils = outils
    .filter((o) => o.description)
    .map((o) => `- [${o.nom}](${BASE_URL}/outils/${o.slug}.html) : ${o.description.substring(0, 120).trimEnd()}`)
    .join("\n");

  const lignesLLMs = llms
    .filter((l) => l.description)
    .map((l) => `- [${l.nom}](${BASE_URL}/llm/${l.slug}.html) : ${l.description.substring(0, 120).trimEnd()}`)
    .join("\n");

  const categories = [...new Set(outils.map((o) => o.categorie).filter(Boolean))].join(", ");

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
- [Comparatif LLMs 2026](${BASE_URL}/comparatif-llm.html) : Claude, ChatGPT, Gemini, Perplexity, Microsoft Copilot
- [Automatiser avec l'IA](${BASE_URL}/automatiser-avec-ia.html) : outils et méthodes pour automatiser ses processus
- [Outils No-Code 2026](${BASE_URL}/outils-no-code.html) : créer des applications et sites sans coder
- [Mentions légales](${BASE_URL}/mentions-legales.html) : éditeur, hébergeur GitHub Pages, RGPD
- [Sitemap](${BASE_URL}/sitemap.xml) : index complet de toutes les pages

## Informations techniques

Le site est généré statiquement depuis une base Notion via GitHub Actions et déployé sur GitHub Pages. Mis à jour automatiquement à chaque modification de la base de données.
`;
}

function genererMentionsLegales() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mentions légales · Base IA · Robin Dualé</title>
  <meta name="description" content="Mentions légales du site ia.duale.fr -- éditeur Robin Dualé, hébergeur GitHub Pages, propriété intellectuelle et données personnelles RGPD."/>
  <meta name="robots" content="noindex, follow"/>
  <link rel="canonical" href="${BASE_URL}/mentions-legales.html"/>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png"/>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"/>
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png"/>
  <link rel="apple-touch-icon" sizes="48x48" href="/assets/favicon-48.png"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/styles.css"/>
  ${GA_TAG}
</head>
<body>
<header>
  <h1><a href="/">Base <em>IA</em></a></h1>
  <a href="/" class="retour">&#8592; Retour a la base</a>
</header>

<main>
  <div class="page-simple">
    <div class="page-simple-eyebrow">Cadre legal</div>
    <h1 class="page-simple-h1">Mentions legales</h1>

    <div class="section">
      <h2>Editeur</h2>
      <p>Robin Duale<br/>
      Email : <a href="mailto:robin@duale.fr">robin@duale.fr</a><br/>
      Site : <a href="https://cv-robin.duale.fr" target="_blank" rel="noopener noreferrer">cv-robin.duale.fr</a></p>
    </div>

    <div class="section">
      <h2>Hebergement</h2>
      <p>GitHub Pages · GitHub, Inc.<br/>
      88 Colin P. Kelly Jr. St, San Francisco, CA 94107, Etats-Unis<br/>
      <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer">pages.github.com</a></p>
    </div>

    <div class="section">
      <h2>Propriete intellectuelle</h2>
      <p>La structure, la selection et l'organisation des contenus de ce site sont la propriete de Robin Duale. Les textes descriptifs sont principalement produits avec l'assistance d'outils d'IA. Toute reproduction de la structure ou de l'organisation sans autorisation est interdite.</p>
    </div>

    <div class="section">
      <h2>Donnees personnelles &amp; RGPD</h2>
      <p>Ce site utilise Google Analytics (GA4) pour mesurer l'audience de facon anonymisee. Ce service depose des cookies de mesure d'audience sur votre appareil. Les donnees collectees (pages visitees, duree, provenance) sont transmises a Google et soumises a leur politique de confidentialite. Vous pouvez vous y opposer en installant le module de desactivation Google Analytics disponible sur <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a>.</p>
      <p style="margin-top:10px;">Ce site n'utilise pas de cookies publicitaires ou de tracking commercial.</p>
      <p style="margin-top:10px;">Dans le cadre du formulaire de proposition d'outil, une adresse email est collectee uniquement pour confirmer la soumission et vous notifier de la decision. Elle n'est pas utilisee a des fins commerciales ni transmise a des tiers. Vous pouvez demander sa suppression a tout moment en ecrivant a <a href="mailto:robin@duale.fr">robin@duale.fr</a>.</p>
    </div>
  </div>
</main>
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

async function main() {
  try {
    creerDossier(DIST_DIR);
    creerDossier(path.join(DIST_DIR, "outils"));
    creerDossier(path.join(DIST_DIR, "llm"));

    fs.copyFileSync(path.join(__dirname, "..", "CNAME"), path.join(DIST_DIR, "CNAME"));

    // Copier les fichiers statiques SEO
    fs.copyFileSync(path.join(__dirname, "..", "src", "robots.txt"), path.join(DIST_DIR, "robots.txt"));
    fs.copyFileSync(path.join(__dirname, "..", "src", "BingSiteAuth.xml"), path.join(DIST_DIR, "BingSiteAuth.xml"));
    fs.copyFileSync(path.join(__dirname, "..", "src", "fff05dc2d2973f558bcd5cf3cb8ceee8.txt"), path.join(DIST_DIR, "fff05dc2d2973f558bcd5cf3cb8ceee8.txt"));

    // Générer l'image OG (fond #0f172a = RGB 15, 23, 42)
    creerDossier(path.join(DIST_DIR, "assets"));
    fs.writeFileSync(path.join(DIST_DIR, "assets", "og-default.png"), genererPNGSolide(1200, 630, 15, 23, 42));

    // Copier les favicons
    for (const f of ["favicon.ico", "favicon-16.png", "favicon-32.png", "favicon-48.png", "favicon.svg"]) {
      const src = path.join(__dirname, "..", "src", "assets", f);
      const dst = f === "favicon.ico" ? path.join(DIST_DIR, f) : path.join(DIST_DIR, "assets", f);
      if (fs.existsSync(src)) fs.copyFileSync(src, dst);
    }

    const tous = await recupererItems();
    const outils = tous.filter((i) => i.type !== "LLM");
    const llms = tous.filter((i) => i.type === "LLM");

    console.log(`${outils.length} outil(s), ${llms.length} LLM(s).`);

    const css = fs.readFileSync(path.join(__dirname, "..", "src", "styles.css"), "utf8");
    fs.writeFileSync(path.join(DIST_DIR, "styles.css"), css);

    fs.writeFileSync(
      path.join(DIST_DIR, "version.json"),
      JSON.stringify({ built_at: new Date().toISOString() })
    );

    fs.writeFileSync(path.join(DIST_DIR, "index.html"), genererPageAccueil(outils, llms));
    fs.writeFileSync(path.join(DIST_DIR, "mentions-legales.html"), genererMentionsLegales());
    fs.writeFileSync(path.join(DIST_DIR, "confirmation.html"), genererPageConfirmation());
    fs.writeFileSync(path.join(DIST_DIR, "admin-propositions.html"), genererAdminPropositions());
    fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), genererSitemap(outils, llms));
    fs.writeFileSync(path.join(DIST_DIR, "llms.txt"), genererLLMsTxt(outils, llms));

    const pagesPositionnement = genererPagesPositionnement(outils, llms);
    for (const page of pagesPositionnement) {
      fs.writeFileSync(path.join(DIST_DIR, `${page.slug}.html`), page.html);
    }
    console.log(`Page d'accueil, mentions légales, sitemap, llms.txt et ${pagesPositionnement.length} pages de positionnement générés.`);

    for (const outil of outils) {
      fs.writeFileSync(
        path.join(DIST_DIR, "outils", `${outil.slug}.html`),
        genererPageDetail(outil, outils, "outils")
      );
    }
    console.log(`${outils.length} pages outils générées.`);

    for (const llm of llms) {
      fs.writeFileSync(
        path.join(DIST_DIR, "llm", `${llm.slug}.html`),
        genererPageDetail(llm, llms, "llm")
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
