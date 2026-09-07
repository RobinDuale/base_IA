# Refonte Base IA

Trois passes :

## 📁 Passe 1 — La home — faite, mergée sur `main`
- `styles.css` — feuille de style complète, déjà dans `src/styles.css`
- `build-patch.md` — modifications déjà appliquées dans `genererPageAccueil()`

## 📁 Passe 2 — La fiche détaillée
- `styles-fiche-additions.css` — règles CSS à **append** à la fin de `src/styles.css`
- `build-patch-fiche.md` — modifications dans `genererPageDetail()`

## 📁 Passe 3 — Pages SEO + mentions légales + confirmation
- `styles-pages-additions.css` — règles CSS à **append** à la fin de `src/styles.css`
- `build-patch-pages.md` — modifications dans `genererPagePositionnement()`, `genererMentionsLegales()`, `genererPageConfirmation()`

## Procédure (Passes 2 et 3 restantes)

1. **Travaille dans une branche** dédiée à la passe (ex. `redesign-fiche`).

2. **Applique les règles CSS d'append** du dossier de la passe à la fin de `src/styles.css`.

3. **Modifie `scripts/build.js`** en suivant le `build-patch-*.md` correspondant.

4. **Teste en local** :
   ```bash
   npm run build
   ```
   Puis ouvre `dist/index.html` dans un navigateur.

5. **Si tu veux comparer** : tu peux ouvrir la version en ligne sur `https://ia.duale.fr` en parallèle.

6. **Quand c'est bon** :
   ```bash
   git add src/styles.css scripts/build.js
   git commit -m "Refonte fiche/pages : ..."
   git push origin <branche>
   ```
   Puis merge sur `main` quand tu es prêt — GitHub Actions déploiera automatiquement.

## Notes importantes

- **La nouvelle CSS est compatible avec les autres pages** (fiche, mentions, etc.) — elles s'afficheront proprement avec des valeurs par défaut.
- **La fiche détaillée a besoin d'une seconde passe** pour exploiter toute la nouvelle CSS (eyebrow, lede, sections colorées, etc.). On fera ça dans un second commit quand la home te conviendra.
- **Toutes les fonctionnalités sont préservées** : SEO, schema.org, mode admin, drag & drop, formulaire de proposition, refresh, recherche, filtres.

## Si quelque chose casse

Rollback :
```bash
git checkout main
```

Et signale-moi le problème avec un screenshot ou la console du navigateur.
