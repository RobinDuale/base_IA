# CLAUDE.md — Projet Base_IA

Ce fichier guide toutes les conversations dans ce projet. Il est mis à jour au fil des décisions prises.

---

## Contexte du projet

Site web personnel de Robin Duale, hébergé sur GitHub Pages via GitHub Actions, connecté à une base de données Notion. L'objectif est pédagogique : apprendre Git, GitHub, les APIs, Next.js/HTML statique et le déploiement.

**URL cible :** `ia.duale.fr`
**DNS :** CNAME `ia.duale.fr` -> `robinduale.github.io` (déjà configuré)

**Repo GitHub :** `https://github.com/RobinDuale/base_IA`
**Chemin local :** `C:\Users\robin\ClaudeDevRepo\Base_IA`

---

## Architecture retenue

```
Notion (source de données)
    |
    | API Notion (clé secrète dans GitHub Secrets)
    |
GitHub Actions (déclenché par webhook Notion OU par schedule)
    |
    | Génère les fichiers HTML statiques
    |
GitHub Pages (hébergement gratuit)
    |
    | Domaine personnalisé
    |
ia.duale.fr
```

**Pourquoi cette architecture :**
- 100% gratuit
- Domaine personnalisé `duale.fr` supporté nativement par GitHub Pages
- Projet pédagogique : apprentissage de Git, GitHub Actions, API Notion, HTML/CSS/JS
- Pseudo temps réel via webhook Notion -> GitHub Actions (délai ~1-2 min)

---

## Source de données Notion

**Espace :** Outils IA et No Code
**URL page principale :** https://www.notion.so/3625b86a8bb48046b4b9f1353db3287b

### Base de données principale : Outils
**ID collection :** `collection://292ff6af-572c-4a0a-95d9-4f6607df0b39`
**URL database :** https://www.notion.so/b6a3c72949e546f89c6dfc990689298e

**Propriétés disponibles :**

| Propriété | Type | Valeurs |
|-----------|------|---------|
| Nom | Titre | — |
| Catégorie | Sélection | IA, No-Code, Automatisation, Base de données, Développement, Productivité, Scraping, Hébergement |
| Niveau | Sélection | Débutant, Intermédiaire, Avancé |
| Priorité | Sélection | Haute, Moyenne, Basse |
| Statut d'apprentissage | Statut | Pas commencé, En cours, Terminé |
| Description simple | Texte | — |
| Avantages | Texte | — |
| Limites | Texte | — |
| Cas d'usage | Texte | — |
| Cas d'usage pour moi | Texte | — |
| Alternatives | Texte | — |
| Modèle économique | Texte | — |
| Quand payer | Texte | — |
| Lien officiel | URL | — |
| Notes personnelles | Texte | — |
| Tags | Multi-sélection | CRM, Veille, Prospection, Workflow, Scraping, IA, Hébergement |
| Complémentaire avec | Texte | — |
| Exemples & Workflows | Texte | — |
| Quand utiliser cet outil | Texte | — |
| Rôle dans l'écosystème | Texte | — |
| Gratuité | Texte | Périmètre de la version gratuite |
| Type | Sélection | Outil, LLM |
| Ordre | Nombre | Ordre d'affichage dans la grille |
| Scénario simple | Texte | Workflow débutant avec interactions multi-outils |
| Scénario intermédiaire | Texte | Workflow intermédiaire avec interactions multi-outils |
| Scénario avancé | Texte | Workflow avancé avec interactions multi-outils |

### Autres bases de données dans l'espace
- **Cas d'usage** — ID: `5fa5a591-a14f-4605-b426-7dcc9e36989a`
- **Projets** — ID: `58d337f4-3305-49a3-910f-d889d0dfe77d`
- **Parcours d'apprentissage** — ID: `dc9137fd-a09d-4d59-a739-2b5404e0f6be`
- **Propositions d'outils** — ID collection: `2224a9df-e426-4812-bfba-5a1d23e5947f` — URL: https://www.notion.so/08162c25b54a437098992ff9fd6d0701
  - Champs : Nom (title), Email, Statut (Reçue/Email validé/En cours/Validée/Rejetée), Description Gemini, Catégorie, URL officielle, Token, Notes admin, Date soumission (auto)

