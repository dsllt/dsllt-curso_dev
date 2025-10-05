describe("Use case: Registration flow (all successful)", () => {
  test("Create user account", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "dsllt",
        email: "d@email.com",
        password: "senha123",
      }),
    });

    expect(response.status).toBe(201);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "dsllt",
      email: "d@email.com",
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
      features: ["read:activation_token"],
    });
  });
  test("Receive activation email", () => {});
  test("Activate account", () => {});
  test("Login", () => {});
  test("Get user information", () => {});
});
