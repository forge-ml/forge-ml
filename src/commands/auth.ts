import type { Argv } from "yargs";
import login from "../controls/auth/login";
import logout from "../controls/auth/logout";
import signup from "../controls/auth/signup";
import update from "../controls/auth/update";
import cWrap from "../utils/logging";

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
        })
        .example(
          cWrap.fg("forge auth signup"),
          cWrap.fc("Sign up and store your API key")
        )
        .example(
          cWrap.fg("forge auth login"),
          cWrap.fc("Log in to your account")
        )
        .example(
          cWrap.fg("forge auth logout"),
          cWrap.fc("Log out of your account")
        )
        .example(
          cWrap.fg("forge auth update"),
          cWrap.fc("Update your username")
        ),
    async (args) => {
      const { action } = args;

      switch (action) {
        case "signup":
          console.log(cWrap.fg("Signup for a forge account!"));
          await signup();
          break;
        case "login":
          console.log(cWrap.fg("Log in to your existing forge account!"));
          await login();
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