---

## Stack technique

- **Générateur de site :** script Node.js simple (pas de framework lourd — approche pédagogique)
- **Hébergement :** GitHub Pages
- **CI/CD :** GitHub Actions
- **Déclencheur :** webhook Notion + schedule de secours (toutes les heures)
- **Secrets :** `NOTION_API_KEY` dans GitHub Secrets
- **Email transactionnel :** Brevo (300 emails/jour gratuits) -- node natif n8n
- **Analytics :** Google Analytics GA4, propriété "Base IA", ID `G-61ZR41S7J7`

---

## Démarrage de session -- checklist

A faire systématiquement au début de chaque session :

1. Lire ce `CLAUDE.md` pour reprendre le contexte
2. Vérifier l'état git : `git status` + `git log --oneline -5`
3. Identifier l'étape en cours dans la section "Etapes du projet"
4. Si le repo a divergé : `git fetch origin && git reset --hard origin/main`

---

## Règles absolues

- **Mise à jour de CLAUDE.md en continu** — ce fichier est la mémoire opérationnelle du projet. L'enrichir dès qu'une information utile émerge : décision d'architecture, convention établie, problème résolu, nouvelle propriété Notion utilisée, règle de travail clarifiée. Ne pas attendre la fin de session — mettre à jour au moment où l'information est fraîche, puis commiter avec les autres changements de la session.
- **Mise à jour de JOURNAL.md en continu** — ce fichier est le journal de bord humain du projet. Le mettre à jour à chaque étape réalisée : décrire ce qui a été fait, pourquoi, et expliquer les nouveaux concepts techniques rencontrés en langage simple. Cocher les étapes accomplies dans la liste "Etapes à venir". Ajouter les nouveaux concepts dans la section "Concepts appris".
- **Toujours demander confirmation avant `git push`**
- **Commits en anglais**, co-signés : `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- **Interdit** : le caractère `—` (tiret cadratin) dans tout contenu créé
- **Python** : `python` (pas `python3`) -- Windows
- **Code lisible pour débutant** : ce projet est pédagogique. Commenter ce qui n'est pas évident, expliquer les concepts nouveaux au fil de l'avancement.
- **Noms de fichiers** : toujours en minuscules, tirets uniquement -- jamais d'espaces, underscores ou majuscules (ex : `liste-outils.html`, pas `Liste_Outils.html`). Un espace dans un nom de fichier casse l'URL.

---

## Confidentialité -- repo public

`Base_IA` est un repo **public** -- ne jamais y mettre d'informations sensibles.

- **`CLAUDE.md`** (repo public) : règles projet, architecture, conventions. Rien de sensible.
- **`memory/`** (local, jamais pushé) : données privées uniquement (clé API Notion, token GitHub, sous-domaine exact si sensible).
- **GitHub Secrets** : `NOTION_API_KEY` stockée dans les secrets du repo, jamais en clair dans le code.

---

## SEO / GEO

Le site a vocation à être référencé. Appliquer ces règles dès la construction.

### Meta description -- 130 a 155 caractères
Google tronque au-delà de ~155 caractères. Vérifier avec `len("texte")` en Python.

### Title tag -- 50 a 60 caractères
Bing avertit dès 60-62 caractères. Mettre le mot-clé principal en tête de titre.

### Balises OG et Twitter Card -- obligatoires sur toutes les pages
```html
<meta property="og:title" content="[titre page]"/>
<meta property="og:description" content="[description 130-155 car.]"/>
<meta property="og:image" content="https://[domaine]/assets/[image]-og.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="[description image]"/>
<meta property="og:locale" content="fr_FR"/>
<meta property="og:site_name" content="Base IA -- Robin Duale"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="[titre page]"/>
<meta name="twitter:description" content="[description]"/>
<meta name="twitter:image" content="https://[domaine]/assets/[image]-og.png"/>
```

### Schema.org -- dates avec timezone obligatoire
```json
"datePublished": "2026-05-16T00:00:00+02:00"
```
Heure d'été (avr-oct) : `+02:00` / Heure d'hiver (nov-mars) : `+01:00`

### Liens externes -- toujours avec rel
```html
<a href="https://..." target="_blank" rel="noopener noreferrer">...</a>
```

### Images -- pas de lazy sur l'image principale
Ne pas mettre `loading="lazy"` sur l'image hero/principale d'une page -- les crawlers ne la chargent pas.

### Contenu -- balises sémantiques
Utiliser `<strong>` (sémantique) et non `<b>` (stylistique) dans le contenu éditorial.

### robots.txt -- autoriser les bots IA
Vérifier que `robots.txt` autorise explicitement : `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`.

### IndexNow -- apres chaque push
Notifie Bing et Yandex des mises a jour. A configurer une fois le site en ligne.

---

## Problème connu -- git fetch Windows

Si `git fetch` echoue avec une erreur `refs/desktop.ini` :
```powershell
Get-ChildItem ".git" -Force -Recurse -Filter "desktop.ini" | Remove-Item -Force
```

---

## Structure du projet

```
Base_IA/
├── CNAME                  → ia.duale.fr (domaine personnalisé)
├── CLAUDE.md              → instructions Claude
├── JOURNAL.md             → journal de bord humain
├── .gitignore             → ignore node_modules/, .env, dist/
├── package.json           → dépendances Node.js (@notionhq/client)
├── .github/workflows/
│   └── deploy.yml         → workflow GitHub Actions (push + webhook + schedule horaire)
├── scripts/
│   └── build.js           → script principal : lit Notion, génère le HTML
├── src/
│   └── styles.css         → feuille de style du site
└── dist/                  → fichiers générés (gitignorés, déployés par GitHub Actions)
    ├── CNAME
    ├── styles.css
    ├── version.json        → horodatage du dernier build (pour détection fin de build)
    ├── index.html          → page d'accueil avec onglets Outils / LLMs + recherche + filtres
    ├── outils/
    │   └── [slug].html     → fiche détaillée par outil
    └── llm/
        └── [slug].html     → fiche détaillée par LLM
