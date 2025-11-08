import { faker } from "@faker-js/faker";
import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import session from "models/session";
import activation from "models/activation";
import user from "models/user";

const webserverUrl = process.env.WEB_SERVER_URL;
const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(`${webserverUrl}/api/v1/status`);
      if (response.status !== 200) {
        throw Error();
      }
    }
  }
  async function waitForEmailServer() {
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchEmailPage() {
      const response = await fetch(emailHttpUrl);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function getDatabaseMigrations() {
  return await database.query("SELECT * FROM pgmigrations");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validpassword",
  });
}

async function activateUser(user) {
  return await activation.activateUserById(user.id);
}
async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const lastEmailItem = emailListBody.pop();

  if (!lastEmailItem) return null;

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
}

function extractUuid(text) {
  const UUID_REGEX = /[0-9a-fA-F-]{36}/;
  const textMatch = text.match(UUID_REGEX);
  return textMatch ? textMatch[0] : null;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  getDatabaseMigrations,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
  extractUuid,
  activateUser,
};

export default orchestrator;
