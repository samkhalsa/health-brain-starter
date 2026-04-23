/**
 * Apply the latest Drizzle-generated SQL migration directly via Neon.
 * Use instead of interactive `drizzle-kit push` for bootstrapping.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL / POSTGRES_URL not set");

  const dir = resolve(__dirname, "..", "drizzle");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  if (!files.length) {
    console.error("No SQL files in drizzle/. Run `drizzle-kit generate` first.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  try {
    for (const file of files) {
      console.log(`→ Applying ${file}`);
      const fullSql = readFileSync(resolve(dir, file), "utf-8");
      const statements = fullSql
        .split(/-->\s*statement-breakpoint/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const stmt of statements) {
        try {
          await pool.query(stmt);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("already exists") || msg.includes("duplicate_object")) {
            console.log(`  (skip, already exists)`);
            continue;
          }
          console.error(`  ✗ statement failed:`, msg);
          throw err;
        }
      }
      console.log(`  ✓ applied ${statements.length} statements`);
    }
  } finally {
    await pool.end();
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
