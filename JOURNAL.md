# Journal de bord -- Projet Base IA

Ce fichier retrace toutes les étapes de construction du projet, dans l'ordre chronologique.
Il est mis à jour au fur et à mesure de l'avancement.

---

## Contexte et objectif

Site web personnel de Robin Duale sur les outils IA et No Code du marché.
Les données sont stockées et mises à jour dans Notion. Le site les affiche automatiquement.

**Objectif pédagogique :** apprendre Git, GitHub, les APIs, le HTML/CSS/JS et le déploiement.

---

## Architecture choisie

```
Notion (source de données, mis à jour manuellement)
        |
        | Webhook Notion (notification automatique à chaque modification)
        |
GitHub Actions (reconstruit le site depuis Notion)
        |
        | Génère les fichiers HTML statiques
        |
GitHub Pages (hébergement gratuit)
        |
[sous-domaine].duale.fr
```

**Pourquoi cette architecture :**
- 100% gratuit
- Domaine personnalisé duale.fr supporté par GitHub Pages
- Pseudo temps réel : ~1-2 minutes entre une modif Notion et la mise à jour du site
- Projet pédagogique : on apprend chaque brique une par une

**Ce qu'on apprend avec ce projet :**
- Git et GitHub (versionner du code, pousser des modifications)
- Les APIs (comment deux services communiquent entre eux)
- GitHub Actions (automatiser des tâches dans le cloud)
- HTML/CSS/JS (construire et mettre en page un site)
- Les webhooks (notifier un service quand quelque chose change)
- Le déploiement (mettre un site en ligne)

---

## Etapes réalisées

### 2026-05-16 -- Initialisation du projet

#### 1. Création du repo GitHub
- Repo créé : https://github.com/RobinDuale/base_IA
- Visibilité : public
- Cloné en local : `C:\Users\robin\ClaudeDevRepo\Base_IA`

#### 2. Exploration de Notion
- Espace identifié : "Outils IA et No Code"
- Base de données principale : "Outils" avec les propriétés suivantes :
  - Nom, Catégorie, Niveau, Priorité, Statut d'apprentissage
  - Description simple, Avantages, Limites, Cas d'usage, Cas d'usage pour moi
  - Alternatives, Modèle économique, Quand payer, Lien officiel
  - Notes personnelles, Tags
- Outils déjà présents : Apify, Netlify, Notion, Airtable

#### 3. Création de la clé API Notion
- Intégration créée sur le portail développeurs Notion
- Nom : `Base IA - GitHub`
- Type : Jeton d'accès (interne)
- Espace associé : Espace de Robin Duale
- **A faire** : connecter l'intégration à la page "Outils IA et No Code" dans Notion

#### 4. Stockage sécurisé du token
- Token Notion stocké dans GitHub Secrets
- Nom du secret : `NOTION_API_KEY`
- URL : https://github.com/RobinDuale/base_IA/settings/secrets/actions
- Le token ne sera jamais écrit en clair dans le code

#### 5. Connexion de l'intégration Notion à la page
- Ouvert la page "Outils IA et No Code" dans Notion
- Cliqué sur `...` -> Connexions -> activé "Base IA - GitHub"
- Sans cette étape, le script ne peut pas lire les données (erreur "object_not_found")

#### 6. Construction du projet

Fichiers créés :
- `CNAME` -- contient `ia.duale.fr` pour que GitHub Pages sache quel domaine servir
- `.gitignore` -- exclut `node_modules/`, `.env` et `dist/` du repo GitHub
- `package.json` -- déclare la dépendance `@notionhq/client` (le client officiel Notion)
- `scripts/build.js` -- script principal qui lit Notion et génère le HTML
- `src/styles.css` -- mise en page du site (thème sombre, grille de cartes, filtres)

Le script `build.js` fait 6 choses dans l'ordre :
1. Se connecte à Notion avec la clé API
2. Récupère tous les outils de la base de données
3. Cree le dossier `dist/`
4. Génère `dist/index.html` (liste avec filtres par catégorie)
5. Génère une page `dist/outils/[nom].html` pour chaque outil
6. Copie le CNAME et le CSS dans `dist/`

#### 7. Premier build réussi
- Commande : `node scripts/build.js`
- Résultat : 4 outils récupérés depuis Notion, 5 fichiers HTML générés
- Site vérifié visuellement dans le navigateur -- affichage correct

#### 8. Mise en place du CLAUDE.md et JOURNAL.md
- Fichier `CLAUDE.md` créé : instructions pour Claude (architecture, règles, SEO/GEO)
- Fichier `JOURNAL.md` créé : journal de bord humain (ce fichier)
- Les deux sont mis à jour en continu à chaque étape

#### 9. GitHub Actions -- workflow de déploiement
- Fichier `.github/workflows/deploy.yml` créé
- Le workflow se déclenche sur : push sur main, webhook externe, schedule horaire
- Etapes du workflow : checkout -> install Node -> build -> deploy sur gh-pages
- Problème rencontré : échec du déploiement par manque de permissions
- Correction : ajout de `permissions: contents: write` dans le workflow
- Résultat : branche `gh-pages` créée automatiquement par le workflow

