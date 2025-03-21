import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";

/**
 * @param {NextApiRequest} request
 * @param {NextApiResponse} response
 * @returns
 */

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}
