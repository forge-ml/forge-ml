import type { Argv } from "yargs";
import authGate from "../utils/authGate";
import cWrap from "../utils/logging";
import { edit } from "../controls/edit";

// ADD HELP AND ERROR RESPONSE
const editCommand = (cli: Argv) =>
  cli.command(
    "edit",
    `${cWrap.fm("Edit an existing schema.")}`,
    () => {},
    async () => {
      authGate();
      await edit();
      return;
    }
  );

export default editCommand;
