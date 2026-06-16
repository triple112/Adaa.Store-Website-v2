/**
 * Direct DB runner for migrations / ad-hoc SQL against Supabase Postgres.
 *
 *   node scripts/db.mjs ping                 # test connection
 *   node scripts/db.mjs path/to/file.sql     # run a .sql file
 *   node scripts/db.mjs -e "select 1"        # run inline SQL
 *
 * Reads DATABASE_URL, or the standard PG* env vars (PGHOST/PGUSER/PGPASSWORD/...).
 * SSL is required by Supabase.
 */
import fs from "node:fs";
import pg from "pg";

const arg = process.argv[2];

const client = new pg.Client(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      }
    : {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || "postgres",
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      },
);

try {
  await client.connect();
  if (!arg || arg === "ping") {
    const r = await client.query("select current_user, current_database()");
    console.log("✓ connected:", r.rows[0]);
  } else if (arg === "-e") {
    const r = await client.query(process.argv[3]);
    console.log("✓ ok:", r.rowCount, "rows");
    if (r.rows?.length) console.log(r.rows);
  } else {
    const sql = fs.readFileSync(arg, "utf8");
    await client.query(sql);
    console.log("✓ applied:", arg);
  }
} catch (e) {
  console.error("✖", e.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
