import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

const globalForDb = globalThis as typeof globalThis & {
  dbClient?: postgres.Sql;
  dbInstance?: ReturnType<typeof drizzle<typeof schema>>;
};

export function getDb() {
  if (globalForDb.dbInstance) {
    return globalForDb.dbInstance;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const client =
    globalForDb.dbClient ??
    postgres(connectionString, {
      prepare: false,
    });

  const db = drizzle(client, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.dbClient = client;
    globalForDb.dbInstance = db;
  }

  return db;
}
export { schema };
