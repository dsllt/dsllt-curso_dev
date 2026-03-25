import orchestrator from "tests/orchestrator.js";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`);

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
      expect(responseBody.dependencies.database.version).toBeUndefined();
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
  describe("Privileged user", () => {
    test("Retrieving current system status", async () => {
      const privilegedUser = await orchestrator.createUser();
      await orchestrator.activateUser(privilegedUser);
      await orchestrator.addFeaturesToUser(privilegedUser, ["read:status:all"]);
      const sessionObjectPrivilegedUser =
        await orchestrator.createSession(privilegedUser);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        method: "GET",
        headers: {
          Cookie: `session_id=${sessionObjectPrivilegedUser.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
      expect(responseBody.dependencies.database.version).toEqual("16.0");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
  describe("Default user", () => {
    test("Retrieving current system status", async () => {
      const defaultUser = await orchestrator.createUser();
      await orchestrator.activateUser(defaultUser);
      const sessionObjectDefaultUser =
        await orchestrator.createSession(defaultUser);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        method: "GET",
        headers: {
          Cookie: `session_id=${sessionObjectDefaultUser.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      console.log(responseBody);
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
