import email from "infra/email";
import database from "infra/database";
import webserver from "infra/webserver";

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

async function findOneByUserId(userId) {
  const foundToken = await runSelectQuery(userId);
  return foundToken;

  async function runSelectQuery(userId) {
    const result = await database.query({
      text: `
        SELECT 
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT
          1
      `,
      values: [userId],
    });

    return result.rows[0];
  }
}

const activation = {
  create,
  sendEmailToUser,
  findOneByUserId,
};

export default activation;
