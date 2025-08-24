import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";

/**
 * @param {NextApiRequest} request
 * @param {NextApiResponse} response
 * @returns
 */

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const userSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(response, userSession.token);

  return response.status(201).json(userSession);
}
