import type { Argv } from "yargs";
import localConfigService from "../controls/auth/svc";
import signup from "../controls/auth/signup";
import login from "../controls/auth/login";
import logout from "../controls/auth/logout";
import { config } from "../config/config";
import update from "../controls/auth/update";

const authCommand = (cli: Argv) =>
  cli.command(
    "auth <action>",
    "manages authentication actions: signup, login, logout, username updates",
    (yargs) =>
      yargs
        .positional("action", {
          description: "The action to perform: signup, login, logout, update",
          choices: ["signup", "login", "logout", "update"],
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
        case "update":
          await update();
          break;
        case "logout":
          logout();
          break;
        default:
      }
    }
  );

export default authCommand;
