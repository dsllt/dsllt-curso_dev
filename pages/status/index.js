import { Banner, Heading, Stack } from "@primer/react";
import { Card } from "@primer/react/experimental";
import DefaultLayout from "pages/cadastro/interface/DefaultLayout";
import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <DefaultLayout contentWidth="medium" metadata={{ title: "Status" }}>
      <Stack gap="spacious">
        <Heading as="h1">Status</Heading>
        <DatabaseStatus />
        <UpdatedAt />
      </Stack>
    </DefaultLayout>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 100,
  });
  let updatedAtText = "Carregando";
  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return (
    <Banner>
      <Banner.Title>Última atualização: {updatedAtText}</Banner.Title>
    </Banner>
  );
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 100,
  });

  if (isLoading || !data) {
    return;
  }

  const database = data.dependencies.database;
  const version = database.version ?? "-";
  const openedConnections = database.opened_connections;
  const maxConnections = database.max_connections;

  return (
    <Stack>
      <Heading as="h2" variant="medium">
        Database
      </Heading>
      <Stack direction={{ narrow: "vertical", regular: "horizontal" }}>
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões abertas</Card.Heading>
            <Card.Description>{openedConnections}</Card.Description>
            <Card.Metadata>Use neste instante</Card.Metadata>
          </Card>
        </Stack.Item>
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões máximas</Card.Heading>
            <Card.Description>{maxConnections}</Card.Description>
            <Card.Metadata>Conexões disponíveis</Card.Metadata>
          </Card>
        </Stack.Item>
        <Stack.Item grow>
          <Card>
            <Card.Heading>PostgreSQL</Card.Heading>
            <Card.Description>{version}</Card.Description>
            <Card.Metadata>Versão em execução</Card.Metadata>
          </Card>
        </Stack.Item>
      </Stack>
    </Stack>
  );
}
