# Patch `build.js` — Passe 2 : la fiche détaillée

Modifications de la fonction `genererPageDetail()` (vers la ligne 1043 dans `scripts/build.js`).
**Aucune autre fonction n'est touchée.** SEO, schema.org, scripts d'admin, modal admin : tout reste identique.

---

## 0. Préalable

Ajoute à la fin de `src/styles.css` le contenu du fichier `styles-fiche-additions.css` fourni dans ce dossier. Ce sont les nouvelles classes (`.fiche-hero`, `.fiche-lede`, `.section[data-type=...]`, `.keypoints`, `.spec-sheet`, etc.).

---

## 1. Ajouter les Google Fonts (si pas déjà fait)

Comme pour la home : juste avant `<link rel="stylesheet" href="../styles.css"/>`, ajoute :

```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```

---

## 2. Remplacer la fonction `section()` locale

**Supprime** dans `genererPageDetail()` :

```javascript
function section(titre, contenu) {
  if (!contenu) return "";
  return `
  <section class="section">
    <h2>${titre}</h2>
    <p>${contenu.replace(/\n/g, "<br/>")}</p>
  </section>`;
}
```

**Remplace par** :

```javascript
function section(type, label, titre, contenu) {
  if (!contenu) return "";
  return `
    <section class="section" data-type="${type}">
      <div class="section-eyebrow">${label}</div>
      <h2>${titre}</h2>
      <p>${contenu.replace(/\n/g, "<br/>")}</p>
    </section>`;
}

// Helper : 2 sections côte à côte
function sectionPair(s1, s2) {
  if (!s1 && !s2) return "";
  return `<div class="section-pair">${s1 || '<div></div>'}${s2 || '<div></div>'}</div>`;
}
```

---

## 3. Remplacer la fonction `pointsCles()`

**Supprime** :
```javascript
function pointsCles(avantages, description) {
  // ... ancien code ...
}
```

**Remplace par** :

```javascript
function pointsCles(avantages, description) {
  const source = avantages || description || "";
  if (!source) return "";
  const lignes = source
    .split(/[\n.]/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter((l) => l.length > 15)
    .slice(0, 3);
  if (!lignes.length) return "";
  return `
    <div class="keypoints">
      <div class="keypoints-titre">Les ${lignes.length} points à retenir</div>
      <ul class="keypoints-liste">
        ${lignes.map((l, i) => `<li><span class="keypoints-num">0${i + 1}</span><span>${l}.</span></li>`).join("\n        ")}
      </ul>
    </div>`;
}
```

---

## 4. Remplacer le bloc nav latérale

**Cherche** :
```javascript
const liensBarreLaterale = liste
  .map((o) => `<a href="${o.slug}.html" class="${o.slug === item.slug ? "actif" : ""}">${o.nom}</a>`)
  .join("\n        ");
```

**Remplace par** :

```javascript
const liensBarreLaterale = liste
  .map((o) => {
    const couleur = o.type === "LLM" ? "#8b5cf6" : (COULEURS_CATEGORIE[o.categorie] || "#6b7280");
    return `<a href="${o.slug}.html" class="${o.slug === item.slug ? "actif" : ""}">
      <span class="nav-dot" style="background:${couleur}"></span>
      <span>${o.nom}</span>
    </a>`;
  })
  .join("\n        ");
```

---

## 5. Calculer la couleur de la catégorie + variables CSS

**Juste après** `const liensBarreLaterale = ...`, **ajoute** :

```javascript
const catColor = item.type === "LLM" ? "#8b5cf6" : (COULEURS_CATEGORIE[item.categorie] || "#6b7280");
const catColorSoft = catColor + "14"; // 8% opacity en hex
const categorieLabel = item.type === "LLM" ? "LLM" : (item.categorie || "Outil");
```

---

## 6. Remplacer le `<header>` et le bloc principal

**Cherche** dans le HTML retourné :

```html
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
      ${pointsCles(item.avantages, item.description)}
      ${section(`A quoi sert ${item.nom} ?`, item.description)}
      ${section(`Quel est le rôle de ${item.nom} dans l'écosystème IA ?`, item.roleEcosysteme)}
      ${section(`Dans quels cas utiliser ${item.nom} ?`, item.quandUtiliser)}
      ${section(`Ce que comprend la version gratuite de ${item.nom}`, item.gratuite)}
      ${section(`Pourquoi utiliser ${item.nom} ? Les points forts`, item.avantages)}
      ${section(`Quelles sont les limites de ${item.nom} ?`, item.limites)}
      ${section(`Cas d’usage de ${item.nom}`, item.casUsage)}
      ${section(`Comment j'utilise ${item.nom} dans mon contexte`, item.casUsagePourMoi)}
      ${section(`Exemples concrets et workflows avec ${item.nom}`, item.exemplesWorkflows)}
      ${section(`Avec quels outils ${item.nom} est-il complémentaire ?`, item.complementaireAvec)}
      ${section(`Quel est le modèle économique de ${item.nom} ?`, item.modeleEconomique)}
      ${section(`Quand passer à la version payante de ${item.nom} ?`, item.quandPayer)}
      ${section(`Quelles alternatives à ${item.nom} ?`, item.alternatives)}
      ${section(`Notes personnelles sur ${item.nom}`, item.notePersonnelles)}
      ${item.lienOfficiel ? `
    <section class="section section-lien">
      <h2>Lien officiel</h2>
      <a class="lien-officiel-section" href="${item.lienOfficiel}" target="_blank" rel="noopener noreferrer">${item.lienOfficiel} →</a>
    </section>` : ""}
    </main>

    ${barreScenariosHtml}
  </div>
