import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { createRouter } from "next-connect";
import controller from "infra/controller";

/**
 * @param {NextApiRequest} request
 * @param {NextApiResponse} response
 * @returns
 */

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
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

async function getHandler(request, response) {
  await handleMigration(request, response, true);
}

async function postHandler(request, response) {
  await handleMigration(request, response, false);
}
