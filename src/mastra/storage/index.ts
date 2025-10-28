import { PostgresStore } from "@mastra/pg";

/**
 * A shared PostgreSQL storage instance for the application.
 * This instance is configured to use the `DATABASE_URL` environment variable,
 * falling back to a local PostgreSQL instance if it is not set.
 *
 * @see https://mastra.io/docs/storage/postgres
 */
export const sharedPostgresStorage = new PostgresStore({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/mastra",
});
