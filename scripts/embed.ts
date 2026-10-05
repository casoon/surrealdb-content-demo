// Berechnet die Embeddings aller Artikel einmalig und legt sie in data/embeddings.json ab.
// Das Ergebnis ist eingecheckt, damit `pnpm seed` ohne Modell-Download reproduzierbar bleibt.
import { readFile, writeFile } from "node:fs/promises";
import { embed, MODEL } from "./lib/embedder.ts";

const content = JSON.parse(await readFile("data/content.json", "utf8"));
const vectors: Record<string, number[]> = {};

for (const article of content.articles) {
  vectors[article.id] = await embed(`${article.title}. ${article.summary} ${article.content}`);
  console.log(`✓ ${article.id}`);
}

await writeFile("data/embeddings.json", JSON.stringify({ model: MODEL, vectors }) + "\n");
