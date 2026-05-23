# Apify

> Apify est une plateforme de scraping et d’automatisation qui permet de récupérer automatiquement des données sur Internet via des robots appelés Actors.

## Résumé

- Type : Outil IA et No-Code
- Catégorie : No-Code
- Niveau : Intermédiaire
- Gratuité : 5$ de crédits de calcul offerts par mois (environ 10h de scraping léger). Accès à tous les Actors publics de la bibliothèque. 1 Go de stockage de données. Rétention de 30 jours. Suffisant pour tester les concepts et expérimenter les Actors existants.
- Site officiel : https://apify.com
- Tags : Scraping, Automation, Data, No-Code
- Fiche HTML : https://ia.duale.fr/outils/apify.html


## Quand utiliser Apify

Quand tu as besoin de récupérer des données sur Internet de façon automatisée : scraper des annuaires, LinkedIn, Google Maps, des sites web publics. Idéal pour la veille sectorielle et la prospection à grande échelle. À préférer à un scraping manuel dès que le volume dépasse quelques dizaines de pages.


## Pourquoi utiliser Apify

Très puissant, bibliothèque importante d’Actors prêts à l’emploi, adapté à la veille et à la prospection automatisée, intégrable avec Airtable et Make.


## Limites de Apify

Peut devenir technique pour un débutant, certains sites sont difficiles à scraper, les coûts augmentent avec les volumes et automatisations importantes.



## Exemples et workflows

Workflow type : Google Maps / annuaires / sites web → Apify → Airtable → Make → ChatGPT → Notion. Exemple : scraping d’entreprises B2B dans une région pour construire une base de sourcing PME.


## Modèle économique

Freemium basé sur la consommation de ressources (calcul, stockage, proxies). Plans payants à partir de 49$/mois pour plus de crédits et de stockage. Le coût réel dépend du volume et de la fréquence des extractions.


## Quand payer

Commencer gratuitement pour apprendre les concepts de scraping et tester des Actors existants. Passer au payant quand les extractions deviennent régulières, stratégiques ou qu’elles font gagner du temps de manière répétée.


## Alternatives

PhantomBuster, Browse AI, Octoparse


## Complémentaire avec

Airtable (reçoit les données extraites et les structure), Make / n8n (orchestre les extractions et distribue les données), Clay (enrichit les leads collectés par Apify), ChatGPT (analyse et qualifie les données extraites).


## Scénario débutant

Scraper les 50 derniers avis Google d'un concurrent pour analyser les points forts et les plaintes récurrentes -- extraction de données publiques en quelques minutes sans code.


## Scénario intermédiaire

Apify scrape les offres d'emploi d'entreprises cibles -> les données brutes sont envoyées à Claude via n8n -> Claude synthétise les signaux d'achat (recrutements tech, expansion) -> résultats stockés dans Notion.


## Scénario avancé

Apify scrape LinkedIn + sites web de prospects cibles -> Clay enrichit les profils avec coordonnées et données firmographiques -> Claude génère des messages de prospection ultra-personnalisés -> n8n orchestre l'envoi -> Airtable trace les réponses et met à jour les statuts.

