# Netlify

> Netlify est une plateforme d’hébergement et de déploiement de sites web modernes et d’applications front-end.

## Résumé

- Type : Outil IA et No-Code
- Catégorie : No-Code
- Niveau : Débutant
- Gratuité : Sans carte bancaire. Sites et dépôts illimités (1 membre d'équipe). CDN mondial, HTTPS/SSL automatique, domaine personnalisé, déploiement continu depuis Git. Limites mensuelles : - 100 Go de bande passante - 300 minutes de build (300 crédits) - 125 000 invocations de fonctions serverless - 1 million d'invocations Edge Functions - 10 Go de stockage (Blob storage) - 1 build concurrent Inclus en plus : Netlify Database (Postgres, version de base), règles de trafic et rate limiting basique, prévisualisations illimitées par branche/PR. Si les limites sont dépassées : le site est mis en pause jusqu'au mois suivant. Netlify prévient à 50%, 75%, 90% et 100% des limites.
- Site officiel : https://www.netlify.com
- Tags : Hosting, Deployment, No-Code
- Fiche HTML : https://ia.duale.fr/outils/netlify.html


## Quand utiliser Netlify

Quand tu veux héberger un site statique, une landing page ou une application front-end sans gérer de serveur. Bonne alternative à GitHub Pages quand tu as besoin de fonctionnalités supplémentaires : formulaires intégrés, fonctions serverless, previews par branche, ou rollback facile.


## Pourquoi utiliser Netlify

Très simple pour déployer rapidement un site moderne, bon pour les débutants, très utilisé avec les outils front-end modernes.


## Limites de Netlify

Ce n’est pas un outil métier ni une base de données. Netlify sert surtout à publier et héberger une interface web.



## Exemples et workflows

Workflow déploiement classique : code source sur GitHub → push sur main → Netlify détecte le changement → rebuild automatique → site mis en ligne en moins d'une minute. Workflow formulaire : visiteur soumet un formulaire Netlify → données envoyées par webhook vers Airtable ou Notion.


## Modèle économique

Freemium SaaS avec 4 plans : - Free : gratuit, 1 membre, limites mensuelles généreuses (voir Gratuité) - Pro : 19$/mois par membre -- 1 To de bande passante, 25 000 minutes de build, 3 builds simultanés, analytics, previews avancées - Enterprise : tarif sur mesure -- SAML SSO, SLA garanti, support dédié, logs d'audit Attention : le plan Pro est facturé par membre d'équipe -- coût qui monte vite à plusieurs.


## Quand payer

Rester sur le gratuit pour des projets personnels, portfolios, prototypes et petits sites commerciaux -- les limites sont généreuses et rarement atteintes en solo. Passer au Pro (19$/mois/membre) quand le site reçoit du trafic réel dépassant 100 Go/mois, ou quand on travaille en équipe avec plusieurs membres. Si le site est mis en pause en fin de mois, c'est le signal pour passer au Pro.


## Alternatives

Vercel, Cloudflare Pages


## Complémentaire avec

GitHub (source du code, déclenche le déploiement à chaque push), Make / n8n (peut déclencher un rebuild via webhook Netlify), Airtable / Notion (sources de données pour des sites générés dynamiquement).


## Scénario débutant

Glisser-déposer un dossier HTML/CSS/JS sur l'interface Netlify -> le site est en ligne en 30 secondes avec HTTPS automatique et CDN mondial, sans configuration serveur.


## Scénario intermédiaire

Connecter un repo GitHub à Netlify -> chaque push sur main déclenche un build automatique -> une URL de prévisualisation unique est générée pour chaque Pull Request avant le merge en production.


## Scénario avancé

GitHub Actions génère les fichiers statiques (script Node.js lisant Notion) -> déclenche le déploiement Netlify via webhook -> Netlify gère le CDN, les redirections et le SSL -> n8n surveille le statut et alerte sur Slack en cas d'échec de build.

