# Gemini

> LLM de Google, nativement intégré à Google Workspace (Docs, Sheets, Gmail, Drive). Gemini 1.5 Pro dispose d'une fenêtre de contexte de 1 million de tokens. Très fort en multimodal (texte, images, audio, vidéo).

## Résumé

- Type : LLM
- Catégorie : LLMs
- Niveau : Débutant
- Gratuité : Gemini 1.5 Flash illimité. Accès limité à Gemini 1.5 Pro. Intégration Workspace basique. Recherche Google intégrée dans les réponses.
- Site officiel : https://gemini.google.com
- Tags : IA
- Fiche HTML : https://ia.duale.fr/llm/gemini.html


## Quand utiliser Gemini

Quand on est dans l'écosystème Google et qu'on veut de l'IA directement dans Docs, Sheets ou Gmail. Ou quand on a besoin d'analyser de très longs documents (1M tokens) ou du contenu multimodal.


## Pourquoi utiliser Gemini

Intégration native avec Google Workspace. Fenêtre de contexte de 1 million de tokens (la plus grande du marché). Recherche Google intégrée. Très fort en multimodal. Gemini Advanced inclus avec Google One AI Premium.


## Limites de Gemini

Moins fiable que Claude sur le respect strict des instructions. Interface moins intuitive. Données potentiellement utilisées par Google. Moins de Custom GPTs / apps tierces que ChatGPT.




## Modèle économique

Freemium. Google One AI Premium (20$/mois) inclut Gemini Advanced et l'intégration Workspace complète. API : Gemini 1.5 Flash ($0.075/M tokens), Pro ($3.50/M).


## Quand payer

Si on utilise Google Workspace intensivement et qu'on veut l'IA intégrée dans Docs et Gmail, ou qu'on a besoin de Gemini 1.5 Pro pour des documents très longs.


## Alternatives

Claude (Anthropic), ChatGPT (OpenAI), Mistral


## Complémentaire avec

Google Workspace (Docs, Sheets, Gmail), Google Drive, n8n (via API Gemini).


## Scénario débutant

Analyser un PDF de 100 pages ou une image complexe et extraire les informations clés structurées -- fenêtre contextuelle d'1 million de tokens là où d'autres LLMs sont limités.


## Scénario intermédiaire

Apify scrape des pages produits concurrentes (texte + images) -> Gemini analyse le contenu multimodal -> génère des fiches comparatives structurées -> les données sont stockées dans Airtable pour analyse et aide à la décision.


## Scénario avancé

Gemini traite des rapports annuels PDF d'entreprises cibles -> extrait chiffres d'affaires, effectifs, orientations stratégiques -> Clay enrichit les contacts des décideurs identifiés -> Claude rédige des propositions personnalisées -> n8n orchestre le pipeline complet et notifie sur Slack.

