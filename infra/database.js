import { Client } from "pg";

async function query(queryObject) {
  let result;
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });
  try {
    await client.connect();
    result = await client.query(queryObject);
    return result;
  } catch (e) {
    console.log(e);
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};
