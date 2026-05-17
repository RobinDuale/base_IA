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
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntry(`${BASE_URL}/`, "weekly", "1.0")}
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

  const cartesOutils = outils
    .map(
      (o) => `
      <a class="carte" href="outils/${o.slug}.html" data-categorie="${o.categorie}" data-tags="${o.tags || ""}" data-notion-id="${o.id}">
        <div class="carte-header">
          <h2 class="carte-nom">${o.nom}</h2>
          <div class="carte-badges">
            ${badgeCategorie(o.categorie)}
            ${badgeNiveau(o.niveau)}
          </div>
        </div>
        ${o.description ? `<p class="carte-description">${o.description}</p>` : ""}
      </a>`
    )
    .join("\n");

  const cartesLLMs = llms
    .map(
      (l) => `
      <a class="carte" href="llm/${l.slug}.html" data-categorie="${l.categorie}" data-tags="${l.tags || ""}" data-notion-id="${l.id}">
        <div class="carte-header">
          <h2 class="carte-nom">${l.nom}</h2>
          <div class="carte-badges">
            <span class="badge" style="background:#8b5cf6">LLM</span>
            ${badgeNiveau(l.niveau)}
          </div>
        </div>
        ${l.description ? `<p class="carte-description">${l.description}</p>` : ""}
      </a>`
    )
    .join("\n");

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
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Base IA",
    "description": "${DESC_HOME}",
    "url": "${BASE_URL}/",
    "inLanguage": "fr",
    "author": {
      "@type": "Person",
      "name": "Robin Dualé",
      "url": "https://cv-robin.duale.fr",
      "sameAs": "https://www.linkedin.com/in/robinduale"
    }
  }
  </script>
  <link rel="stylesheet" href="styles.css"/>
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
</head>
<body>
  <header>
    <h1>Base IA</h1>
    <p class="sous-titre">Mes outils IA, No Code et LLMs</p>
  </header>

  <main>
    <div class="onglets">
      <button class="onglet actif" onclick="afficherOnglet(this, 'outils')">Outils</button>
      <button class="onglet" onclick="afficherOnglet(this, 'llms')">LLMs</button>
    </div>

    <div id="section-outils">
      <div class="barre-recherche">
        <input type="search" id="recherche-outils" class="champ-recherche" placeholder="Rechercher un outil..." oninput="filtrerOutils()" autocomplete="off"/>
      </div>

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
      <div class="barre-recherche">
        <input type="search" id="recherche-llms" class="champ-recherche" placeholder="Rechercher un LLM..." oninput="filtrerLLMs()" autocomplete="off"/>
      </div>

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
        <span class="footer-sub">Données issues de Notion</span>
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
    function afficherOnglet(btn, nom) {
      document.querySelectorAll('.onglet').forEach(b => b.classList.remove('actif'));
      btn.classList.add('actif');
      document.getElementById('section-outils').style.display = nom === 'outils' ? '' : 'none';
      document.getElementById('section-llms').style.display = nom === 'llms' ? '' : 'none';
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
      const query = document.getElementById("recherche-outils").value.toLowerCase().trim();
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
      const query = document.getElementById("recherche-llms").value.toLowerCase().trim();
      document.querySelectorAll("#section-llms .carte").forEach((carte) => {
        const nom = (carte.querySelector(".carte-nom")?.textContent || "").toLowerCase();
        const desc = (carte.querySelector(".carte-description")?.textContent || "").toLowerCase();
        const match = !query || nom.includes(query) || desc.includes(query);
        carte.style.display = match ? "" : "none";
      });
    }

    document.querySelectorAll(".filtre").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filtre").forEach((b) => b.classList.remove("actif"));
        btn.classList.add("actif");
        filtrerOutils();
      });
      btn.addEventListener("mouseenter", () => {
        if (!btn.classList.contains("actif")) {
          btn.style.borderColor = btn.style.getPropertyValue("--filtre-couleur") || "";
          btn.style.color = btn.style.getPropertyValue("--filtre-couleur") || "";
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
</body>
</html>`;
}

// Page détail (commune Outils et LLMs)
function genererPageDetail(item, liste, prefixe) {
  function section(titre, contenu) {
    if (!contenu) return "";
    return `
    <section class="section">
      <h2>${titre}</h2>
      <p>${contenu.replace(/\n/g, "<br/>")}</p>
    </section>`;
  }

  const liensBarreLaterale = liste
    .map((o) => `<a href="${o.slug}.html" class="${o.slug === item.slug ? "actif" : ""}">${o.nom}</a>`)
    .join("\n        ");

  const titrePage = item.type === "LLM" ? `${item.nom} -- LLM` : item.nom;
  const badgeType = item.type === "LLM"
    ? `<span class="badge" style="background:#8b5cf6">LLM</span>`
    : badgeCategorie(item.categorie);

  const hasScenarios = item.scenarioSimple || item.scenarioIntermediaire || item.scenarioAvance;

  const barreScenariosHtml = hasScenarios ? `
    <aside class="barre-scenarios">
      <p class="barre-scenarios-titre">Scénarios d'usage</p>
      ${item.scenarioSimple ? `
      <div class="scenario">
        <h3 class="scenario-niveau scenario-simple">Débutant</h3>
        <p class="scenario-texte">${item.scenarioSimple}</p>
      </div>` : ""}
      ${item.scenarioIntermediaire ? `
      <div class="scenario">
        <h3 class="scenario-niveau scenario-intermediaire">Intermédiaire</h3>
        <p class="scenario-texte">${item.scenarioIntermediaire}</p>
      </div>` : ""}
      ${item.scenarioAvance ? `
      <div class="scenario">
        <h3 class="scenario-niveau scenario-avance">Avancé</h3>
        <p class="scenario-texte">${item.scenarioAvance}</p>
      </div>` : ""}
    </aside>` : "";

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
      "author": {
        "@type": "Person",
        "name": "Robin Dualé",
        "url": "https://cv-robin.duale.fr",
        "sameAs": "https://www.linkedin.com/in/robinduale"
      }
    }
  ]
  </script>
  <link rel="stylesheet" href="../styles.css"/>
</head>
<body>
  <header>
    <a class="retour" href="../index.html">← Base IA</a>
    <h1>${item.nom}</h1>
    <div class="badges">
      ${badgeType}
      ${badgeNiveau(item.niveau)}
    </div>
    ${item.lienOfficiel ? `<a class="lien-officiel" href="${item.lienOfficiel}" target="_blank" rel="noopener noreferrer">Site officiel →</a>` : ""}
  </header>

  <div class="mise-en-page">
    <nav class="barre-laterale">
      <p class="barre-laterale-titre">${item.type === "LLM" ? "Tous les LLMs" : "Tous les outils"}</p>
      ${liensBarreLaterale}
    </nav>

    <main class="fiche">
      ${item.tags ? `<div class="tags-fiche"><span class="tags-label"># tags</span>${item.tags.split(",").map(badgeTag).join("")}</div>` : ""}
      ${section("Description", item.description)}
      ${section("Rôle dans l'écosystème", item.roleEcosysteme)}
      ${section("Quand utiliser cet outil", item.quandUtiliser)}
      ${section("Gratuité", item.gratuite)}
      ${section("Avantages", item.avantages)}
      ${section("Limites", item.limites)}
      ${section("Cas d'usage", item.casUsage)}
      ${section("Cas d'usage pour moi", item.casUsagePourMoi)}
      ${section("Exemples & Workflows", item.exemplesWorkflows)}
      ${section("Complémentaire avec", item.complementaireAvec)}
      ${section("Modèle économique", item.modeleEconomique)}
      ${section("Quand payer ?", item.quandPayer)}
      ${section("Alternatives", item.alternatives)}
      ${section("Notes personnelles", item.notePersonnelles)}
      ${item.lienOfficiel ? `
    <section class="section section-lien">
      <h2>Lien officiel</h2>
      <a class="lien-officiel-section" href="${item.lienOfficiel}" target="_blank" rel="noopener noreferrer">${item.lienOfficiel} →</a>
    </section>` : ""}
    </main>

    ${barreScenariosHtml}
  </div>

  <footer>
    <div class="footer-contenu">
      <div class="footer-gauche">
        <span class="footer-copy">© 2026 Robin Dualé · <a href="https://duale.fr" target="_blank" rel="noopener noreferrer">duale.fr</a></span>
        <span class="footer-sub">Données issues de Notion</span>
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
</body>
</html>`;
}

// --- Programme principal ---

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
  <link rel="stylesheet" href="/styles.css"/>
</head>
<body>
<header>
  <h1>Base IA</h1>
  <p class="sous-titre">Outils IA &amp; No-Code · Robin Dualé</p>
</header>
<main>
  <a href="/" class="retour">← Retour</a>
  <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:1.5rem;">Mentions légales</h2>

  <div class="section" style="margin-bottom:1rem;">
    <h2>Éditeur</h2>
    <p>Robin Dualé<br/>
    Email : <a href="mailto:robin@duale.fr" style="color:var(--bleu);">robin@duale.fr</a><br/>
    Site : <a href="https://cv-robin.duale.fr" target="_blank" rel="noopener noreferrer" style="color:var(--bleu);">cv-robin.duale.fr</a></p>
  </div>

  <div class="section" style="margin-bottom:1rem;">
    <h2>Hébergement</h2>
    <p>GitHub Pages · GitHub, Inc. · 88 Colin P. Kelly Jr. St, San Francisco, CA 94107, États-Unis<br/>
    <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer" style="color:var(--bleu);">pages.github.com</a></p>
  </div>

  <div class="section" style="margin-bottom:1rem;">
    <h2>Propriété intellectuelle</h2>
    <p>La structure, la sélection et l'organisation des contenus de ce site sont la propriété de Robin Dualé. Les textes descriptifs sont principalement produits avec l'assistance d'outils d'IA. Toute reproduction de la structure ou de l'organisation sans autorisation est interdite.</p>
  </div>

  <div class="section" style="margin-bottom:1rem;">
    <h2>Données personnelles &amp; RGPD</h2>
    <p>Ce site ne collecte aucune donnée personnelle, ne dépose aucun cookie et n'utilise aucun outil d'analyse d'audience. Aucune information vous concernant n'est transmise à des tiers.</p>
  </div>
</main>
<footer>
  <div class="footer-contenu">
    <div class="footer-gauche">
      <span class="footer-copy">© 2026 Robin Dualé · <a href="https://duale.fr" target="_blank" rel="noopener noreferrer">duale.fr</a></span>
      <span class="footer-sub">Données issues de Notion</span>
    </div>
    <div class="footer-liens">
      <a href="https://www.linkedin.com/in/robinduale" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="https://cv-robin.duale.fr" target="_blank" rel="noopener noreferrer">cv-robin.duale.fr</a>
      <a href="/mentions-legales.html">Mentions légales</a>
    </div>
  </div>
</footer>
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
    fs.copyFileSync(path.join(__dirname, "..", "src", "llms.txt"), path.join(DIST_DIR, "llms.txt"));

    // Générer l'image OG (fond #0f172a = RGB 15, 23, 42)
    creerDossier(path.join(DIST_DIR, "assets"));
    fs.writeFileSync(path.join(DIST_DIR, "assets", "og-default.png"), genererPNGSolide(1200, 630, 15, 23, 42));

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
    fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), genererSitemap(outils, llms));
    console.log("Page d'accueil, mentions légales et sitemap générés.");

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
