import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

function getClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!globalForDb.postgresClient) {
    globalForDb.postgresClient = postgres(connectionString, {
      prepare: false,
      max: 10,
    });
  }

  return globalForDb.postgresClient;
}

function getDb(): Db {
  // Do not cache the Drizzle wrapper. A stale instance keeps the schema from
  // first boot and silently drops columns added later (rules, links, min bid).
  return drizzle(getClient(), { schema });
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
