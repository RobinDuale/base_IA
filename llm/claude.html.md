# Claude

> LLM d'Anthropic, connu pour son raisonnement rigoureux, son respect des instructions et sa capacité à traiter de très longs documents. Disponible en trois niveaux : Haiku (rapide), Sonnet (équilibré), Opus (puissant).

## Résumé

- Type : LLM
- Catégorie : LLMs
- Niveau : Débutant
- Gratuité : Accès à Claude Sonnet en conversation illimitée (avec limites de fréquence en cas d'usage intensif). Pas de Projects ni de mémoire persistante sur le plan gratuit. Pas d'accès à Claude Opus.
- Site officiel : https://claude.ai
- Tags : IA
- Fiche HTML : https://ia.duale.fr/llm/claude.html


## Quand utiliser Claude

Pour les tâches qui demandent de la précision et de la fiabilité : analyse de documents longs, rédaction structurée, raisonnement complexe, code. Excellent quand on veut un modèle qui suit les instructions à la lettre sans dériver.


## Pourquoi utiliser Claude

Fenêtre de contexte très large (200 000 tokens -- l'équivalent d'un livre entier). Excellent en raisonnement, analyse et rédaction soignée. Très fiable dans le suivi des instructions. Réponses nuancées et honnêtes. API puissante pour les développeurs.


## Limites de Claude

Pas de recherche web native (sans outils tiers). Moins d'intégrations tierces que ChatGPT. Parfois plus prudent que nécessaire sur certains sujets.




## Modèle économique

Freemium. Claude.ai Pro à 20$/mois : accès à Opus, Projects, mémoire persistante, priorité serveur. API Anthropic : Haiku ($0.25/M tokens input), Sonnet ($3/M), Opus ($15/M).


## Quand payer

Passer au Pro quand on utilise Claude quotidiennement et qu'on atteint les limites du gratuit, ou qu'on a besoin des Projects pour organiser ses conversations par contexte.


## Alternatives

ChatGPT (OpenAI), Gemini (Google), Mistral, Llama (Meta)


## Complémentaire avec

n8n / Make (automatiser des appels API Claude), Notion (documenter les outputs), Apify (fournir des données à analyser).


## Scénario débutant

Rédiger un email professionnel, résumer un long document ou générer des idées de contenu en quelques secondes -- le point d'entrée le plus accessible de l'IA générative.


## Scénario intermédiaire

Exporter les données d'Airtable (prospects, statuts, notes) -> envoyer à Claude via n8n -> Claude génère un rapport de synthèse structuré en markdown -> n8n pousse le rapport dans Notion et notifie sur Slack.


## Scénario avancé

Apify scrape des avis clients et articles de presse sur un secteur -> Claude analyse et extrait des insights structurés -> Clay enrichit les entreprises identifiées comme opportunités -> n8n orchestre le pipeline -> résultats et plan d'action centralisés dans Notion.

