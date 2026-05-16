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

// Vérification que la clé API est bien disponible
if (!NOTION_API_KEY) {
  console.error("Erreur : la variable NOTION_API_KEY est manquante.");
  process.exit(1);
}

// Connexion à Notion
const notion = new Client({ auth: NOTION_API_KEY });

// --- Fonctions utilitaires ---

// Crée un dossier s'il n'existe pas
function creerDossier(chemin) {
  if (!fs.existsSync(chemin)) {
    fs.mkdirSync(chemin, { recursive: true });
  }
}

// Transforme un nom d'outil en slug pour l'URL (ex: "Claude AI" -> "claude-ai")
function slugifier(texte) {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Extrait le texte d'une propriété Notion (gère les différents types)
function extraireTexte(propriete) {
  if (!propriete) return "";
  if (propriete.type === "title") {
    return propriete.title.map((t) => t.plain_text).join("");
  }
  if (propriete.type === "rich_text") {
    return propriete.rich_text.map((t) => t.plain_text).join("");
  }
  if (propriete.type === "select") {
    return propriete.select ? propriete.select.name : "";
  }
  if (propriete.type === "multi_select") {
    return propriete.multi_select.map((t) => t.name).join(", ");
  }
  if (propriete.type === "url") {
    return propriete.url || "";
  }
  if (propriete.type === "status") {
    return propriete.status ? propriete.status.name : "";
  }
  return "";
}

// --- Récupération des données Notion ---

async function recupererOutils() {
  console.log("Lecture des outils depuis Notion...");
  const outils = [];
  let curseur = undefined;

  // Notion renvoie les résultats par pages de 100 -- on boucle jusqu'à tout avoir
  do {
    const reponse = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      start_cursor: curseur,
      sorts: [{ property: "Nom", direction: "ascending" }],
    });

    for (const page of reponse.results) {
      const p = page.properties;
      outils.push({
        id: page.id,
        slug: slugifier(extraireTexte(p["Nom"])),
        nom: extraireTexte(p["Nom"]),
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
      });
    }

    curseur = reponse.has_more ? reponse.next_cursor : undefined;
  } while (curseur);

  console.log(`${outils.length} outil(s) récupéré(s).`);
  return outils;
}

// --- Génération du HTML ---

// Badge coloré selon la catégorie
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

// Page d'accueil : liste de tous les outils
function genererPageAccueil(outils) {
  const categories = [...new Set(outils.map((o) => o.categorie).filter(Boolean))].sort();

  const filtres = categories
    .map((c) => `<button class="filtre" data-categorie="${c}">${c}</button>`)
    .join("\n        ");

  const cartes = outils
    .map(
      (o) => `
      <a class="carte" href="outils/${o.slug}.html" data-categorie="${o.categorie}">
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

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Base IA -- Outils IA et No Code</title>
  <meta name="description" content="Ma base personnelle d'outils IA et No Code : fiches détaillées, cas d'usage, avantages et limites."/>
  <link rel="stylesheet" href="styles.css"/>
</head>
<body>
  <header>
    <h1>Base IA</h1>
    <p class="sous-titre">Mes outils IA et No Code</p>
  </header>

  <main>
    <div class="filtres">
      <button class="filtre actif" data-categorie="tous">Tous</button>
      ${filtres}
    </div>

    <div class="grille" id="grille">
      ${cartes}
    </div>
  </main>

  <footer>
    <p>Données issues de Notion -- Mis à jour automatiquement</p>
  </footer>

  <script>
    // Filtrage par catégorie au clic sur un bouton
    const filtres = document.querySelectorAll(".filtre");
    const cartes = document.querySelectorAll(".carte");

    filtres.forEach((btn) => {
      btn.addEventListener("click", () => {
        const categorie = btn.dataset.categorie;

        filtres.forEach((b) => b.classList.remove("actif"));
        btn.classList.add("actif");

        cartes.forEach((carte) => {
          if (categorie === "tous" || carte.dataset.categorie === categorie) {
            carte.style.display = "";
          } else {
            carte.style.display = "none";
          }
        });
      });
    });
  </script>
</body>
</html>`;
}

// Page détail d'un outil
function genererPageOutil(outil, outils) {
  function section(titre, contenu) {
    if (!contenu) return "";
    return `
    <section class="section">
      <h2>${titre}</h2>
      <p>${contenu.replace(/\n/g, "<br/>")}</p>
    </section>`;
  }

  const liensBarreLaterale = outils
    .map(
      (o) =>
        `<a href="${o.slug}.html" class="${o.slug === outil.slug ? "actif" : ""}">${o.nom}</a>`
    )
    .join("\n        ");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${outil.nom} -- Base IA</title>
  <meta name="description" content="${outil.description || outil.nom + " -- fiche outil"}"/>
  <link rel="stylesheet" href="../styles.css"/>
</head>
<body>
  <header>
    <a class="retour" href="../index.html">← Base IA</a>
    <h1>${outil.nom}</h1>
    <div class="badges">
      ${badgeCategorie(outil.categorie)}
      ${badgeNiveau(outil.niveau)}
    </div>
    ${outil.lienOfficiel ? `<a class="lien-officiel" href="${outil.lienOfficiel}" target="_blank" rel="noopener noreferrer">Site officiel →</a>` : ""}
  </header>

  <div class="mise-en-page">
    <nav class="barre-laterale">
      <p class="barre-laterale-titre">Tous les outils</p>
      ${liensBarreLaterale}
    </nav>

    <main class="fiche">
      ${section("Description", outil.description)}
      ${section("Avantages", outil.avantages)}
      ${section("Limites", outil.limites)}
      ${section("Cas d'usage", outil.casUsage)}
      ${section("Cas d'usage pour moi", outil.casUsagePourMoi)}
      ${section("Modele économique", outil.modeleEconomique)}
      ${section("Quand payer ?", outil.quandPayer)}
      ${section("Alternatives", outil.alternatives)}
      ${section("Notes personnelles", outil.notePersonnelles)}
      ${outil.tags ? `<section class="section"><h2>Tags</h2><p>${outil.tags}</p></section>` : ""}
    </main>
  </div>

  <footer>
    <p>Données issues de Notion -- Mis à jour automatiquement</p>
  </footer>
</body>
</html>`;
}

// --- Programme principal ---

async function main() {
  try {
    // 1. Préparer le dossier de sortie
    creerDossier(DIST_DIR);
    creerDossier(path.join(DIST_DIR, "outils"));

    // 2. Copier le fichier CNAME (nécessaire pour le domaine personnalisé)
    fs.copyFileSync(
      path.join(__dirname, "..", "CNAME"),
      path.join(DIST_DIR, "CNAME")
    );

    // 3. Récupérer les outils depuis Notion
    const outils = await recupererOutils();

    // 4. Générer le CSS
    const css = fs.readFileSync(path.join(__dirname, "..", "src", "styles.css"), "utf8");
    fs.writeFileSync(path.join(DIST_DIR, "styles.css"), css);

    // 5. Générer la page d'accueil
    fs.writeFileSync(path.join(DIST_DIR, "index.html"), genererPageAccueil(outils));
    console.log("Page d'accueil générée.");

    // 6. Générer une page par outil
    for (const outil of outils) {
      fs.writeFileSync(
        path.join(DIST_DIR, "outils", `${outil.slug}.html`),
        genererPageOutil(outil, outils)
      );
    }
    console.log(`${outils.length} pages outils générées.`);

    console.log("Build terminé. Fichiers dans dist/");
  } catch (erreur) {
    console.error("Erreur lors du build :", erreur.message);
    process.exit(1);
  }
}

main();
