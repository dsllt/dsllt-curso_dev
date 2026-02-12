import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import activation from "models/activation";
import authorization from "models/authorization";

/**
 * @param {NextApiRequest} request
 * @param {NextApiResponse} response
 * @returns
 */

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userTryingToPost = request.context.user;
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);
  const activationToken = await activation.create(newUser.id);
  activation.sendEmailToUser(newUser, activationToken);
  const secureOutputValue = authorization.filterOutput(
    userTryingToPost,
    "read:user",
    newUser,
  );
  return response.status(201).json(secureOutputValue);
}