#### 10. Activation de GitHub Pages
- GitHub Pages activé via l'API GitHub (gh CLI)
- Source : branche `gh-pages`, dossier racine
- Domaine personnalisé `ia.duale.fr` reconnu automatiquement
- Certificat SSL en cours de génération (quelques minutes)

#### 11. Premier push sur GitHub
- Commit initial : tous les fichiers du projet poussés sur main
- Le workflow GitHub Actions s'est déclenché automatiquement
- Le site est maintenant accessible sur `ia.duale.fr`

#### 12. Mise à jour de projets.duale.fr
- Page `projets.duale.fr` mise à jour avec une carte "Base IA" pointant vers `ia.duale.fr`
- Bloc "Prochain projet" conservé comme placeholder pour le futur
- Repo `RobinDuale.github.io` cloné en local : `C:\Users\robin\ClaudeDevRepo\projets-duale`
- `CLAUDE.md` créé pour ce repo également

#### 13. Workflow n8n -- Notion vers GitHub Actions
- Workflow créé dans n8n : "Notion -> GitHub Actions : Base IA"
- URL n8n : https://n8n.srv1161197.hstgr.cloud/workflow/ujrE1EVLlrEZL9yW
- Noeud 1 "Notion - Outils modifie" : credential Notion configuré, event = "Page Updated in Database", poll toutes les minutes -- TEST OK
- Noeud 2 "Declencher GitHub Actions" : credential GitHub Bearer Auth configuré (token "n8n - Base IA webhook"), header Accept OK

#### 14. Resolution du problème n8n -- body de la requete GitHub
- **Problème :** le champ "Specify Body" dans n8n était bloqué en mode expression, envoyant le body incorrectement -> erreur 422 de GitHub
- **Solution :** dans le noeud HTTP Request, choisir "Body Content Type = Raw", "Content Type = application/json", puis coller `{"event_type":"notion-update"}` directement dans le champ Body
- **Test reussi :** execution manuelle -> n8n affiche "This is an item, but it's empty" avec coche verte
- **Pourquoi "empty" = succes :** GitHub renvoie HTTP 204 No Content pour repository_dispatch. Le code 204 signifie "j'ai recu ta demande et je l'execute" -- pas de corps dans la reponse, ce qui est normal. N8n affiche un item vide parce qu'il n'y a rien a afficher.

#### 15. Activation du workflow n8n et ajustements
- Workflow n8n activé (toggle ON) via le MCP n8n directement depuis Claude
- Poll réduit de toutes les minutes à toutes les heures (suffisant, moins de charge serveur)
- Outil "GitHub" ajouté dans la base Notion pour tester le cycle complet
- Fiche Notion mise à jour pour y mentionner son rôle dans ce projet

#### 16. Barre de navigation latérale sur les fiches outils
- Ajout d'un bandeau gauche fixe sur toutes les pages de fiche outil
- Liste tous les outils avec lien cliquable -- l'outil courant est mis en évidence en bleu
- Sur mobile : la barre devient un bandeau de tags horizontaux cliquables au-dessus du contenu
- Implémentation : `genererPageOutil()` reçoit maintenant la liste complète des outils en paramètre

#### 18. Réorganisation des cartes par glisser-déposer

- Propriété "Ordre" (type number) ajoutée dans la base Notion Outils
- Ordre initial défini : Airtable=1, Apify=2, GitHub=3, Netlify=4, Notion=5
- `build.js` mis à jour :
  - `extraireTexte()` gère maintenant le type "number" (retourne null si vide, pas une chaîne vide)
  - `recupererOutils()` extrait le champ `ordre` et trie les outils par Ordre (nulls en dernier, puis par nom alphabétique)
  - Les cartes ont maintenant un attribut `data-notion-id` pour identifier chaque outil côté client
  - La page d'accueil inclut SortableJS (CDN) pour le drag & drop
- Interface ajoutée sur la home :
  - Bouton "Réorganiser" : active le mode glisser-déposer sur la grille
  - En mode réorganisation : les cartes sont déplaçables, curseur "grab"
  - Bouton "Sauvegarder l'ordre" : envoie le nouvel ordre au webhook n8n
  - Bouton "Annuler" : remet les cartes dans l'ordre initial sans sauvegarder
