import { PostgresStore } from "@mastra/pg";
import { LibSQLStore } from "@mastra/libsql";

/**
 * A shared storage instance for the application.
 * In production (when DATABASE_URL is set), uses PostgreSQL.
 * In development, uses LibSQL which stores data locally in a .db file.
 *
 * @see https://mastra.io/docs/storage/postgres
 * @see https://mastra.io/docs/storage/libsql
 */
export const sharedPostgresStorage = process.env.DATABASE_URL
  ? new PostgresStore({
      connectionString: process.env.DATABASE_URL,
    })
  : new LibSQLStore({
      url: "file:./mastra-dev.db",
    });
