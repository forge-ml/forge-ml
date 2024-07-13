import type { Argv } from "yargs";
import login from "../controls/auth/login";
import logout from "../controls/auth/logout";
import signup from "../controls/auth/signup";
import update from "../controls/auth/update";
import cWrap from "../utils/logging";

const authCommand = (cli: Argv) =>
  cli.command(
    "auth <action>",
    `${cWrap.fm("Manage authentication state with actions:")}
${cWrap.fb("signup")}\t\tsign up for a forge account
${cWrap.fb("login")}\t\tsign in to an existing forge account
${cWrap.fb("logout")}\t\tlog out of the current forge account
${cWrap.fb(
  "update"
)}\t\tupdate the username associated with the current forge account
`,
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
