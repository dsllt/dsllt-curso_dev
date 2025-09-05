import crypto from "node:crypto";
import database from "infra/database";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");

  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);

  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const session = await database.query({
      text: `
    INSERT INTO
      sessions (token, user_id, expires_at)
    VALUES
      ($1, $2, $3)
    RETURNING
      *
    ;
    `,
      values: [token, userId, expiresAt],
    });

    return session.rows[0];
  }
}

async function findOneValidByToken(sessionToken) {
  const validSession = runSelectQuery(sessionToken);

  return validSession;

  async function runSelectQuery(sessionToken) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          sessions
        WHERE
          token = $1
          AND expires_at > NOW()
        LIMIT
          1
        ;
      `,
      values: [sessionToken],
    });

    if (result.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
      });
    }

    return result.rows[0];
  }
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const renewedSessionObject = await runUpdateQuery(expiresAt, sessionId);
  return renewedSessionObject;

  async function runUpdateQuery(expiresAt, sessionId) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $1,
          updated_at = NOW()
        WHERE
          id = $2
        RETURNING
          *
        ;
      `,
      values: [expiresAt, sessionId],
    });

    return results.rows[0];
  }
}

const session = {
  create,
  EXPIRATION_IN_MILLISECONDS,
  findOneValidByToken,
  renew,
};

export default session;
