import retry from "async-retry";

const webserverUrl = process.env.WEB_SERVER_URL;

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(`${webserverUrl}/api/v1/status`);
      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
