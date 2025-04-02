import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { MigrationServiceError } from "infra/errors";

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function handleMigration(request, response, dryRun) {
  const dbClient = await database.getNewClient();

  const migrations = await migrationRunner({
    ...defaultMigrationOptions,
    dbClient,
    dryRun,
  });

  const statusCode = dryRun || migrations.length === 0 ? 200 : 201;
  response.status(statusCode).json(migrations);
  dbClient.end();
}

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });
    return pendingMigrations;
  } catch (error) {
    throw new MigrationServiceError({
      message: "Erro ao buscar lista de migrações pendentes.",
      cause: error,
    });
  } finally {
    dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });
    return migratedMigrations;
  } catch (error) {
    throw new MigrationServiceError({
      message: "Erro ao rodar migrações pendentes.",
      cause: error,
    });
  } finally {
    dbClient?.end();
  }
}

const migrator = {
  handleMigration,
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
