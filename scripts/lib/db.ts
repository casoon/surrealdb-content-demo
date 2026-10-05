import { Surreal } from "surrealdb";
import { createNodeEngines } from "@surrealdb/node";

// Eingebettete Datenbank im Projektordner, kein Server nötig.
export const DB_PATH = "surrealkv://.data/demo";

export async function open(): Promise<Surreal> {
  const db = new Surreal({ engines: createNodeEngines() });
  await db.connect(DB_PATH);
  await db.use({ namespace: "demo", database: "content" });
  return db;
}

// @surrealdb/node 3.0.3 hält nach close() einen Index-Thread offen, sobald ein
// Volltext- oder HNSW-Index Daten enthält; Node beendet sich dann nicht von selbst.
export async function closeAndExit(db: Surreal): Promise<never> {
  await db.close();
  process.exit(0);
}
