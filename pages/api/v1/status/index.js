import controller from "infra/controller";
import { createRouter } from "next-connect";
import authorization from "models/authorization";
import databaseStatus from "models/database-status";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const updatedAt = new Date().toISOString();
  const databaseVersionValue = await databaseStatus.getVersion();
  const databaseMaxConnectionsValue = await databaseStatus.getMaxConnections();
  const databaseOpenedConnectionsValue =
    await databaseStatus.getOpenedConnections();

  const output = {
    updated_at: updatedAt,
    version: databaseVersionValue,
    max_connections: databaseMaxConnectionsValue,
    opened_connections: databaseOpenedConnectionsValue,
  };

  const secureOutputValue = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    output,
  );

  return response.status(200).json(secureOutputValue);
}
