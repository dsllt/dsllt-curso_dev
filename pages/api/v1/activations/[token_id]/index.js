import controller from "infra/controller";
import activation from "models/activation";

const { createRouter } = require("next-connect");

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const tokenId = request.query.token_id;

  const tokenObject = await activation.activate(tokenId);

  return response.status(200).json(tokenObject);
}
