// build.js -- Script principal
// Ce script lit les outils depuis Notion et génère les pages HTML du site.
// Il est exécuté par GitHub Actions à chaque mise à jour de Notion.

const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");

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

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Base IA -- Outils IA, No Code et LLMs</title>
  <meta name="description" content="Ma base personnelle d'outils IA, No Code et LLMs : fiches détaillées, cas d'usage, avantages et limites."/>
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
        <button class="btn-reorganiser" id="btnReorganiser" onclick="toggleReorganisation()">Réorganiser</button>
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
        <button class="btn-reorganiser" id="btnReorganiserLLM" onclick="toggleReorg('grille-llms', 'btnReorganiserLLM', 'btnSauvegarderLLM', 'btnAnnulerLLM')">Réorganiser</button>
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
      <button class="btn-refresh" onclick="rafraichirSite(this)">Mettre à jour le site</button>
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

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${titrePage} -- Base IA</title>
  <meta name="description" content="${item.description || item.nom + " -- fiche"}"/>
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
      <button class="btn-refresh" onclick="rafraichirSite(this)">Mettre à jour le site</button>
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
  <title>Mentions légales · Base IA</title>
  <meta name="description" content="Mentions légales du site ia.duale.fr — éditeur, hébergeur, propriété intellectuelle, données personnelles."/>
  <meta name="robots" content="noindex, follow"/>
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
    <p>Le contenu de ce site (textes, structure, code) est la propriété de Robin Dualé. Les données affichées sont issues d'une base Notion personnelle. Toute reproduction sans autorisation est interdite.</p>
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
    console.log("Page d'accueil + mentions légales générées.");

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
