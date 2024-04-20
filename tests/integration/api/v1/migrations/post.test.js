import database from "infra/database";

beforeAll(cleanDatabase);
async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function verifyMigrationsRun() {
  const result = await database.query("SELECT * FROM pgmigrations");
  const migrationsRunNames = result.rows.map((migration) => migration.name);
  return migrationsRunNames;
}

async function getAllMigrationsNames(responseBody) {
  const migrationsNames = responseBody.map((migration) => migration.name);
  return migrationsNames;
}

test("POST to /api/v1/status should return status 200", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  //test
  const response1Body = await response1.json();
  
  expect(response1.status).toBe(201);
  expect(Array.isArray(response1Body)).toBe(true);
  expect(response1Body.length).toBeGreaterThanOrEqual(1);
  expect(await verifyMigrationsRun()).toStrictEqual(
    await getAllMigrationsNames(response1Body),
  );

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  
  const response2Body = await response2.json();
  
  expect(response2.status).toBe(200);
  expect(Array.isArray(response2Body)).toBe(true);
  expect(response2Body.length).toEqual(0);
});
