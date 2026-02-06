import database from "infra/database.js";

async function getVersion() {
  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;
  return databaseVersionValue;
}

async function getMaxConnections() {
  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue = parseInt(
    databaseMaxConnectionsResult.rows[0].max_connections,
  );
  return databaseMaxConnectionsValue;
}

async function getOpenedConnections() {
  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;

  return databaseOpenedConnectionsValue;
}

const databaseStatus = {
  getVersion,
  getMaxConnections,
  getOpenedConnections,
};

export default databaseStatus;