```

**Remplace tout ce bloc par** :

```html
<body style="--cat-color:${catColor};--cat-color-soft:${catColorSoft};">
  <div class="cat-band"></div>

  <header>
    <h1>Base <em>IA</em></h1>
    <a class="retour" href="../index.html">← Retour à la base</a>
  </header>

  <div class="mise-en-page">
    <nav class="barre-laterale">
      <p class="barre-laterale-titre">${item.type === "LLM" ? "Tous les LLMs" : "Tous les outils"}</p>
      ${liensBarreLaterale}
    </nav>

    <main class="fiche">
      <div class="fiche-hero">
        <div class="fiche-eyebrow">${item.type === "LLM" ? "Grand modèle" : "Outil"} · ${categorieLabel}</div>
        <h1>${item.nom}</h1>
        <div class="badges">
          <span class="badge-cat">${categorieLabel}</span>
          ${item.niveau ? `<span class="badge-neutre">Niveau ${item.niveau}</span>` : ""}
          ${item.gratuite ? `<span class="badge-gratuit">Freemium</span>` : ""}
          <span class="badge-neutre">${item.type || "Outil"}</span>
        </div>
        ${item.description ? `<p class="fiche-lede">${item.description}</p>` : ""}
        <div class="fiche-actions">
          ${item.lienOfficiel ? `<a class="fiche-action fiche-action--primary" href="${item.lienOfficiel}" target="_blank" rel="noopener noreferrer">Site officiel ↗</a>` : ""}
          ${item.alternatives ? `<a class="fiche-action" href="#alternatives">Voir les alternatives</a>` : ""}
        </div>
      </div>

      ${item.tags ? `<div class="tags-fiche"><span class="tags-label"># tags</span>${item.tags.split(",").map(badgeTag).join("")}</div>` : ""}

      ${pointsCles(item.avantages, item.description)}

      ${section('intro', '● Présentation', `À quoi sert ${item.nom} ?`, item.description)}
      ${section('intro', '● Présentation', `Son rôle dans l'écosystème IA`, item.roleEcosysteme)}

      ${sectionPair(
        section('usage', '● Usage', `Quand utiliser ${item.nom}`, item.quandUtiliser),
        section('eco', '● Économique', `Ce que comprend la version gratuite`, item.gratuite)
      )}

      ${sectionPair(
        section('fort', '● Points forts', `Pourquoi utiliser ${item.nom}`, item.avantages),
        section('faible', '● Limites', `Les limites à connaître`, item.limites)
      )}

      ${section('usage', '● Usage', `Cas d'usage concrets`, item.casUsage)}
      ${section('usage', '● Usage', `Comment je l'utilise dans mon contexte`, item.casUsagePourMoi)}
      ${section('usage', '● Usage', `Exemples & workflows avec ${item.nom}`, item.exemplesWorkflows)}
      ${section('usage', '● Usage', `Avec quels outils ${item.nom} est-il complémentaire ?`, item.complementaireAvec)}

      ${sectionPair(
        section('eco', '● Économique', `Modèle économique de ${item.nom}`, item.modeleEconomique),
        section('eco', '● Économique', `Quand passer à la version payante`, item.quandPayer)
      )}

      <div id="alternatives">
        ${section('intro', '● Alternatives', `Quelles alternatives à ${item.nom} ?`, item.alternatives)}
      </div>

      ${section('notes', '● Carnet', `Notes personnelles sur ${item.nom}`, item.notePersonnelles)}
    </main>

    ${barreScenariosHtml}
  </div>
```

---

## 7. Enrichir la `barreScenariosHtml` avec la spec sheet

**Cherche** :
```javascript
const barreScenariosHtml = hasScenarios ? `
  <aside class="barre-scenarios">
    <p class="barre-scenarios-titre">Scénarios d'usage</p>
    ...
  </aside>` : "";
```

**Remplace par** :

```javascript
const specRows = [
  ["Catégorie", categorieLabel],
  item.niveau ? ["Niveau", item.niveau] : null,
  item.gratuite ? ["Gratuité", "Freemium"] : null,
  item.lienOfficiel ? ["Site officiel", item.lienOfficiel.replace(/^https?:\/\//, "").replace(/\/$/, "")] : null,
].filter(Boolean);

const specSheetHtml = `
  <div class="spec-sheet">
    <div class="spec-sheet-titre">En résumé</div>
    ${specRows.map(([k, v]) => `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`).join("")}
  </div>`;

const barreScenariosHtml = `
  <aside class="barre-scenarios">
    ${hasScenarios ? `
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
    ` : ""}
    ${specSheetHtml}
  </aside>`;
```

---

## 8. Tester en local

```bash
cd Base_IA
npm run build
# Ouvre dist/outils/[un-outil].html
```

Si la home n'est pas encore mergée, ne t'inquiète pas — la fiche fonctionne de manière autonome avec le nouveau CSS, qu'elle soit accompagnée de la nouvelle home ou de l'ancienne.

---

## Récap des fichiers à modifier

1. `src/styles.css` → **append** le contenu de `styles-fiche-additions.css`
2. `scripts/build.js` → patcher uniquement la fonction `genererPageDetail()` selon les sections 1 à 7
