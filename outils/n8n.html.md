# n8n

> Plateforme d’automatisation open source permettant de connecter des applications et créer des workflows sans coder.

## Résumé

- Type : Outil IA et No-Code
- Catégorie : No-Code
- Niveau : Intermédiaire
- Gratuité : Version cloud : 5 workflows actifs, 2 500 exécutions par mois. Community Edition (auto-hébergée) : workflows et exécutions illimités, mais serveur à gérer soi-même. Dans ce projet, n8n est auto-hébergé sur un VPS -- usage illimité sans frais de licence.
- Site officiel : https://n8n.io
- Tags : Automation, Workflow, Self-hosted, API, No-Code
- Fiche HTML : https://ia.duale.fr/outils/n8n.html


## Quand utiliser n8n

Quand tu veux des automatisations complexes, auto-hébergées ou à grande échelle. Préférable à Make quand tu veux plus de contrôle technique, moins de coûts fixes à long terme, ou des workflows avec beaucoup d'étapes et de logique conditionnelle.


## Pourquoi utiliser n8n

Très flexible, puissant, moins coûteux à grande échelle, possibilité d’auto-hébergement.


## Limites de n8n

Plus technique que Make ou Zapier, demande un peu de logique workflow.



## Exemples et workflows

Workflow Base IA actuel : Notion Trigger (poll horaire) → HTTP Request POST vers GitHub API → rebuild du site. Workflow prospection type : Apify scrape un annuaire → n8n transforme les données → insère dans Airtable → envoie une notification email avec les nouveaux leads.


## Modèle économique

Open source avec version cloud payante : Starter (20$/mois), Pro (50$/mois). L'auto-hébergement via la Community Edition est gratuit et illimité, mais nécessite un serveur (VPS à ~5-10$/mois).


## Quand payer

Quand les workflows deviennent critiques, nombreux ou que l’auto-hébergement devient trop complexe à gérer.


## Alternatives

Make, Zapier, Pipedream


## Complémentaire avec

Apify (déclenche des extractions ou reçoit les résultats), Airtable (met à jour des données automatiquement), Notion (surveillance et synchronisation), GitHub (déclenche les builds), OpenAI/ChatGPT (enrichissement IA dans les workflows).


## Scénario débutant

Créer un workflow qui envoie une notification Slack à chaque nouveau contact ajouté dans Airtable -- relier deux outils sans écrire une ligne de code via l'interface visuelle de n8n.


## Scénario intermédiaire

n8n surveille la base Notion toutes les heures -> détecte les modifications -> appelle l'API GitHub Actions -> GitHub reconstruit le site automatiquement. C'est exactement l'architecture de ce projet : n8n comme relay entre Notion et GitHub.


## Scénario avancé

Apify scrape des données -> n8n reçoit les résultats via webhook -> les envoie à Claude pour analyse -> Clay enrichit les profils identifiés -> n8n distribue les leads qualifiés dans Airtable et notifie sur Slack. n8n est le chef d'orchestre de tout le pipeline.