```

## n8n -- Workflow Notion -> GitHub Actions

**Workflow :** "Notion -> GitHub Actions : Base IA"
**URL :** https://n8n.srv1161197.hstgr.cloud/workflow/ujrE1EVLlrEZL9yW
**Statut :** actif -- poll toutes les heures + webhook manuel disponible

- Noeud 1 : Notion Trigger -- surveille la base Outils toutes les heures -- credential Notion OK
- Noeud 2 : Webhook GET sur `/base-ia-refresh` -- URL publique : `https://n8n.srv1161197.hstgr.cloud/webhook/base-ia-refresh`
- Noeud 3 : Repondre au webhook (JSON `{"status":"ok"}`)
- Noeud 4 : HTTP Request POST vers `https://api.github.com/repos/RobinDuale/base_IA/dispatches`
- Auth : Bearer Auth -- credential "Bearer Auth account" avec token GitHub `n8n - Base IA webhook`
- Body : Raw + application/json + `{"event_type":"notion-update"}`
- **ATTENTION :** après chaque `update_workflow` via MCP, les credentials du noeud HTTP Request sont réinitialisés. Toujours vérifier dans l'interface n8n que le credential Bearer Auth est bien sélectionné.
- **Resolution body (historique) :** le mode "Using Fields Below" et "Using JSON" causaient une erreur 422. Solution : Body Content Type = Raw, Content Type = application/json, JSON direct dans Body.

---

## Etapes du projet

