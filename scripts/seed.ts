// Legt die Datenbank neu an: Schema, Dokumente, Beziehungen, Embeddings.
import { readFile, rm } from "node:fs/promises";
import { closeAndExit, open } from "./lib/db.ts";

await rm(".data", { recursive: true, force: true });
const db = await open();

const content = JSON.parse(await readFile("data/content.json", "utf8"));
const { vectors } = JSON.parse(await readFile("data/embeddings.json", "utf8"));

await db.query(await readFile("db/schema.surql", "utf8"));
console.log("✓ Schema");

await db.query(
  `
  FOR $a IN $authors { CREATE type::record("person", $a.id) SET name = $a.name, role = $a.role; };
  FOR $t IN $tags    { CREATE type::record("tag", $t.id) SET label = $t.label; };
  FOR $f IN $follows {
    LET $from = type::record("person", $f[0]);
    LET $to = type::record("person", $f[1]);
    RELATE $from->follows->$to;
  };
  FOR $r IN $tagRelations {
    LET $from = type::record("tag", $r[0]);
    LET $to = type::record("tag", $r[1]);
    RELATE $from->related_to->$to;
  };
  `,
  content,
);

console.log("✓ Personen, Tags, Beziehungen");
for (const a of content.articles) {
  await db.query(
    `
    LET $article = CREATE ONLY type::record("article", $id) SET
      title = $title, summary = $summary, content = $content,
      metadata = $metadata, embedding = $embedding;
    LET $author = type::record("person", $author_id);
    RELATE $author->wrote->$article;
    FOR $t IN $tags { LET $tag = type::record("tag", $t); RELATE $article->tagged->$tag; };
    `,
    { ...a, author_id: a.author, embedding: vectors[a.id] },
  );
}

console.log("✓ Artikel mit Embeddings");
for (const c of content.comments) {
  await db.query(
    `
    LET $from = type::record("person", $author);
    LET $to = type::record("article", $article);
    RELATE $from->commented->$to SET text = $text, rating = $rating;
    `,
    c,
  );
}

const [counts] = await db.query(
  "RETURN { articles: count(SELECT * FROM article), edges: count(SELECT * FROM wrote, tagged, related_to, follows, commented) }",
);
console.log("Seed fertig:", counts);
await closeAndExit(db);
