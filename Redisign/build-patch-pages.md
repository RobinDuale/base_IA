# Patch `build.js` — Passe 3 : pages SEO, mentions légales, confirmation

Trois fonctions à patcher dans `scripts/build.js`. La page admin propositions n'est **pas** touchée (page interne, pas besoin de la refondre).

---

## 0. Préalable

Ajoute à la fin de `src/styles.css` le contenu de `styles-pages-additions.css`.

---

## 1. Page de positionnement SEO (`genererPagePositionnement`, ligne ~1345)

### a. Ajouter les Google Fonts dans le `<head>`

Juste avant `<link rel="stylesheet" href="/styles.css"/>`, ajoute :
```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```

### b. Remplacer tout le `<body>` jusqu'à `${footerHtml}` exclus

**Cherche** :
```html
<body>
<header>
  <a class="retour" href="/">← Base IA</a>
  <h1 style="font-size:1.6rem;">${h1}</h1>
</header>
<main>
  <p style="color:var(--gris);font-size:0.95rem;margin-bottom:2rem;max-width:680px;line-height:1.7;">${intro}</p>
  ${sections}
</main>
${footerHtml}
```

**Remplace par** :
```html
<body>
<header>
  <h1>Base <em>IA</em></h1>
  <a class="retour" href="/">← Retour à la base</a>
</header>

<main>
  <article class="article-positionnement">
    <div class="article-eyebrow">Repère · Lecture 6 min</div>
    <h1 class="article-h1">${h1}</h1>
    <p class="article-lede">${intro}</p>

    <div class="article-meta">
      <div class="article-meta-col">
        <span class="article-meta-label">Auteur</span>
        <span class="article-meta-val">Robin Dualé</span>
      </div>
      <div class="article-meta-col">
        <span class="article-meta-label">Publié</span>
        <span class="article-meta-val">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
      </div>
      <div class="article-meta-col">
        <span class="article-meta-label">Sujet</span>
        <span class="article-meta-val">${h1.split(/[?:]/)[0].slice(0, 40)}</span>
      </div>
    </div>

    ${sections}
  </article>
</main>
${footerHtml}
```

### c. (Optionnel) Améliorer le contenu des sections

Le `sections` reste passé tel quel — il est déjà construit dans `genererPagesPositionnement()`. Tu n'as rien à toucher.

---

## 2. Mentions légales (`genererMentionsLegales`, ligne ~1581)

### a. Ajouter les Google Fonts (idem)

Avant `<link rel="stylesheet" href="/styles.css"/>` :
```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
```

### b. Remplacer le `<body>` jusqu'à `<footer>` exclu

**Cherche** :
```html
<body>
<header>
  <h1>Base IA</h1>
  <p class="sous-titre">Outils IA &amp; No-Code · Robin Dualé</p>
</header>
<main>
  <a href="/" class="retour">← Retour</a>
  <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:1.5rem;">Mentions légales</h2>

  <div class="section" style="margin-bottom:1rem;">
    <h2>Éditeur</h2>
    ...
  </div>

  <div class="section" style="margin-bottom:1rem;">
    <h2>Hébergement</h2>
    ...
  </div>

  <div class="section" style="margin-bottom:1rem;">
    <h2>Propriété intellectuelle</h2>
    ...
  </div>

  <div class="section" style="margin-bottom:1rem;">
    <h2>Données personnelles &amp; RGPD</h2>
    ...
  </div>
</main>
```

