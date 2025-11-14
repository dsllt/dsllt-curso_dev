import controller from "infra/controller";
import activation from "models/activation";

const { createRouter } = require("next-connect");

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const tokenId = request.query.token_id;

  const validActivationToken = await activation.findOneValidById(tokenId);

  await activation.activateUserById(validActivationToken.user_id);

  const usedActivationToken = await activation.activate(tokenId);

  return response.status(200).json(usedActivationToken);
}
