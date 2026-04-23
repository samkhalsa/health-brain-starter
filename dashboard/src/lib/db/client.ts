import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DrizzleDB = ReturnType<typeof makeDb>;

function makeDb() {
  const connectionString =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
  if (!connectionString) {
    throw new Error("DATABASE_URL / POSTGRES_URL not set");
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

// Lazy singleton — Next.js build imports this file at compile time, and we
// don't want to throw just for having no DB URL at build time.
let _db: DrizzleDB | undefined;
export const db = new Proxy({} as DrizzleDB, {
  get(_target, prop) {
    if (!_db) _db = makeDb();
    return _db[prop as keyof DrizzleDB];
  },
});

export type DB = DrizzleDB;
