import controller from "infra/controller";
import activation from "models/activation";
import authorization from "models/authorization";

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

  const userTryingToPatch = request.context.user;

  const secureOutputValue = authorization.filterOutput(
    userTryingToPatch,
    "read:activation_token",
    usedActivationToken,
  );
  return response.status(200).json(secureOutputValue);
}
