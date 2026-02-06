import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(`http://localhost:3000/api/v1/migrations`);

      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        status_code: 403,
        message: "Você não possui permissão para executar esta ação.",
        action: `Verifique se seu usuário possui a feature read:migration`,
      });
    });
  });

  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const defaultUser = await orchestrator.createUser();
      await orchestrator.activateUser(defaultUser);
      const sessionObjectDefaultUser = await orchestrator.createSession(
        defaultUser.id,
      );

      const response = await fetch(`http://localhost:3000/api/v1/migrations`, {
        method: "GET",
        headers: {
          Cookie: `session_id=${sessionObjectDefaultUser.token}`,
        },
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        status_code: 403,
        message: "Você não possui permissão para executar esta ação.",
        action: `Verifique se seu usuário possui a feature read:migration`,
      });
    });
  });
});

describe("Privileged user", () => {
  test("Retrieving pending migrations", async () => {
    const privilegedUser = await orchestrator.createUser();
    await orchestrator.activateUser(privilegedUser);
    await orchestrator.addFeaturesToUser(privilegedUser, ["read:migration"]);
    const sessionObjectPrivilegedUser = await orchestrator.createSession(
      privilegedUser.id,
    );

    const response = await fetch(`http://localhost:3000/api/v1/migrations`, {
      method: "GET",
      headers: {
        Cookie: `session_id=${sessionObjectPrivilegedUser.token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toEqual([]);
  });
});
