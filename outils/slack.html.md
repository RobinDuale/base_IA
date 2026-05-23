# Slack

> Plateforme de messagerie professionnelle organisée en canaux thématiques. Permet la communication d'équipe en temps réel, l'intégration d'outils externes et la réception de notifications automatisées depuis des workflows.

## Résumé

- Type : Outil IA et No-Code
- Catégorie : Productivité
- Niveau : Débutant
- Gratuité : Messages illimités avec historique des 90 derniers jours. 10 intégrations d'applications. Appels audio et vidéo 1:1. Canaux publics et privés illimités. Suffisant pour un usage solo ou une petite équipe.
- Site officiel : https://slack.com
- Tags : Collaboration, Chat, Workflow
- Fiche HTML : https://ia.duale.fr/outils/slack.html


## Quand utiliser Slack

Quand on travaille en équipe et qu'on veut centraliser les communications, éviter les emails et recevoir des notifications d'outils (GitHub, Notion, n8n, alertes métier) directement dans un canal dédié.


## Pourquoi utiliser Slack

Organisation par canaux et fils de discussion. Plus de 2 500 intégrations disponibles. Webhooks entrants pour recevoir des notifications depuis n'importe quel outil. Recherche dans l'historique. Appels intégrés. Bots et automatisations natives.


## Limites de Slack

Historique limité à 90 jours sur le plan gratuit. Peut devenir chronophage et source de distractions. Coût élevé à grande échelle (facturation par utilisateur). Moins adapté que Notion pour la documentation long terme.




## Modèle économique

Freemium. Plans payants : Pro (7.25$/utilisateur/mois), Business+ (12.50$/utilisateur/mois). Le coût scale avec la taille de l'équipe.


## Quand payer

Quand l'historique à 90 jours devient insuffisant, qu'on a besoin de plus de 10 intégrations, ou qu'on utilise Slack comme outil de production critique pour une équipe.


## Alternatives

Microsoft Teams, Discord (moins formel), Google Chat, Mattermost (open source auto-hébergé)


## Complémentaire avec

n8n / Make (envoie des notifications Slack depuis des workflows automatisés), GitHub (alertes de build et de déploiement), Notion (updates de pages dans un canal Slack).


## Scénario débutant

Créer des canaux dédiés par projet pour centraliser les échanges et éviter les emails -- notifications en temps réel, historique consultable, partage de fichiers intégré.


## Scénario intermédiaire

n8n surveille les événements clés (nouveau prospect Airtable, build GitHub terminé, alerte Apify) -> formate un message structuré -> envoie une notification dans le bon canal Slack avec résumé actionnable.


## Scénario avancé

Claude analyse les messages du canal #support (sentiment, récurrence des problèmes) -> catégorise automatiquement -> crée des tickets priorisés dans Airtable -> envoie une synthèse quotidienne dans #digest -> Apify scrape des forums pour enrichir la base de réponses types.

