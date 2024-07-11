import type { Argv } from "yargs";
import localConfigService from "../controls/auth/svc";
import signup from "../controls/auth/signup";
import login from "../controls/auth/login";
import logout from "../controls/auth/logout";
import { config } from "../config/config";

const authCommand = (cli: Argv) =>
  cli.command(
    "auth <action>",
    "manages authentication actions: signup, login, logout",
    (yargs) =>
      yargs
        .positional("action", {
          description: "The action to perform: signup, login, logout",
          type: "string",
          demandOption: true,
        })
        .option("key", {
          description: "The API key to store (required for signup action)",
          type: "string",
        }),
    async (args) => {
      const { action } = args;

      switch (action) {
        case "signup":
          await signup();
          console.log(
            `Your ${config.bin} configuration is stored here: ${config.apiKeyFilePath}`
          );
          break;
        case "login":
          await login();
          console.log(
            `Your ${config.bin} configuration is stored here: ${config.apiKeyFilePath}`
          );
          break;
        case "logout":
          logout();
          break;
        default:
      }
    }
  );

export default authCommand;
