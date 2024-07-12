import type { Argv } from "yargs";
import makeRequest, { EP } from "../utils/request";
import cWrap from "../utils/logging";
import authGate from "../utils/authGate";

const docsCommand = (cli: Argv) =>
  cli.command(
    "docs",
    "lists the url of your docs",
    async (args) => {
      authGate();
      
      const response = await makeRequest(EP.GET_DOCS_URL, { method: "GET" });

      if (response.error) {
        console.log(`${cWrap.br("Error")} fetching docs url.`);
        return;
      } else {
        console.log(`Your docs are available at: ${cWrap.fg(response.data.url)}`);
        }
    }
  );

export default docsCommand;
