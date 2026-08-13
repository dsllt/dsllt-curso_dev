import { useState } from "react";
import DefaultLayout from "./interface/DefaultLayout";
import { Button, FormControl, Heading, Stack, TextInput } from "@primer/react";

export default function RegisterPage() {
  return (
    <DefaultLayout
      contentWidth="small"
      metadata={{
        title: "Cadastro",
        description: "Crie sua conta de forma gratuita.",
      }}
    >
      <Stack>
        <Heading as="h1">Cadastro</Heading>
        <RegisterForm />
      </Stack>
    </DefaultLayout>
  );
}

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleCadastro(event) {
    event.preventDefault();
    const requestBody = { username, email, password };
    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    if (response.status === 201) {
      location.href = "/cadastro/confirmar";
    }
  }

  return (
    <form>
      <Stack>
        <FormControl>
          <FormControl.Label>Nome do usuário</FormControl.Label>
          <TextInput
            type="text"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            block
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Email</FormControl.Label>
          <TextInput
            type="text"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            block
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Password</FormControl.Label>
          <TextInput
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            block
          />
        </FormControl>
        <Stack.Item>
          <Button type="submit" onClick={handleCadastro} variant="primary">
            Cadastrar
          </Button>
        </Stack.Item>
      </Stack>
    </form>
  );
}
