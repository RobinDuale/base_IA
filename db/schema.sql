-- schema.sql -- Schéma Postgres pour Base_IA
-- Miroir des propriétés Notion (bases "Outils" et "Propositions").
-- Notion reste la source d'édition ; Postgres devient la source lue par le site.

CREATE TABLE IF NOT EXISTS outils (
    id                    TEXT PRIMARY KEY,       -- id de la page Notion
    slug                  TEXT NOT NULL,           -- pas unique : deux fiches Notion peuvent partager un même nom (cas existant, ex. doublons non nettoyés) -- même comportement que le site statique (dernier écrit gagne)
    date_creation         TIMESTAMPTZ NOT NULL,
    date_modification     TIMESTAMPTZ NOT NULL,

    nom                   TEXT NOT NULL,
    type                  TEXT,                   -- 'Outil' ou 'LLM'
    categorie             TEXT,                   -- LLMs, Productivité, No-Code, Créativité
    niveau                TEXT,                   -- Débutant, Intermédiaire, Avancé
    priorite              TEXT,                   -- Haute, Moyenne, Basse
    statut                TEXT,                   -- Pas commencé, En cours, Terminé

    description           TEXT,
    avantages             TEXT,
    limites               TEXT,
    cas_usage             TEXT,
    cas_usage_pour_moi    TEXT,
    alternatives          TEXT,
    modele_economique     TEXT,
    quand_payer           TEXT,
    lien_officiel         TEXT,
    notes_personnelles    TEXT,
    tags                  TEXT,                   -- liste séparée par virgules (comme extraireTexte multi_select)
    complementaire_avec   TEXT,
    exemples_workflows    TEXT,
    quand_utiliser        TEXT,
    role_ecosysteme       TEXT,
    gratuite              TEXT,
    scenario_simple       TEXT,
    scenario_intermediaire TEXT,
    scenario_avance       TEXT
);

CREATE INDEX IF NOT EXISTS idx_outils_categorie ON outils (categorie);
CREATE INDEX IF NOT EXISTS idx_outils_type      ON outils (type);

CREATE TABLE IF NOT EXISTS propositions (
    id                  TEXT PRIMARY KEY,         -- id de la page Notion (base Propositions)
    date_soumission     TIMESTAMPTZ NOT NULL,

    nom                 TEXT NOT NULL,
    email               TEXT,
    url_officielle      TEXT,
    statut              TEXT,                     -- Reçue, Email validé, En cours, Validée, Rejetée
    description_gemini  TEXT,
    categorie           TEXT,
    token               TEXT,                     -- token de confirmation email
    token_validation    TEXT,                     -- token UUID usage unique (validation via lien WhatsApp)
    notes_admin         TEXT
);

CREATE INDEX IF NOT EXISTS idx_propositions_statut ON propositions (statut);
