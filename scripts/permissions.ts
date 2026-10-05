// Walks through the record-level permissions from db/access.surql against a running server.
// Requires `pnpm server` and `pnpm seed:server`.
import { createRemoteEngines, Surreal, Table } from "surrealdb";

const URL = process.env.SURREAL_URL ?? "ws://127.0.0.1:8000";
const scope = { namespace: "demo", database: "content" };

// Admin connection: prepares a draft and watches comments live.
const admin = new Surreal({ engines: createRemoteEngines() });
await admin.connect(URL);
await admin.signin({ username: "root", password: "root" });
await admin.use(scope);
await admin.query(`
  DELETE article:sina_draft;
  CREATE article:sina_draft SET
    title = "Agent Memory in practice", summary = "", content = "Draft.",
    published = false, metadata = {}, embedding = article:rag_chunking.embedding;
  RELATE person:sina->wrote->article:sina_draft;
  DELETE person WHERE email = "lena@example.org";
`);

const feed = await admin.live(new Table("commented"));
feed.subscribe((message) => {
  const { action, value } = message as { action: string; value: { text?: string } };
  console.log(`  [live] ${action}: ${value.text ?? ""}`);
});

// Reader connection: signs up through DEFINE ACCESS, no backend in between.
const reader = new Surreal({ engines: createRemoteEngines() });
await reader.connect(URL);
await reader.use(scope);
await reader.signup({
  ...scope,
  access: "reader",
  variables: { name: "Lena", email: "lena@example.org", pass: "demo-only-1" },
});

const show = async (label: string, surql: string) => {
  try {
    const result = await reader.query(surql);
    console.log(`${label}:`, JSON.stringify(result.at(-1)));
  } catch (error) {
    console.log(`${label}: error –`, (error as Error).message);
  }
};

await show("signed in as", "RETURN $auth.name");
await show("visible articles", "RETURN count(SELECT id FROM article)");
await show("draft visible", "RETURN count(SELECT id FROM article:sina_draft)");
await show("password field", "SELECT name, pass FROM person WHERE email = 'lena@example.org'");
await show("own comment", "RELATE $auth->commented->article:rag_chunking SET text = 'Helpful overview.', rating = 5 RETURN text");
await show("comment as Anna", "RELATE person:anna->commented->article:rag_chunking SET text = 'Forged.', rating = 1 RETURN text");
await show("delete Anna's comments", "DELETE commented WHERE in = person:anna RETURN BEFORE");

// Live queries run with the reader's permissions: the draft update never arrives.
const readerFeed = await reader.live(new Table("article"));
readerFeed.subscribe((message) => {
  const { action, value } = message as { action: string; value: { title?: string } };
  console.log(`  [reader live] ${action}: ${value.title ?? ""}`);
});
await admin.query(`
  UPDATE article:sina_draft SET content = "Second draft.";
  UPDATE article:rag_chunking SET metadata.readingTime = 10;
`);

const [annaComments] = await admin.query("RETURN count(SELECT id FROM commented WHERE in = person:anna)");
console.log("Anna's comments (admin view):", annaComments);

await new Promise((resolve) => setTimeout(resolve, 300));
await reader.close();
await admin.close();
