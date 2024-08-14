import type { Argv } from "yargs";
import authGate from "../utils/authGate";
import cWrap from "../utils/logging";
import makeRequest, { EP } from "../utils/request";
import workflow from "../controls/workflow";

// ADD HELP AND ERROR RESPONSE
const workflowCommand = (cli: Argv) =>
  cli.command(
    "workflow",
    `${cWrap.fm("Create a new workflow.")}`,
    () => {},
    async (args) => {
      authGate();
      await workflow();
      return;
    }
  );

export default workflowCommand;
