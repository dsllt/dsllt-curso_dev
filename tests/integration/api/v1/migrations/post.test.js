import orchestrator from "tests/orchestrator.js";
import fs from "node:fs";
import { resolve } from "node:path";
const migrationName = `${Date.now()}_test_migration_dummy`;
const migrationPath = resolve("infra", "migrations", `${migrationName}.js`);

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        status_code: 403,
        message: "Você não possui permissão para executar esta ação.",
        action: `Verifique se seu usuário possui a feature create:migration`,
      });
    });
  });

  describe("Default user", () => {
    let token;

    beforeAll(async () => {
      const privilegedUser = await orchestrator.createUser();
      await orchestrator.activateUser(privilegedUser);
      const sessionObjectPrivilegedUser = await orchestrator.createSession(
        privilegedUser.id,
      );
      token = sessionObjectPrivilegedUser.token;
    });

    afterAll(() => {
      if (fs.existsSync(migrationPath)) {
        fs.unlinkSync(migrationPath);
      }
    });
    test("Running pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
        headers: {
          Cookie: `session_id=${token}`,
        },
      });

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        status_code: 403,
        message: "Você não possui permissão para executar esta ação.",
        action: `Verifique se seu usuário possui a feature create:migration`,
      });
    });
  });

  describe("Privileged user", () => {
    let token;

    beforeAll(async () => {
      const privilegedUser = await orchestrator.createUser();
      await orchestrator.activateUser(privilegedUser);
      await orchestrator.addFeaturesToUser(privilegedUser, [
        "create:migration",
      ]);
      const sessionObjectPrivilegedUser = await orchestrator.createSession(
        privilegedUser.id,
      );
      token = sessionObjectPrivilegedUser.token;
    });

    afterAll(() => {
      if (fs.existsSync(migrationPath)) {
        fs.unlinkSync(migrationPath);
      }
    });
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const migrationContent = `
        exports.up = (pgm) => {
          pgm.sql("SELECT 1;"); // Query inócua apenas para teste
        };
        exports.down = false;
      `;
        fs.writeFileSync(migrationPath, migrationContent);

        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
            headers: {
              Cookie: `session_id=${token}`,
            },
          },
        );

        const responseBody = await response.json();

        expect(response.status).toBe(201);
        expect(responseBody).toEqual({});
      });

      test("For the second time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
            headers: {
              Cookie: `session_id=${token}`,
            },
          },
        );

        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(responseBody).toEqual({});
      });
    });
  });
});
