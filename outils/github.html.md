# GitHub

> GitHub est une plateforme qui héberge du code source et permet de versionner ses fichiers, collaborer avec d'autres développeurs et automatiser des tâches via GitHub Actions.

## Résumé

- Type : Outil IA et No-Code
- Catégorie : Productivité
- Niveau : Débutant
- Gratuité : Repos publics illimités. GitHub Pages inclus. 2 000 minutes GitHub Actions par mois. 500 Mo de stockage de packages. Repos privés illimités (collaborateurs limités à 3). GitHub Copilot gratuit pour les étudiants et open source.
- Site officiel : https://github.com
- Tags : Dev, Repository, Workflow
- Fiche HTML : https://ia.duale.fr/outils/github.html


## Quand utiliser GitHub

Dès qu'on écrit du code ou qu'on veut héberger un site statique gratuitement. Indispensable pour versionner ses fichiers, collaborer sur un projet, ou automatiser des déploiements. Le point d'entrée incontournable de tout projet technique.


## Pourquoi utiliser GitHub

Hébergement gratuit de code public, GitHub Pages pour les sites statiques, GitHub Actions pour l'automatisation CI/CD, écosystème énorme, GitHub Copilot pour l'IA.


## Limites de GitHub

Courbe d'apprentissage de Git au départ, interface parfois complexe pour un débutant, les repos privés ont des limites sur le plan gratuit pour les Actions.



## Exemples et workflows

Workflow Base IA : modification dans Notion → n8n détecte (poll horaire) → POST vers GitHub API → GitHub Actions déclenché → script Node.js lit Notion → génère les fichiers HTML → déploie sur gh-pages → site mis à jour sur ia.duale.fr en 2 minutes.


## Modèle économique

Freemium. Plans payants Team (4$/utilisateur/mois) et Enterprise pour les fonctionnalités collaboratives avancées : permissions granulaires, reviews obligatoires, audit log.


## Quand payer

Quand les repos privés deviennent nombreux, que les minutes GitHub Actions sont épuisées, ou qu'on a besoin de fonctionnalités avancées d'équipe (permissions, reviews obligatoires).


## Alternatives

GitLab, Bitbucket, Codeberg


## Complémentaire avec

n8n (déclenche les rebuilds via repository_dispatch), Notion (source de données du site Base IA), Node.js (script de build qui lit Notion et génère le HTML), Netlify (alternative pour l'hébergement).


## Scénario débutant

Versionner son code source : historique complet des modifications, retour arrière possible à tout moment, collaboration facilitée sans risque d'écraser le travail d'un autre.


## Scénario intermédiaire

Pousser du code sur GitHub -> GitHub Actions détecte le push -> lance automatiquement les tests -> si tout passe, déploie sur GitHub Pages. Déploiement continu sans intervention manuelle à chaque modification.


## Scénario avancé

Notion est modifié -> n8n détecte la modification via poll -> appelle l'API GitHub Actions (repository_dispatch) -> le workflow lit Notion, génère le HTML statique et déploie sur GitHub Pages. C'est exactement l'architecture de ce projet.

