import email from "infra/email";
import database from "infra/database";
import webserver from "infra/webserver";
import { NotFoundError } from "infra/errors";
import user from "./user";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const session = await database.query({
      text: `
    INSERT INTO
      user_activation_tokens (user_id, expires_at)
    VALUES
      ($1, $2)
    RETURNING
      *
    ;
    `,
      values: [userId, expiresAt],
    });

    return session.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  const emailOptions = {
    from: "FinTab <contato@fintab.com.br>",
    to: user.email,
    subject: "Ative seu cadastro",
    text: `${user.username}, clique no link abaixo para ativar seu email
    
https://${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe CoffeeTab`,
  };

  email.send(emailOptions);
}

async function findOneValidById(tokenId) {
  const foundToken = await runSelectQuery(tokenId);
  return foundToken;

  async function runSelectQuery(tokenId) {
    const result = await database.query({
      text: `
        SELECT 
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at is NULL
        LIMIT
          1
      `,
      values: [tokenId],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return result.rows[0];
  }
}

async function activate(tokenId) {
  const updatedToken = await runUpdateQuery(tokenId);
  activateUserById(updatedToken.user_id);
  return updatedToken;

  async function runUpdateQuery(tokenId) {
    const result = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
    ;`,
      values: [tokenId],
    });

    return result.rows[0];
  }
}

async function activateUserById(userId) {
  const userFeature = ["create:session"];
  const updatedUser = await user.setFeatures(userId, userFeature);
  return updatedUser;
}

const activation = {
  create,
  sendEmailToUser,
  findOneValidById,
  activate,
};

export default activation;
