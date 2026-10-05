// Führt eine .surql-Datei gegen die eingebettete Datenbank aus.
// Mit --text "…" wird der Text eingebettet und als $query_vec übergeben.
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { inspect } from "node:util";
import { closeAndExit, open } from "./lib/db.ts";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { text: { type: "string" }, as: { type: "string" } },
});
const surql = await readFile(positionals[0], "utf8");
const params: Record<string, unknown> = {};

if (surql.includes("$query_vec")) {
  if (!values.text) throw new Error('Diese Abfrage braucht --text "…"');
  const { embed } = await import("./lib/embedder.ts");
  params.query_vec = await embed(values.text);
  params.query_text = values.text;
}

const db = await open();
const results = await db.query(surql, params);
console.log(inspect(results.at(-1), { depth: null, colors: process.stdout.isTTY, breakLength: 100 }));
await closeAndExit(db);
