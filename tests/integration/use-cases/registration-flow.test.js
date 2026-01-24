import orchestrator from "tests/orchestrator.js";
import activation from "models/activation";
import webserver from "infra/webserver";
import user from "models/user";

describe("Use case: Registration flow (all successful)", () => {
  let createUserResponseBody;
  let activationTokenId;
  let createSessionResponseBody;

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
    const emailActivationToken = orchestrator.extractUuid(lastEmail.text);
    const activationTokenObject =
      await activation.findOneValidById(emailActivationToken);
    activationTokenId = activationTokenObject.id;

    expect(lastEmail.sender).toBe("<contato@fintab.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@curso.dev>");
    expect(lastEmail.subject).toBe("Ative seu cadastro");
    expect(lastEmail.text).toContain("RegistrationFlow");
    expect(lastEmail.text).toContain(
      `https://${webserver.origin}/cadastro/ativar/${activationTokenId}`,
    );
    expect(emailActivationToken).toBe(activationTokenId);
    expect(createUserResponseBody.id).toBe(activationTokenObject.user_id);
    expect(activationTokenObject.used_at).toBe(null);
  });

  test("Activate account", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );
    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();
    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activationUser = await user.findOneByUsername("RegistrationFlow");
    expect(activationUser.features).toEqual([
      "create:session",
      "read:session",
      "read:user",
      "update:user",
    ]);
  });

  test("Login", async () => {
    const createSessionResponse = await fetch(
      `http://localhost:3000/api/v1/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "registration.flow@curso.dev",
          password: "senha123",
        }),
      },
    );

    expect(createSessionResponse.status).toBe(201);

    createSessionResponseBody = await createSessionResponse.json();

    expect(createSessionResponseBody.user_id).toBe(createUserResponseBody.id);
  });

  test("Get user information", async () => {
    const response = await fetch("http://localhost:3000/api/v1/user", {
      method: "GET",
      headers: {
        Cookie: `session_id=${createSessionResponseBody.token}`,
      },
    });

    expect(response.status).toBe(200);

    const userResponseBody = await response.json();
    expect(userResponseBody.id).toEqual(createUserResponseBody.id);
  });

  test("Reject multiple activation", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
        headers: {
          Cookie: `session_id=${createSessionResponseBody.token}`,
        },
      },
    );
    expect(activationResponse.status).toBe(403);

    const activationResponseBody = await activationResponse.json();
    expect(activationResponseBody).toEqual({
      name: "ForbiddenError",
      status_code: 403,
      message: "Você não possui permissão para executar esta ação.",
      action: `Verifique se seu usuário possui a feature read:activation_token`,
    });
  });
});
