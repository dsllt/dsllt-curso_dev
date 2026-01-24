import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import session from "models/session";
import { ForbiddenError } from "infra/errors";

/**
 * @param {NextApiRequest} request
 * @param {NextApiResponse} response
 * @returns
 */

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:user"), getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  await session.renew(sessionObject.id);

  const userByToken = await user.findOneById(sessionObject.user_id);
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);

  if (
    !userByToken.features.includes("read:user") ||
    userByToken.username.toLowerCase() !== username.toLowerCase()
  ) {
    throw new ForbiddenError({
      message: "Você não possui permissão para executar esta ação.",
      action: "Entre em contato com o suporte.",
    });
  }

  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;
  const updatedUser = await user.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
