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
  const categories = [...new Set(outils.map((o) => o.categorie).filter(Boolean))].sort();

  const filtres = categories
    .map((c) => `<button class="filtre" data-categorie="${c}">${c}</button>`)
    .join("\n        ");

  const cartesOutils = outils
    .map(
      (o) => `
      <a class="carte" href="outils/${o.slug}.html" data-categorie="${o.categorie}" data-notion-id="${o.id}">
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
      <a class="carte" href="llm/${l.slug}.html" data-categorie="${l.categorie}">
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
      <div class="filtres">
        <button class="filtre actif" data-categorie="tous">Tous</button>
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
      <div class="grille">
        ${cartesLLMs}
      </div>
    </div>
  </main>

  <footer>
    <p>Données issues de Notion -- Mis à jour automatiquement</p>
    <button class="btn-refresh" onclick="rafraichirSite(this)">Mettre à jour le site</button>
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
    let sortable = null;
    let ordreInitial = null;

    function toggleReorganisation() {
      const grille = document.getElementById("grille");
      const btnR = document.getElementById("btnReorganiser");
      const btnS = document.getElementById("btnSauvegarder");
      const btnA = document.getElementById("btnAnnuler");
      ordreInitial = Array.from(grille.children).map(c => c.dataset.notionId);
      grille.classList.add("mode-reorganisation");
      btnR.style.display = "none";
      btnS.style.display = "";
      btnA.style.display = "";
      sortable = new Sortable(grille, { animation: 150, ghostClass: "carte-ghost", onEnd: () => {} });
    }

    function annulerReorganisation() {
      desactiverReorganisation();
      const grille = document.getElementById("grille");
      ordreInitial.forEach(id => {
        const carte = grille.querySelector('[data-notion-id="' + id + '"]');
        if (carte) grille.appendChild(carte);
      });
    }

    function desactiverReorganisation() {
      const grille = document.getElementById("grille");
      const btnR = document.getElementById("btnReorganiser");
      const btnS = document.getElementById("btnSauvegarder");
      const btnA = document.getElementById("btnAnnuler");
      grille.classList.remove("mode-reorganisation");
      btnR.style.display = "";
      btnS.style.display = "none";
      btnA.style.display = "none";
      if (sortable) { sortable.destroy(); sortable = null; }
    }

    function sauvegarderOrdre(btn) {
      const grille = document.getElementById("grille");
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
          desactiverReorganisation();
          document.getElementById("btnReorganiser").disabled = true;
          attendreMiseAJour(document.getElementById("btnReorganiser"), new Date().toISOString());
        })
        .catch(() => { btn.textContent = "Erreur -- réessaie"; btn.disabled = false; });
    }
  </script>

  <script>
    const filtres = document.querySelectorAll(".filtre");
    const cartes = document.querySelectorAll("#section-outils .carte");
    filtres.forEach((btn) => {
      btn.addEventListener("click", () => {
        const categorie = btn.dataset.categorie;
        filtres.forEach((b) => b.classList.remove("actif"));
        btn.classList.add("actif");
        cartes.forEach((carte) => {
          carte.style.display = (categorie === "tous" || carte.dataset.categorie === categorie) ? "" : "none";
        });
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
      ${item.tags ? `<section class="section"><h2>Tags</h2><p>${item.tags}</p></section>` : ""}
      ${item.lienOfficiel ? `
    <section class="section section-lien">
      <h2>Lien officiel</h2>
      <a class="lien-officiel-section" href="${item.lienOfficiel}" target="_blank" rel="noopener noreferrer">${item.lienOfficiel} →</a>
    </section>` : ""}
    </main>
  </div>

  <footer>
    <p>Données issues de Notion -- Mis à jour automatiquement</p>
    <button class="btn-refresh" onclick="rafraichirSite(this)">Mettre à jour le site</button>
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
    console.log("Page d'accueil générée.");

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
