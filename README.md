# surrealdb-content-demo

Companion repo for the series on [SurrealDB](https://surrealdb.com) at [insights.casoon.de](https://insights.casoon.de) (in German).

A small content system with 20 articles, 4 authors, tags, comments and follows. Documents, graph edges, a full-text index and a vector index live in **one** database. Every query and output shown in the articles was run against this repo.

The sample content is German on purpose: the full-text index uses a German stemmer, and the embedding model is multilingual.

## Quick start (embedded, no server)

SurrealDB runs inside the Node process via `@surrealdb/node`; data is stored under `.data/`.

```bash
pnpm install
pnpm seed
pnpm query queries/01-graph-autoren.surql
```

Semantic queries embed the question locally. The first run downloads the model (about 150 MB) into the package cache:

```bash
pnpm query queries/05-semantische-suche.surql --text "Wie speichere ich Daten lokal, wenn keine Internetverbindung besteht?"
```

## Server, permissions and live queries

`pnpm server:install` downloads the official SurrealDB 3.3.0 binary into `./bin` (nothing is installed globally). The local server uses the demo credentials `root` / `root` and binds to localhost only.

```bash
pnpm server:install
pnpm server              # WebSocket on 127.0.0.1:8000, Postgres wire protocol on 127.0.0.1:5433
pnpm seed:server         # in a second terminal
node scripts/permissions.ts
```

`scripts/permissions.ts` signs up a reader through `DEFINE ACCESS` and walks through the rules in `db/access.surql`: drafts stay invisible, password hashes are not readable, readers can comment only as themselves, and a reader's live query only receives changes they are allowed to see.

All query scripts also run against the server: `SURREAL_URL=ws://127.0.0.1:8000 pnpm query <file>`.

### Postgres wire protocol

SurrealDB 3.3 speaks the Postgres protocol, but the query language is still SurrealQL. The database name is `namespace/database`:

```bash
PGPASSWORD=root psql "host=127.0.0.1 port=5433 user=root dbname=demo/content sslmode=disable" \
  -c "SELECT title, <-wrote<-person.name AS authors FROM article LIMIT 3;"
```

ANSI SQL joins and `LIVE SELECT` are rejected over this protocol.

## Browser demo

```bash
pnpm dev                 # http://localhost:4321
```

| Page | Shows |
|------|-------|
| `/` | The browser talks to the server directly over WebSocket: sign-up/sign-in, record-level permissions, live comments across two windows. Needs `pnpm server` and `pnpm seed:server`. |
| `/local/` | SurrealDB as WebAssembly inside the tab: typed schema, German full-text search and a live query, with no server. |

## Layout

| Path | Contents |
|------|----------|
| `db/schema.surql` | tables, relation tables, analyzer, full-text and HNSW index |
| `db/access.surql` | `DEFINE ACCESS` for readers and per-table permissions |
| `data/content.json` | authors, articles, tags, follows, comments |
| `data/embeddings.json` | precomputed embeddings (384 dimensions) |
| `scripts/seed.ts` | recreates the database (embedded, or the server with `SURREAL_URL`) |
| `scripts/query.ts` | runs a `.surql` file, optionally with `--text` as `$query_vec` |
| `scripts/permissions.ts` | permission and live-query walkthrough against the server |
| `scripts/embed.ts` | recomputes `data/embeddings.json` (`pnpm embed`) |
| `scripts/install-server.sh` | downloads the server binary into `./bin` |
| `queries/` | the queries from the articles |
| `src/pages/` | Astro pages for the browser demo |

## Queries

| File | Shows |
|------|-------|
| `01-graph-autoren.surql` | traversing edges in both directions, filtering on a nested document field |
| `02-kanten-mit-daten.surql` | edges carrying their own fields (comment, rating) |
| `03-volltext.surql` | BM25 full-text search with German stemming and highlighting |
| `04-aehnliche-artikel.surql` | nearest neighbours of an article via the HNSW index |
| `05-semantische-suche.surql` | semantic search with an embedded question |
| `06-semantisch-mit-graph.surql` | the same search, filtered through the follow graph |
| `07-tag-graph.surql` | finding articles through related tags |

## Versions and known issues

Tested on 5 October 2026 with Node 24, `surrealdb` 2.0.10, `@surrealdb/node` and `@surrealdb/wasm` 3.0.3, and the SurrealDB 3.3.0 server.

- The embedded engines (`@surrealdb/node`, `@surrealdb/wasm`) report **SurrealDB 3.0.2**, not the current server version 3.3. Features from 3.1–3.3, such as DiskANN and the Postgres protocol, are server-only for now.
- `@surrealdb/node` 3.0.3 keeps a background thread alive after `close()` once a full-text or HNSW index holds data, so Node does not exit. The scripts call `process.exit()` after closing (`scripts/lib/db.ts`).
- `@surrealdb/wasm` 3.0.3 cannot use IndexedDB (`indxdb://`): `use()` fails with "An IndexedDB error occured". The upstream issue [surrealdb/surrealdb.js#571](https://github.com/surrealdb/surrealdb.js/issues/571) was closed in May 2026, but no fixed version has been published. The `/local/` page falls back to an in-memory database and says so.
- Reading a vector through a record variable inside the KNN operator (`LET $source = article:x; … <|3,40|> $source.embedding`) silently ignores the condition and returns every row. Read the vector first: `LET $vec = article:x.embedding`.
- Denied writes do not raise an error; they return an empty result.
- Embeddings come from `Xenova/paraphrase-multilingual-MiniLM-L12-v2`. The small model is enough for the demo, but its ranking is not always convincing for general questions.

## Licence

Code and sample data: MIT. SurrealDB itself is licensed under the Business Source License 1.1; the SDKs are Apache 2.0.
