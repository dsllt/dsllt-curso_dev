import { createRouter } from "next-connect";
import controller from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";
import * as cookie from "cookie";

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

  const setCookie = cookie.serialize("session_id", userSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV == "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);

  return response.status(201).json(userSession);
}
