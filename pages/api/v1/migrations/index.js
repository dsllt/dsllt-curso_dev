import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";
import authorization from "models/authorization";

/**
 * @param {NextApiRequest} request
 * @param {NextApiResponse} response
 * @returns
 */

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:migration"), getHandler);
router.post(controller.canRequest("create:migration"), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const pendingMigrations = await migrator.listPendingMigrations();
  const secureOutputValue = authorization.filterOutput(
    userTryingToGet,
    "read:migration",
    pendingMigrations,
  );
  return response.status(200).json(secureOutputValue);
}

async function postHandler(request, response) {
  const userTryingToPost = request.context.user;
  const migratedMigrations = await migrator.runPendingMigrations();
  const secureOutputValue = authorization.filterOutput(
    userTryingToPost,
    "create:migration",
    migratedMigrations,
  );
  if (migratedMigrations.length > 0) {
    return response.status(201).json(secureOutputValue);
  }
  return response.status(200).json(secureOutputValue);
}
