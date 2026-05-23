// markdown.js -- Versions Markdown légères pour les assistants IA

const { BASE_URL } = require("./config");
const { nettoyerEspaces } = require("./utils");

function ligne(label, valeur) {
  const propre = nettoyerEspaces(valeur);
  return propre ? `- ${label} : ${propre}\n` : "";
}

function paragraphe(titre, contenu) {
  const propre = nettoyerEspaces(contenu);
  return propre ? `\n## ${titre}\n\n${propre}\n` : "";
}

function urlItem(item) {
  const prefixe = item.type === "LLM" ? "llm" : "outils";
  return `${BASE_URL}/${prefixe}/${item.slug}.html`;
}

function genererMarkdownDetail(item) {
  const type = item.type === "LLM" ? "LLM" : "Outil IA et No-Code";
  return `# ${item.nom}

> ${nettoyerEspaces(item.description || `${item.nom} référencé dans Base IA.`)}

## Résumé

${ligne("Type", type)}${ligne("Catégorie", item.type === "LLM" ? "LLMs" : item.categorie)}${ligne("Niveau", item.niveau)}${ligne("Gratuité", item.gratuite)}${ligne("Site officiel", item.lienOfficiel)}${ligne("Tags", item.tags)}${ligne("Fiche HTML", urlItem(item))}
${paragraphe(`Quand utiliser ${item.nom}`, item.quandUtiliser)}
${paragraphe(`Pourquoi utiliser ${item.nom}`, item.avantages)}
${paragraphe(`Limites de ${item.nom}`, item.limites)}
${paragraphe(`Cas d'usage`, item.casUsage)}
${paragraphe(`Exemples et workflows`, item.exemplesWorkflows)}
${paragraphe(`Modèle économique`, item.modeleEconomique)}
${paragraphe(`Quand payer`, item.quandPayer)}
${paragraphe(`Alternatives`, item.alternatives)}
${paragraphe(`Complémentaire avec`, item.complementaireAvec)}
${paragraphe(`Scénario débutant`, item.scenarioSimple)}
${paragraphe(`Scénario intermédiaire`, item.scenarioIntermediaire)}
${paragraphe(`Scénario avancé`, item.scenarioAvance)}
`;
}

function genererMarkdownAccueil(outils, llms) {
  const items = [...outils, ...llms].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const lignes = items
    .map((item) => `- [${item.nom}](${urlItem(item)}) : ${nettoyerEspaces(item.description).substring(0, 180)}`)
    .join("\n");

  return `# Base IA

> Référence personnelle des outils IA, No-Code et LLMs maintenue par Robin Dualé.

Base IA aide à choisir le bon outil IA ou No-Code selon un cas d'usage concret : automatisation, productivité, recherche, création, développement ou modèle de langage.

## Pages principales

- [Accueil](${BASE_URL}/)
- [Comparatif LLMs 2026](${BASE_URL}/comparatif-llm.html)
- [Automatiser avec l'IA](${BASE_URL}/automatiser-avec-ia.html)
- [Outils No-Code 2026](${BASE_URL}/outils-no-code.html)

## Outils et LLMs référencés

${lignes}
`;
}

function genererMarkdownGuide(slug, titre, intro, items) {
  const lignes = items
    .filter((item) => item.description)
    .map((item) => `- [${item.nom}](${urlItem(item)}) : ${nettoyerEspaces(item.description).substring(0, 180)}`)
    .join("\n");

  return `# ${titre}

> ${intro}

## Fiches liées

${lignes}

## Version HTML

[Lire la page complète](${BASE_URL}/${slug}.html)
`;
}

function genererMarkdownGuides(outils, llms) {
  const tous = [...outils, ...llms];
  return [
    {
      slug: "comparatif-llm",
      markdown: genererMarkdownGuide(
        "comparatif-llm",
        "Comparatif LLMs 2026",
        "Comparer Claude, ChatGPT, Gemini, Perplexity, Copilot et les principaux modèles de langage selon leurs cas d'usage.",
        llms
      ),
    },
    {
      slug: "automatiser-avec-ia",
      markdown: genererMarkdownGuide(
        "automatiser-avec-ia",
        "Automatiser avec l'IA",
        "Choisir les outils utiles pour automatiser des processus métier avec l'IA et le No-Code.",
        tous.filter((item) => ["Productivité", "No-Code"].includes(item.categorie))
      ),
    },
    {
      slug: "outils-no-code",
      markdown: genererMarkdownGuide(
        "outils-no-code",
        "Outils No-Code 2026",
        "Sélectionner les meilleurs outils No-Code pour créer, automatiser et publier sans coder.",
        outils.filter((item) => item.categorie === "No-Code")
      ),
    },
  ];
}

module.exports = {
  genererMarkdownDetail,
  genererMarkdownAccueil,
  genererMarkdownGuides,
};
