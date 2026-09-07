# Patch `build.js` — refonte de la home

Cette note décrit **uniquement** les modifications à apporter à la fonction `genererPageAccueil()` dans `scripts/build.js`. Tout le reste (SEO, admin, drag & drop, modal proposition) est préservé.

---

## 1. Ajouter les Google Fonts dans le `<head>`

Cherche la ligne :
```html
<link rel="stylesheet" href="styles.css"/>
```

**Avant** cette ligne, ajoute :
```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```

À faire dans **toutes** les fonctions `generer...()` qui produisent des pages (accueil, détail, positionnement, mentions, confirmation, admin).

---

## 2. Remplacer le `<header>` et l'intro

**Remplace** :
```html
<header>
  <h1>Base IA</h1>
  <p class="sous-titre">Référence personnelle des outils IA, No-Code et LLMs par Robin Dualé</p>
</header>

<main>
  <p style="color:var(--gris);font-size:0.95rem;margin-bottom:1rem;max-width:680px;line-height:1.7;">
    Base IA répertorie les meilleurs outils...
  </p>
```

**Par** :
```html
<header>
  <h1>Base <em>IA</em></h1>
</header>

<main>
  <section class="hero">
    <div class="hero-eyebrow">Mise à jour le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    <h2>Une bibliothèque <em>vivante</em><br/>des outils IA &amp; No-Code.</h2>
    <p class="hero-intro">
      Recensés, testés et commentés à la main par Robin Dualé. Chaque fiche pèse les forces, les limites et le moment juste pour adopter — ou laisser tomber.
    </p>
    <div class="kpis">
      <div class="kpi">
        <div class="kpi-num">${outils.length}</div>
        <div class="kpi-label">Outils référencés</div>
      </div>
      <div class="kpi">
        <div class="kpi-num">${llms.length}</div>
        <div class="kpi-label">Grands modèles</div>
      </div>
      <div class="kpi">
        <div class="kpi-num">${categories.length}</div>
        <div class="kpi-label">Catégories</div>
      </div>
      <div class="kpi">
        <div class="kpi-num">${tagsOutils.length}</div>
        <div class="kpi-label">Cas d'usage</div>
      </div>
    </div>
  </section>

  <p class="admin-zone" style="display:none;margin-bottom:16px;">
    <button type="button" onclick="ouvrirModalProposition()" class="btn-reorganiser">+ Proposer un outil</button>
  </p>
```

---

## 3. Réécrire la génération des cartes

**Remplace** le bloc `const cartesOutils = outils.map(...)` par :

```javascript
function genererCarte(item, prefixe, estLLM) {
  const couleurCat = estLLM
    ? "#8b5cf6"
    : (COULEURS_CATEGORIE[item.categorie] || "#6b7280");
  const tagsArray = item.tags ? item.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  const tagsBadges = tagsArray.slice(0, 3).map(t => {
    const c = COULEURS_TAG[t] || "#6b7280";
    return `<span class="carte-tag" style="color:${c}">${t}</span>`;
  }).join("");
  const categorieLabel = estLLM ? "LLM" : (item.categorie || "");
  const typeLabel = estLLM ? "Modèle" : (item.type || "Outil");

  return `
    <a class="carte" href="${prefixe}/${item.slug}.html" data-categorie="${item.categorie}" data-tags="${item.tags || ""}" data-notion-id="${item.id}">
      <div class="carte-accent" style="background:${couleurCat}"></div>
      <div class="carte-body">
        <div class="carte-head">
          <div class="carte-cat">${categorieLabel}</div>
          <div class="carte-type">${typeLabel}</div>
        </div>
        <h2 class="carte-nom">${item.nom}</h2>
        ${item.description ? `<p class="carte-description">${item.description}</p>` : ""}
        <div class="carte-foot">
          <div class="carte-tags">${tagsBadges}</div>
          <span class="carte-arrow">→</span>
        </div>
      </div>
    </a>`;
}

const cartesOutils = outils.map(o => genererCarte(o, "outils", false)).join("\n");
const cartesLLMs = llms.map(l => genererCarte(l, "llm", true)).join("\n");
```

---

## 4. Filtre « Tous » : utiliser le mot exact

Pour que le bouton « Tous » utilise bien la nouvelle classe :
- Aucune modification du HTML existant, c'est juste pour vérifier que ton script JS `filtrerOutils()` compare bien `filtreActif === "tous"` (déjà le cas).

---

## 5. Note sur les autres pages

La nouvelle CSS est compatible avec **toutes les autres pages** (fiche, positionnement, mentions, confirmation, admin) — elle réutilise les mêmes tokens. Les pages s'afficheront proprement même sans modification HTML, mais elles auront un rendu basique. Quand tu seras content de la home, on attaquera la fiche dans une seconde passe (le HTML de `genererPageDetail()` a aussi besoin d'être enrichi pour exploiter pleinement la nouvelle CSS).

---

## 6. Tester

```bash
cd Base_IA
npm run build
# Ouvrir dist/index.html dans un navigateur
```

Si tu vois un bug ou si tu veux ajuster (couleur d'accent, taille de hero, etc.), reviens vers moi.
