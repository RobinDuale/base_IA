// sync-journal.js -- Synchronise JOURNAL.md vers une sous-page Notion
// Crée la page "Journal de bord - Base IA" à la première exécution,
// la met à jour à chaque push modifiant JOURNAL.md.

const { Client } = require("@notionhq/client");
const { markdownToBlocks } = require("@tryfabric/martian");
const fs = require("fs");
const path = require("path");

const NOTION_API_KEY = process.env.NOTION_API_KEY;
// Page parente "Outils IA et No Code" -- déjà accessible par l'intégration
const PARENT_PAGE_ID = "3625b86a8bb48046b4b9f1353db3287b";
const JOURNAL_TITRE = "Journal de bord - Base IA";

if (!NOTION_API_KEY) {
  console.error("Erreur : NOTION_API_KEY manquante.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

// Trouve la sous-page journal existante, ou la crée
async function trouverOuCreerPage() {
  const { results } = await notion.blocks.children.list({ block_id: PARENT_PAGE_ID });
  for (const block of results) {
    if (block.type === "child_page" && block.child_page.title === JOURNAL_TITRE) {
      console.log(`Page existante trouvée : ${block.id}`);
      return block.id;
    }
  }
  console.log("Création de la page journal dans Notion...");
  const page = await notion.pages.create({
    parent: { page_id: PARENT_PAGE_ID },
    properties: {
      title: { title: [{ text: { content: JOURNAL_TITRE } }] },
    },
  });
  console.log(`Page créée : ${page.id}`);
  return page.id;
}

// Supprime tous les blocs existants (pagination incluse)
async function viderPage(pageId) {
  let cursor;
  do {
    const { results, next_cursor, has_more } = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });
    for (const block of results) {
      await notion.blocks.delete({ block_id: block.id });
    }
    cursor = has_more ? next_cursor : undefined;
  } while (cursor);
}

async function syncJournal() {
  const markdown = fs.readFileSync(
    path.join(__dirname, "..", "JOURNAL.md"),
    "utf8"
  );
  const blocks = markdownToBlocks(markdown);
  console.log(`${blocks.length} blocs générés depuis JOURNAL.md`);

  const pageId = await trouverOuCreerPage();

  console.log("Vidage de la page en cours...");
  await viderPage(pageId);

  // L'API Notion accepte max 100 blocs par requête
  for (let i = 0; i < blocks.length; i += 100) {
    const chunk = blocks.slice(i, i + 100);
    await notion.blocks.children.append({ block_id: pageId, children: chunk });
    console.log(`Blocs ${i + 1}-${Math.min(i + 100, blocks.length)} ajoutés`);
  }

  console.log("Sync terminé -- JOURNAL.md est à jour dans Notion.");
}

syncJournal().catch((err) => {
  console.error("Erreur lors du sync :", err.message);
  process.exit(1);
});
