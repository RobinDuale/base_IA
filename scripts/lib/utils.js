// utils.js -- Fonctions utilitaires partagées

const fs = require("fs");

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

function nettoyerEspaces(texte) {
  return String(texte || "").replace(/\s+/g, " ").trim();
}

function tronquerPhrase(texte, limite) {
  const propre = nettoyerEspaces(texte);
  if (propre.length <= limite) return propre;
  const coupe = propre.substring(0, limite + 1);
  const dernierEspace = coupe.lastIndexOf(" ");
  const sansMotCoupe = dernierEspace > 80 ? coupe.substring(0, dernierEspace) : propre.substring(0, limite);
  return sansMotCoupe.replace(/[.,;:!?-]+$/g, "").trim();
}

// Echappement HTML applique a tout le contenu venant de Notion, au moment ou les
// items sont construits (voir notion.js). L'apostrophe est echappee elle aussi :
// sans elle, un champ Notion sort d'un attribut ecrit en quotes simples, et de la
// chaine JavaScript des gestionnaires onclick generes par detail.js.
function echapperHtml(texte) {
  return String(texte || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Echappement pour les blocs JSON-LD, qui vivent dans un <script> et ne sont donc
// pas proteges par l'echappement HTML. JSON.stringify traite guillemets, antislashs
// et caracteres de controle ; les trois remplacements suivants neutralisent en plus
// toute balise fermante, qui sortirait du script sans eux.
function echapperJson(texte) {
  return JSON.stringify(nettoyerEspaces(texte))
    .slice(1, -1)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// Ne laisse passer qu'une URL http ou https. Ferme les schemas javascript: et data:
// dans les attributs href alimentes par le champ Notion "Lien officiel".
function urlSure(url) {
  const propre = String(url || "").trim();
  return /^https?:\/\//i.test(propre) ? propre : "";
}

// Tronque une description pour les meta tags (130-155 chars)
function descriptionMeta(texte, fallback) {
  const source = nettoyerEspaces(texte);
  const secours = nettoyerEspaces(fallback);
  const base = source.length >= 80 ? source : secours;
  return tronquerPhrase(base, 155);
}

// Formate une date ISO en format Schema.org avec timezone Paris correcte
// Heure d'été (avr-oct) : +02:00 / Heure d'hiver (nov-mars) : +01:00
// Exemple : "2026-05-21T00:00:00+02:00"
// Accepte une string ISO (ex: Notion created_time) ou un objet Date
function formatDateParis(source) {
  const FALLBACK = "2026-05-16T00:00:00+02:00";
  if (!source) return FALLBACK;
  const d = (source instanceof Date) ? source : new Date(source);
  if (isNaN(d.getTime())) return FALLBACK;
  const mois = d.getUTCMonth() + 1; // 1-12
  const offset = (mois >= 4 && mois <= 10) ? "+02:00" : "+01:00";
  const datePart = d.toISOString().split("T")[0]; // "2026-05-21"
  return `${datePart}T00:00:00${offset}`;
}

module.exports = {
  creerDossier,
  slugifier,
  extraireTexte,
  nettoyerEspaces,
  tronquerPhrase,
  echapperHtml,
  echapperJson,
  urlSure,
  descriptionMeta,
  formatDateParis,
};
