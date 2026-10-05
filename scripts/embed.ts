// Computes the embeddings of all articles once and writes them to data/embeddings.json.
// The result is committed so that `pnpm seed` stays reproducible without downloading the model.
import { readFile, writeFile } from "node:fs/promises";
import { embed, MODEL } from "./lib/embedder.ts";

const content = JSON.parse(await readFile("data/content.json", "utf8"));
const vectors: Record<string, number[]> = {};

for (const article of content.articles) {
  vectors[article.id] = await embed(`${article.title}. ${article.summary} ${article.content}`);
  console.log(`✓ ${article.id}`);
}

await writeFile("data/embeddings.json", JSON.stringify({ model: MODEL, vectors }) + "\n");
