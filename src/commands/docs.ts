import type { Argv } from "yargs";
import authGate from "../utils/authGate";
import cWrap from "../utils/logging";
import makeRequest, { EP } from "../utils/request";

const docsCommand = (cli: Argv) =>
  cli.command(
    "docs",
    `${cWrap.fm("List the url of your Swagger API docs.")}
`,
    async (args) => {
      authGate();

      const response = await makeRequest(EP.GET_DOCS_URL, { method: "GET" });

      if (response.error) {
        console.log(`${cWrap.br("Error")} fetching docs url.`);
        return;
      } else {
        console.log(
          `Your docs are available at: ${cWrap.fg(response.data.url)}`
        );
      }
    }
  );

export default docsCommand;
