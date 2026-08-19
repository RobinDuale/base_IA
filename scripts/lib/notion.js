// notion.js -- Récupération des données depuis Notion

const { Client } = require("@notionhq/client");
const { slugifier, extraireTexte, echapperHtml } = require("./utils");

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = "b6a3c72949e546f89c6dfc990689298e";

if (!NOTION_API_KEY) {
  console.error("Erreur : la variable NOTION_API_KEY est manquante.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

async function recupererItems() {
  console.log("Lecture des items depuis Notion...");
  const items = [];
  let curseur = undefined;

  do {
    // Filtre : uniquement les items qui ont une description (évite les pages vides)
    // Les pages sans description génèrent du "thin content" que Google refuse d'indexer
    const reponse = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      start_cursor: curseur,
      filter: {
        property: "Description simple",
        rich_text: { is_not_empty: true },
      },
    });

    for (const page of reponse.results) {
      const p = page.properties;
      // Les valeurs brutes servent aux sorties qui ne sont pas du HTML (Markdown,
      // llms.txt) et au JSON-LD, qui porte son propre echappement.
      const brut = {
        nom: extraireTexte(p["Nom"]),
        type: extraireTexte(p["Type"]),
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
      };

      // Tout ce que les generateurs HTML interpolent passe par cet echappement, une
      // fois pour toutes. C'est le point de passage unique choisi le 2026-08-19 :
      // aucun module de rendu n'a donc a se souvenir d'echapper.
      const echappe = {};
      for (const [cle, valeur] of Object.entries(brut)) {
        echappe[cle] = typeof valeur === "string" ? echapperHtml(valeur) : valeur;
      }

      items.push({
        id: page.id,
        // created_time / last_edited_time : dates réelles Notion (format ISO UTC)
        // Utilisées pour datePublished et dateModified dans Schema.org
        dateCreation:     page.created_time,
        dateModification: page.last_edited_time,
        slug: slugifier(brut.nom),
        ...echappe,
        brut,
      });
    }

    curseur = reponse.has_more ? reponse.next_cursor : undefined;
  } while (curseur);

  console.log(`${items.length} item(s) récupéré(s).`);
  return items;
}

module.exports = { recupererItems };