- [x] Créer la clé API Notion
- [x] Structurer le projet (dossiers, fichiers de base)
- [x] Ecrire le script Node.js qui lit Notion et génère le HTML
- [x] Tester le build en local -- 4 outils récupérés et pages générées
- [x] Configurer GitHub Actions (deploy.yml)
- [x] Activer GitHub Pages sur le repo (branche gh-pages)
- [x] Référencer le projet sur projets.duale.fr
- [x] Finaliser le workflow n8n (credentials + body corrigé, test reussi)
- [x] Activer le workflow n8n (toggle ON) -- fait via MCP n8n
- [x] Ajouter la navigation latérale sur les fiches outils
- [x] Ajouter le bouton de mise à jour manuelle avec détection de fin de build
- [x] Réorganisation des cartes par glisser-déposer (SortableJS + webhook n8n reorder)
- [x] Configurer credentials n8n sur workflow "Reorder outils" (ID: xRKkzmkpVcsjikNG)
- [x] Ajouter onglet LLMs (Claude, ChatGPT, Gemini, Perplexity, Claude Code, Microsoft Copilot)
- [x] Ajouter champ Gratuité sur toutes les fiches
- [x] Ajouter champs Scénario simple / intermédiaire / avancé -- sidebar droite sur les fiches
- [x] Layout 3 colonnes : nav gauche (160px) + contenu + scénarios droite (260px)
- [x] Champ recherche dynamique sur la home (filtre nom + description)
- [x] Filtres unifiés catégories + tags sur la home (sans doublons, couleur par filtre)
- [x] Tags affichés en badges colorés en haut des fiches (avec label "# tags")
- [x] Concurrence deploy.yml : cancel-in-progress pour éviter les doubles builds
- [x] Outils ajoutés : Clay, Slack, Lovable, GitHub Copilot -> Microsoft Copilot
- [x] Système admin : boutons Réorganiser et Mettre à jour cachés par défaut, icône ⚙ dans le footer, auth via token GitHub validé contre l'API GitHub, cookie partagé .duale.fr avec cv-robin.duale.fr (SSO entre les deux sites)
- [x] Sync automatique JOURNAL.md -> Notion via GitHub Actions (sous-page dans "Outils IA et No Code")
- [x] Tester le cycle complet : modif Notion -> n8n -> GitHub Actions -> site mis à jour
- [x] Vérifier les credentials n8n après chaque mise à jour du workflow
- [x] Ajouter robots.txt et balises OG/Twitter Card (SEO)
- [x] sitemap.xml dynamique généré à chaque build + soumis à Bing Webmaster Tools
- [x] Schema.org complet : WebSite + ItemList sur la home, SoftwareApplication + BreadcrumbList + ImageObject sur les fiches
- [x] llms.txt généré dynamiquement avec liste complète des outils et descriptions
- [x] Favicon : carré noir/blanc IA (SVG + PNG 16/32/48 + ICO), référencé en 5 lignes dans toutes les pages
- [x] H2 answer-ready sur toutes les fiches (formulés comme questions avec le nom de l'outil)
- [x] IndexNow : clé fff05dc2... + ping Bing automatique à chaque déploiement
- [x] Mentions légales propres à ia.duale.fr (éditeur, hébergeur GitHub Pages, RGPD)
- [x] Maillage SEO vers cv-robin.duale.fr dans le footer (2 liens par page)
- [ ] Formulaire de proposition d'outil par les visiteurs (Gemini + Brevo + WhatsApp CallMeBot + admin)
  - Base Notion "Propositions d'outils" creee (ID: 2224a9df-e426-4812-bfba-5a1d23e5947f)
  - Fiche Brevo creee dans Notion Outils
  - Brevo : compte a creer sur brevo.com + cle API a recuperer
  - Workflow : nom -> check doublon + Gemini -> confirmation -> email validation -> Notion -> WhatsApp admin -> admin valide -> email visiteur
- [ ] 2e passe Gemini a la publication + email visiteur

---

## n8n -- Workflow Reorder outils

**Workflow :** "Reorder outils - Base IA"
**ID :** xRKkzmkpVcsjikNG
**URL :** https://n8n.srv1161197.hstgr.cloud/workflow/xRKkzmkpVcsjikNG
**Webhook :** POST `https://n8n.srv1161197.hstgr.cloud/webhook/base-ia-reorder`
**Statut :** publié -- credentials a configurer manuellement

Structure :
1. Webhook POST `/base-ia-reorder` -- recoit `{ordre: [{id: "notion-page-id", ordre: 1}, ...]}`
2. Code node "Split ordre items" -- decoupe le tableau en items individuels
3. HTTP Request "Update Notion page" -- PATCH `/pages/{pageId}` avec `{properties: {Ordre: {number: N}}}` -- **credential notionApi a selectionner**
4. HTTP Request "Trigger GitHub Actions" -- POST repository_dispatch (executeOnce) -- **credential Bearer Auth a selectionner**

**Credential "Update Notion page" :** Generic Credential Type > Header Auth > credential "Header Auth account"
- Name : `Authorization` (avec un z, pas un s)
- Value : `Bearer ntn_...` (token Notion depuis notion.so/my-integrations)

**ATTENTION :** apres chaque update_workflow via MCP, les credentials sont reinitialises. Reconfigurer manuellement. Piege connu : "Authorisation" (s) au lieu de "Authorization" (z) dans le champ Name.

---

## Historique des décisions

| Date | Decision |
|------|----------|
| 2026-05-16 | Architecture retenue : GitHub Pages + GitHub Actions + n8n (relay webhook) |
| 2026-05-16 | Stack pédagogique : script Node.js simple, pas de framework |
| 2026-05-16 | Sous-domaine retenu : ia.duale.fr -- CNAME déjà configuré vers robinduale.github.io |
| 2026-05-16 | Base Notion "Outils" identifiée et structure mappée |
| 2026-05-16 | n8n retenu comme relay entre Notion et GitHub Actions (hébergé sur serveur) |
| 2026-05-16 | GitHub Pages activé sur branche gh-pages via gh CLI |
| 2026-05-16 | n8n body corrigé : Raw + application/json + JSON direct dans le champ Body -- test OK (204 No Content) |
| 2026-05-16 | n8n activé, poll réduit à toutes les heures, webhook manuel ajouté (`/webhook/base-ia-refresh`) |
| 2026-05-16 | Barre de navigation latérale ajoutée sur les fiches outils (sticky desktop, tags mobile) |
| 2026-05-16 | Bouton refresh avec polling de version.json pour détecter la fin de build |
| 2026-05-17 | Onglet LLMs ajouté -- même base Notion, champ Type (Outil/LLM) pour séparer |
| 2026-05-17 | 3 champs Scénarios ajoutés (simple/intermédiaire/avancé) -- sidebar droite sur fiches |
| 2026-05-17 | Layout 3 colonnes : nav gauche 160px + contenu + scénarios droite 260px |
| 2026-05-17 | Recherche dynamique sur la home (nom + description, compatible filtres) |
| 2026-05-17 | Filtres unifiés catégories + tags -- déduplication, couleur propre par filtre |
| 2026-05-17 | Tags affichés en badges colorés en haut des fiches avec label "# tags" |
| 2026-05-17 | deploy.yml : concurrency cancel-in-progress pour éviter les doubles builds (push + n8n) |
| 2026-05-17 | Réorganisation drag & drop ajoutée sur l'onglet LLMs (fonctions JS génériques) |
| 2026-05-17 | SEO/GEO complet : robots.txt, sitemap, OG, Schema.org, llms.txt dynamique, IndexNow, favicon noir/blanc, H2 answer-ready, BingSiteAuth |
| 2026-05-17 | Mentions légales propres à ia.duale.fr -- pas de renvoi vers cv-robin |
| 2026-05-17 | Footer : LinkedIn + cv-robin.duale.fr + Mentions légales (maillage SEO vers CV) |
| 2026-05-17 | IndexNow clé fff05dc2d2973f558bcd5cf3cb8ceee8 -- ping automatique après chaque déploiement |
| 2026-05-17 | Sitemap soumis à Bing Webmaster Tools |
| 2026-05-17 | Système admin : boutons admin masqués, auth via GitHub PAT + cookie .duale.fr partagé (SSO) |
| 2026-05-17 | Décision : pas de clé locale dans le code public -- seul le token GitHub fait foi |
| 2026-05-17 | Sync JOURNAL.md -> Notion : sous-page créée automatiquement dans "Outils IA et No Code", workflow déclenché sur push touchant JOURNAL.md, lib @tryfabric/martian pour la conversion markdown -> blocs Notion |
