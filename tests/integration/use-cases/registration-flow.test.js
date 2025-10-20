import orchestrator from "tests/orchestrator.js";
import activation from "models/activation";

describe("Use case: Registration flow (all successful)", () => {
  let createUserResponseBody;

  beforeEach(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.runPendingMigrations();
  });
  beforeAll(async () => {
    await orchestrator.clearDatabase();
  });
  test("Create user account", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "RegistrationFlow",
        email: "registration.flow@curso.dev",
        password: "senha123",
      }),
    });

    expect(response.status).toBe(201);

    createUserResponseBody = await response.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@curso.dev",
      password: createUserResponseBody.password,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
      features: ["read:activation_token"],
    });
  });
  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    const activationToken = await activation.findOneByUserId(
      createUserResponseBody.id,
    );

    expect(lastEmail.sender).toBe("<contato@fintab.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@curso.dev>");
    expect(lastEmail.subject).toBe("Ative seu cadastro");
    expect(lastEmail.text).toContain("RegistrationFlow");
    expect(lastEmail.text).toContain(activationToken.id);
  });
  test("Activate account", () => {});
  test("Login", () => {});
  test("Get user information", () => {});
});
