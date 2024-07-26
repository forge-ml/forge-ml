import type { Argv } from "yargs";
import authGate from "../utils/authGate";
import cWrap from "../utils/logging";
import makeRequest, { EP } from "../utils/request";
import { create } from "../controls/create";

// ADD HELP AND ERROR RESPONSE
const createCommand = (cli: Argv) =>
  cli.command(
    "create",
    `${cWrap.fm("Create a new simple schema.")}`,
    async (args) => {
      authGate();
      await create();
      return;
    }
  );

export default createCommand;
