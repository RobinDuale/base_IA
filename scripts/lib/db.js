// db.js -- Accès aux données depuis Postgres (remplace notion.js pour le site dynamique)
// Reproduit exactement la forme des objets que recupererItems() (notion.js) retournait,
// pour que scripts/lib/accueil.js, detail.js, hubs.js, etc. n'aient rien à changer.

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function ligneVersItem(row) {
  return {
    id: row.id,
    dateCreation: row.date_creation.toISOString(),
    dateModification: row.date_modification.toISOString(),
    slug: row.slug,
    nom: row.nom,
    type: row.type || "",
    categorie: row.categorie || "",
    niveau: row.niveau || "",
    priorite: row.priorite || "",
    statut: row.statut || "",
    description: row.description || "",
    avantages: row.avantages || "",
    limites: row.limites || "",
    casUsage: row.cas_usage || "",
    casUsagePourMoi: row.cas_usage_pour_moi || "",
    alternatives: row.alternatives || "",
    modeleEconomique: row.modele_economique || "",
    quandPayer: row.quand_payer || "",
    lienOfficiel: row.lien_officiel || "",
    notePersonnelles: row.notes_personnelles || "",
    tags: row.tags || "",
    complementaireAvec: row.complementaire_avec || "",
    exemplesWorkflows: row.exemples_workflows || "",
    quandUtiliser: row.quand_utiliser || "",
    roleEcosysteme: row.role_ecosysteme || "",
    gratuite: row.gratuite || "",
    scenarioSimple: row.scenario_simple || "",
    scenarioIntermediaire: row.scenario_intermediaire || "",
    scenarioAvance: row.scenario_avance || "",
  };
}

// Récupère tous les outils/LLMs -- même filtre que Notion (description non vide, évite le thin content)
async function recupererItems() {
  const { rows } = await pool.query(
    `SELECT * FROM outils WHERE description IS NOT NULL AND description != '' ORDER BY nom`
  );
  return rows.map(ligneVersItem);
}

// Un seul item par slug (pages détail) -- utilisé pour vérifier qu'un slug existe encore avant de servir la page
async function recupererItemParSlug(slug) {
  const { rows } = await pool.query(`SELECT * FROM outils WHERE slug = $1`, [slug]);
  return rows.length ? ligneVersItem(rows[0]) : null;
}

const COLONNES = [
  "id", "slug", "date_creation", "date_modification", "nom", "type", "categorie",
  "niveau", "priorite", "statut", "description", "avantages", "limites",
  "cas_usage", "cas_usage_pour_moi", "alternatives", "modele_economique",
  "quand_payer", "lien_officiel", "notes_personnelles", "tags",
  "complementaire_avec", "exemples_workflows", "quand_utiliser",
  "role_ecosysteme", "gratuite", "scenario_simple", "scenario_intermediaire",
  "scenario_avance",
];

function itemVersLigne(item) {
  return [
    item.id, item.slug, item.dateCreation, item.dateModification, item.nom,
    item.type, item.categorie, item.niveau, item.priorite, item.statut,
    item.description, item.avantages, item.limites, item.casUsage,
    item.casUsagePourMoi, item.alternatives, item.modeleEconomique,
    item.quandPayer, item.lienOfficiel, item.notePersonnelles, item.tags,
    item.complementaireAvec, item.exemplesWorkflows, item.quandUtiliser,
    item.roleEcosysteme, item.gratuite, item.scenarioSimple,
    item.scenarioIntermediaire, item.scenarioAvance,
  ];
}

// Remplace le contenu de la table outils par les items Notion fournis (upsert + suppression des items disparus)
async function remplacerItems(items) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const idsActuels = items.map((i) => i.id);
    await client.query(
      `DELETE FROM outils WHERE id != ALL($1::text[])`,
      [idsActuels.length ? idsActuels : ["__aucun__"]]
    );

    const placeholders = COLONNES.map((_, i) => `$${i + 1}`).join(", ");
    const misesAJour = COLONNES.filter((c) => c !== "id")
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(", ");
    const requete = `
      INSERT INTO outils (${COLONNES.join(", ")})
      VALUES (${placeholders})
      ON CONFLICT (id) DO UPDATE SET ${misesAJour}
    `;
    for (const item of items) {
      await client.query(requete, itemVersLigne(item));
    }

    await client.query("COMMIT");
  } catch (erreur) {
    await client.query("ROLLBACK");
    throw erreur;
  } finally {
    client.release();
  }
}

module.exports = { pool, recupererItems, recupererItemParSlug, remplacerItems };
