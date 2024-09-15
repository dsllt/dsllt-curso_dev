import database from "infra/database";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

async function verifyMigrationsRun() {
  const result = await database.query("SELECT * FROM pgmigrations");
  const migrationsRunNames = result.rows.map((migration) => migration.name);
  return migrationsRunNames;
}

async function getAllMigrationsNames(responseBody) {
  const migrationsNames = responseBody.map((migration) => migration.name);
  return migrationsNames;
}

describe("POST to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );

        const responseBody = await response.json();

        expect(response.status).toBe(201);
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThanOrEqual(1);
        expect(await verifyMigrationsRun()).toStrictEqual(
          await getAllMigrationsNames(responseBody),
        );
      });

      test("For the second time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );

        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toEqual(0);
      });
    });
  });
});
