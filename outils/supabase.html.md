# Supabase

> Supabase est une plateforme de développement open-source qui remplace Firebase en utilisant PostgreSQL comme moteur de base de données. Elle fournit automatiquement une API instantanée, l'authentification des utilisateurs, le stockage de fichiers et des fonctions serveur (Edge Functions) pour construire des applications web et mobiles rapidement.

## Résumé

- Type : Outil IA et No-Code
- Catégorie : No-Code
- Niveau : Intermédiaire
- Gratuité : Offre gratuite généreuse incluant une base de données 500Mo, l'authentification jusqu'à 50 000 utilisateurs actifs mensuels et le stockage de fichiers.
- Site officiel : https://supabase.com/
- Tags : Database, Backend, API, Hosting, No-Code
- Fiche HTML : https://ia.duale.fr/outils/supabase.html


## Quand utiliser Supabase

Choisir Supabase quand vous avez besoin d'une base de données relationnelle robuste, évolutive et que vous voulez éviter de configurer manuellement un backend complexe.


## Pourquoi utiliser Supabase

Base de données relationnelle puissante (PostgreSQL) facile à utiliser. Gestion native de l'authentification et de la sécurité Row Level Security. Auto-génération d'API REST et GraphQL à partir du schéma de données.


## Limites de Supabase

Courbe d'apprentissage plus élevée pour ceux qui ne connaissent pas le SQL. La gestion des relations complexes demande une bonne modélisation de base de données. Moins de flexibilité sur les accès bas niveau au serveur que sur une instance AWS propre.



## Exemples et workflows

Workflow : Envoyer un email de bienvenue automatique via Resend dès qu'un utilisateur s'inscrit dans la base de données Supabase.


## Modèle économique

Modèle freemium basé sur la consommation des ressources et le stockage des données.


## Quand payer

Passer à l'offre payante lorsque vous dépassez les limites de stockage, que vous avez besoin de sauvegardes quotidiennes ou de fonctions serveur plus poussées.


## Alternatives

Firebase est l'alternative classique basée sur NoSQL par Google. PocketBase est une solution tout-en-un ultra-légère et auto-hébergeable. Appwrite offre une alternative open-source similaire avec une interface de gestion simplifiée.


## Complémentaire avec

FlutterFlow permet de créer des interfaces graphiques complexes connectées à Supabase. Make facilite l'automatisation de tâches à partir des changements effectués dans vos tables Supabase. LangChain permet de stocker des embeddings pour des applications IA avancées.


## Scénario débutant

1. Créer un projet sur Supabase et définir une table 'Tâches'. 2. Ajouter des données manuellement via l'interface. 3. Utiliser l'API générée pour afficher ces données sur un site web simple.


## Scénario intermédiaire

1. Connecter FlutterFlow à Supabase pour créer une interface utilisateur. 2. Configurer l'authentification Supabase pour sécuriser les accès. 3. Créer une fonction 'Edge Function' pour déclencher une notification lors d'une mise à jour de données.


## Scénario avancé

1. Utiliser le 'pgvector' de Supabase pour stocker des vecteurs de documents. 2. Créer une automatisation avec LangChain qui interroge ces données pour répondre à des questions via un chatbot. 3. Synchroniser les données en temps réel avec un dashboard via les webhooks de Supabase.

