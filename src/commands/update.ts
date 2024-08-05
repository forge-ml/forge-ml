import type { Argv } from "yargs";
import authGate from "../utils/authGate";
import cWrap from "../utils/logging";
import update from "../controls/update";

// ADD HELP AND ERROR RESPONSE
const createCommand = (cli: Argv) =>
  cli.command(
    "update",
    `${cWrap.fm("Installs the latest version of forge-ml.")}`,
    async (args) => {
      await update();
      return;
    }
  );

export default createCommand;