- Workflow n8n créé : "Reorder outils - Base IA" (ID: xRKkzmkpVcsjikNG)
  - Webhook POST `/base-ia-reorder` : reçoit `{ordre: [{id, ordre}, ...]}`
  - Code node : décompose le tableau en items individuels
  - HTTP Request (Notion) : met à jour la propriété Ordre de chaque page
  - HTTP Request (GitHub) : déclenche un rebuild (executeOnce pour ne lancer qu'un seul build)
- **Credentials à configurer manuellement dans n8n** après chaque update du workflow :
  - Noeud "Update Notion page" : sélectionner le credential Notion API existant
  - Noeud "Trigger GitHub Actions" : sélectionner le credential Bearer Auth existant

**Pourquoi cette architecture :**
Notion est la source de vérité pour l'ordre des outils -- ainsi l'ordre est conservé entre les sessions et identique sur tous les appareils. Le site affiche toujours les outils dans l'ordre défini dans Notion. L'utilisateur réorganise via l'interface web, et l'ordre est persisté dans Notion automatiquement.

#### 17. Bouton de mise à jour manuelle du site
- Ajout d'un bouton "Mettre à jour le site" dans le footer de toutes les pages
- Clic -> appel du webhook n8n -> GitHub Actions reconstruit le site depuis Notion
- Webhook n8n ajouté au workflow existant : `https://n8n.srv1161197.hstgr.cloud/webhook/base-ia-refresh`
- Le build génère maintenant un fichier `dist/version.json` avec l'horodatage du build
- Le bouton poll `version.json` toutes les 10 secondes apres le clic : quand le timestamp est plus récent que le clic, il affiche "Site mis à jour !" puis se remet en état normal après 4 secondes
- Timeout de 5 minutes si le build ne répond pas

---

## Etapes à venir

- [x] Vérifier que Node.js est installé -- version 24.14.1
- [x] Choisir le sous-domaine -- `ia.duale.fr`
- [x] Configurer le DNS -- CNAME `ia.duale.fr` -> `robinduale.github.io`
- [x] Connecter l'intégration Notion à la page "Outils IA et No Code"
- [x] Créer la structure du projet (dossiers et fichiers)
- [x] Ecrire le script Node.js qui lit Notion et génère le HTML
- [x] Tester le build en local -- 4 outils récupérés, pages vérifiées dans le navigateur
- [x] Configurer GitHub Actions (deploy.yml)
- [x] Activer GitHub Pages sur le repo
- [x] Référencer le projet sur projets.duale.fr
- [x] Finaliser le workflow n8n (credentials + body corrigé, test reussi)
- [x] Activer le workflow n8n (toggle ON) -- fait via MCP n8n
- [x] Ajouter la navigation latérale sur les fiches outils
- [x] Ajouter le bouton de mise à jour manuelle avec détection de fin de build
- [x] Ajouter la réorganisation des cartes par glisser-déposer avec sauvegarde dans Notion
- [x] Configurer les credentials n8n sur le workflow "Reorder outils" -- credential "Header Auth account" avec Name=Authorization (z), Value=Bearer ntn_...
- [ ] Tester le cycle complet : modif Notion -> n8n -> GitHub Actions -> site mis à jour
- [ ] Vérifier les credentials n8n après chaque mise à jour du workflow
- [ ] Affiner la mise en page CSS

---

## Concepts appris

### L'API Notion
Une API (Application Programming Interface) est une "porte d'entrée" qui permet à un programme
d'accéder aux données d'un autre service. Ici, notre script Node.js va "frapper à la porte"
de Notion et demander la liste des outils. Notion répond avec les données.

Pour avoir le droit d'entrer, il faut une clé (le token `secret_...`). C'est comme un badge d'accès.

### GitHub Secrets
Les tokens et mots de passe ne doivent jamais être écrits dans le code (le repo est public).
GitHub Secrets est un coffre-fort intégré à GitHub : on y stocke les informations sensibles,
et GitHub les injecte automatiquement dans les scripts au moment de l'exécution.

### GitHub Actions
Un système d'automatisation intégré à GitHub. On écrit des "workflows" (des instructions)
qui se déclenchent automatiquement sur des événements : un push, un webhook, une heure fixe...
Ici, il reconstruira le site chaque fois que Notion envoie une notification.

### Les webhooks
Plutôt que de demander à GitHub "est-ce que Notion a changé ?" toutes les minutes (polling),
on configure Notion pour qu'il envoie lui-même un signal quand une modification est faite.
C'est plus efficace et plus rapide. C'est ça un webhook : une notification automatique d'un
service vers un autre.

### n8n comme relay
n8n est un outil d'automatisation (comme Zapier ou Make) qu'on héberge soi-même.
Dans ce projet, il joue le rôle de "traducteur" entre Notion et GitHub :
- Il surveille la base Notion toutes les minutes
- Quand il détecte un changement, il appelle l'API GitHub
- GitHub Actions se déclenche et reconstruit le site
Sans n8n, il faudrait un serveur dédié pour recevoir les webhooks -- n8n remplace ce serveur.

### GitHub Pages et la branche gh-pages
GitHub Pages sert les fichiers d'une branche spécifique du repo.
Dans ce projet, on utilise la branche `gh-pages` qui est créée et mise à jour
automatiquement par GitHub Actions à chaque build. On ne la touche jamais manuellement.
La branche `main` contient le code source, la branche `gh-pages` contient le site généré.
