# surrealdb-content-demo

Begleit-Repo zur Insights-Serie über [SurrealDB](https://surrealdb.com) auf [insights.casoon.de](https://insights.casoon.de).

Ein kleines Content-System mit 20 Artikeln, 4 Autoren, Tags, Kommentaren und Follows. Die Daten liegen als Dokumente, Graph-Kanten, Volltext-Index und Vektor-Index in **einer** Datenbank. SurrealDB läuft dabei eingebettet im Node-Prozess, ein Datenbankserver ist nicht nötig.

## Schnellstart

```bash
pnpm install
pnpm seed
pnpm query queries/01-graph-autoren.surql
```

Für die semantischen Abfragen wird die Frage lokal eingebettet. Beim ersten Aufruf lädt das Skript dafür das Modell (rund 150 MB) in den Cache:

```bash
pnpm query queries/05-semantische-suche.surql --text "Wie speichere ich Daten lokal, wenn keine Internetverbindung besteht?"
```

## Aufbau

| Pfad | Inhalt |
|------|--------|
| `db/schema.surql` | Tabellen, Relationstabellen, Analyzer, Volltext- und HNSW-Index |
| `data/content.json` | Autoren, Artikel, Tags, Follows, Kommentare |
| `data/embeddings.json` | vorberechnete Embeddings (384 Dimensionen) |
| `scripts/seed.ts` | legt die Datenbank unter `.data/` neu an |
| `scripts/query.ts` | führt eine `.surql`-Datei aus, optional mit `--text` als `$query_vec` |
| `scripts/embed.ts` | berechnet `data/embeddings.json` neu (`pnpm embed`) |
| `queries/` | die Abfragen aus dem Artikel |

## Abfragen

| Datei | Zeigt |
|-------|-------|
| `01-graph-autoren.surql` | Kanten in beide Richtungen lesen, Filter auf verschachteltes Dokumentfeld |
| `02-kanten-mit-daten.surql` | Kanten mit eigenen Feldern (Kommentar, Bewertung) |
| `03-volltext.surql` | BM25-Volltextsuche mit deutschem Stemmer und Highlighting |
| `04-aehnliche-artikel.surql` | nächste Nachbarn zu einem Artikel über den HNSW-Index |
| `05-semantische-suche.surql` | semantische Suche mit eingebetteter Frage |
| `06-semantisch-mit-graph.surql` | dieselbe Suche, gefiltert über den Follow-Graphen |
| `07-tag-graph.surql` | Artikel über verwandte Tags finden |

## Versionen und bekannte Eigenheiten

- `surrealdb` 2.0.x (JavaScript-SDK) mit `@surrealdb/node` 3.0.3. Die eingebettete Engine meldet sich als **SurrealDB 3.0.2**, nicht als aktuelle Server-Version 3.3.
- `@surrealdb/node` 3.0.3 lässt nach `close()` einen Hintergrund-Thread laufen, sobald ein Volltext- oder HNSW-Index Daten enthält. Der Node-Prozess beendet sich dann nicht. Die Skripte rufen deshalb nach `close()` explizit `process.exit()` auf (`scripts/lib/db.ts`).
- Embeddings stammen von `Xenova/paraphrase-multilingual-MiniLM-L12-v2`. Das kleine Modell reicht für die Demo, die Rangfolge ist bei allgemeinen Fragen aber nicht immer überzeugend.

## Lizenz

Code und Beispieldaten: MIT. SurrealDB selbst steht unter der Business Source License 1.1, die SDKs unter Apache 2.0.
