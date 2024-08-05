import type { Argv } from "yargs";
import authGate from "../utils/authGate";
import cWrap from "../utils/logging";
import makeRequest, { EP } from "../utils/request";
import { exec } from "node:child_process";
import localConfigService from "../controls/auth/svc";

const copyToClipboard = (text: string) => {
  const proc = require("child_process").spawn("pbcopy");
  proc.stdin.write(text);
  proc.stdin.end();
};

function copyKey(provider: string) {
  const key = localConfigService.getValue(provider);
  if (!key) {
    console.log(`${cWrap.br("Error")} copying key.`);
    return;
  }

  copyToClipboard(`Bearer ${key}`);

  console.log(`Key copied to clipboard for ${cWrap.fg(provider)}.`);
}

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
        const url = response.data.url;
        console.log(`Your docs are available at: ${cWrap.fg(url)}`);

        //copy forge key to clipboard
        copyKey("forge");

        // Open the URL in the default browser
        const command =
          process.platform === "win32"
            ? "start"
            : process.platform === "darwin"
            ? "open"
            : "xdg-open";
        exec(`${command} ${url}`, (err) => {
          if (err) {
            console.error("Failed to open the docs in the browser:", err);
          } else {
            console.log("Your docs have been opened in your default browser.");
          }
        });
      }
    }
  );

export default docsCommand;
