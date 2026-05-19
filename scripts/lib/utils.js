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

// Tronque une description pour les meta tags (130-155 chars)
function descriptionMeta(texte, fallback) {
  if (!texte) return fallback;
  if (texte.length >= 130 && texte.length <= 155) return texte;
  if (texte.length > 155) return texte.substring(0, 152) + "...";
  return texte.length >= 80 ? texte : fallback;
}

module.exports = {
  creerDossier,
  slugifier,
  extraireTexte,
  descriptionMeta,
};
