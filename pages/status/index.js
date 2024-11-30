import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>StatusPage</h1>
      <UpdatedAt />
      <DatabaseMaxConnections />
      <DatabaseOpenedConnections />
      <DatabaseVersion />
    </>
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
  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseMaxConnections() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 100,
  });
  let maxConnections = "Carregando";
  if (!isLoading && data) {
    maxConnections = data.dependencies.database.max_connections;
  }
  return (
    <div>Número máximo de conexões no banco de dados: {maxConnections}</div>
  );
}

function DatabaseOpenedConnections() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 100,
  });
  let openedConnections = "Carregando";
  if (!isLoading && data) {
    openedConnections = data.dependencies.database.opened_connections;
  }
  return (
    <div>Número de conexões abertas no banco de dados: {openedConnections}</div>
  );
}

function DatabaseVersion() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 100,
  });
  let versionText = "Carregando";
  if (!isLoading && data) {
    versionText = data.dependencies.database.opened_connections;
  }
  return <div>Versão do banco de dados: {versionText}</div>;
}
