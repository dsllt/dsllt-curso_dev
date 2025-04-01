import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  const newUser = runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password) 
      VALUES 
        ($1, $2, $3)
      RETURNING
        *
    ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return result.rows[0];
  }

  async function validateUniqueEmail(email) {
    const result = await database.query({
      text: `
      SELECT 
         email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1) 
    ;`,
      values: [email],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
      });
    }
  }

  async function validateUniqueUsername(username) {
    const result = await database.query({
      text: `
      SELECT 
         username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1) 
    ;`,
      values: [username],
    });

    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
      });
    }
  }
}

const user = {
  create,
};

export default user;
