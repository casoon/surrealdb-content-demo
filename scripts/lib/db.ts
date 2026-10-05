import { createRemoteEngines, Surreal } from "surrealdb";
import { createNodeEngines } from "@surrealdb/node";

// Without SURREAL_URL the database runs embedded in the project folder, no server needed.
// With SURREAL_URL=ws://127.0.0.1:8000 the same scripts talk to the server (pnpm server).
export const EMBEDDED_DIR = ".data/demo";
export const DB_URL = process.env.SURREAL_URL ?? `surrealkv://${EMBEDDED_DIR}`;
export const IS_EMBEDDED = !process.env.SURREAL_URL;

export async function open(): Promise<Surreal> {
  const db = new Surreal({ engines: { ...createRemoteEngines(), ...createNodeEngines() } });
  await db.connect(DB_URL);
  if (!IS_EMBEDDED) {
    // Local demo credentials, see "pnpm server" in package.json
    await db.signin({ username: "root", password: "root" });
  }
  await db.use({ namespace: "demo", database: "content" });
  return db;
}

// @surrealdb/node 3.0.3 keeps an index thread alive after close() once a full-text or
// HNSW index holds data, so Node never exits on its own.
export async function closeAndExit(db: Surreal): Promise<never> {
  await db.close();
  process.exit(0);
}