**Remplace par** :
```html
<body>
<header>
  <h1>Base <em>IA</em></h1>
  <a href="/" class="retour">← Retour à la base</a>
</header>

<main>
  <div class="page-simple">
    <div class="page-simple-eyebrow">Cadre légal</div>
    <h1 class="page-simple-h1">Mentions légales</h1>

    <div class="section">
      <h2>Éditeur</h2>
      <p>Robin Dualé<br/>
      Email : <a href="mailto:robin@duale.fr">robin@duale.fr</a><br/>
      Site : <a href="https://cv-robin.duale.fr" target="_blank" rel="noopener noreferrer">cv-robin.duale.fr</a></p>
    </div>

    <div class="section">
      <h2>Hébergement</h2>
      <p>GitHub Pages · GitHub, Inc.<br/>
      88 Colin P. Kelly Jr. St, San Francisco, CA 94107, États-Unis<br/>
      <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer">pages.github.com</a></p>
    </div>

    <div class="section">
      <h2>Propriété intellectuelle</h2>
      <p>La structure, la sélection et l'organisation des contenus de ce site sont la propriété de Robin Dualé. Les textes descriptifs sont principalement produits avec l'assistance d'outils d'IA. Toute reproduction de la structure ou de l'organisation sans autorisation est interdite.</p>
    </div>

    <div class="section">
      <h2>Données personnelles &amp; RGPD</h2>
      <p>Ce site ne collecte aucune donnée personnelle, ne dépose aucun cookie et n'utilise aucun outil d'analyse d'audience. Aucune information vous concernant n'est transmise à des tiers.</p>
    </div>
  </div>
</main>
```

---

## 3. Page confirmation (`genererPageConfirmation`, ligne ~787)

### a. Ajouter les Google Fonts (idem)

### b. Remplacer le `<body>` jusqu'à `<footer>` exclu

**Cherche** :
```html
<body>
<header>
  <a class="retour" href="/">← Base IA</a>
  <h1>Proposition confirmée</h1>
</header>
<main>
  <div style="max-width:520px;margin:3rem auto;text-align:center;padding:0 1rem;">
    <div style="width:64px;height:64px;background:#22c55e;border-radius:50%;...">✓</div>
    <h2 style="font-size:1.4rem;margin-bottom:1rem;">Merci pour votre contribution !</h2>
    <p style="color:var(--gris);line-height:1.7;margin-bottom:2rem;">Votre email a bien été confirmé...</p>
    <a href="/" style="display:inline-block;background:#1a1712;color:#fff;...">Retour à Base IA</a>
  </div>
</main>
```

**Remplace par** :
```html
<body>
<header>
  <h1>Base <em>IA</em></h1>
  <a class="retour" href="/">← Retour à la base</a>
</header>

<main>
  <div class="page-simple" style="text-align:center;padding-top:64px;">
    <div style="width:56px;height:56px;background:#2a7256;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;font-size:1.5rem;color:#fff;font-weight:500;">✓</div>
    <div class="page-simple-eyebrow">Proposition reçue</div>
    <h1 class="page-simple-h1">Merci pour votre contribution&nbsp;!</h1>
    <p style="font-size:18px;line-height:1.65;color:var(--ink);max-width:480px;margin:0 auto 32px;">
      Votre email a bien été confirmé. Robin va examiner votre proposition — vous recevrez un message si l'outil est validé et ajouté à la base.
    </p>
    <a href="/" class="fiche-action fiche-action--primary" style="font-weight:500;">Retour à Base IA →</a>
  </div>
</main>
```

---

## 4. Tester

```bash
cd Base_IA
npm run build
# Ouvrir dist/comparatif-llm.html, dist/mentions-legales.html, dist/confirmation.html
```

---

## Récap final

À ce stade, après les 3 passes, **toutes les pages publiques** suivent la même direction :

| Page | Fichier généré | Fonction patchée |
|------|----------------|------------------|
| Home | `index.html` | `genererPageAccueil()` (Passe 1) |
| Fiche outil | `outils/*.html` | `genererPageDetail()` (Passe 2) |
| Fiche LLM | `llm/*.html` | `genererPageDetail()` (Passe 2) |
| SEO Comparatif LLM | `comparatif-llm.html` | `genererPagePositionnement()` (Passe 3) |
| SEO Auto IA | `automatiser-avec-ia.html` | `genererPagePositionnement()` (Passe 3) |
| SEO No-Code | `outils-no-code.html` | `genererPagePositionnement()` (Passe 3) |
| Mentions légales | `mentions-legales.html` | `genererMentionsLegales()` (Passe 3) |
| Confirmation | `confirmation.html` | `genererPageConfirmation()` (Passe 3) |

Page admin propositions (`admin-propositions.html`) → laissée telle quelle, c'est une page interne avec ses propres styles.
