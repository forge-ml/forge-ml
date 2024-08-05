import path from "path";
import type { Argv } from "yargs";
import { deployAll } from "../controls/deploy";
import authGate from "../utils/authGate";
import { importConfig } from "../utils/imports";
import cWrap from "../utils/logging";

const deployCommand = (cli: Argv) =>
  cli.command(
    "deploy",
    cWrap.fm("Deploy all schemas to the Forge API."),
    (yargs) => {
      // used for --help example may not be needs since deploy takes no arguments
        yargs
          .example(
            cWrap.fg("forge deploy"),
            cWrap.fc("Deploy all schemas to the Forge API.")
          )
          .fail((msg: string, err: any, yargs: { showHelp: () => void }) => {
            if (err) throw err;
            yargs.showHelp();
          });
    },
    async () => {
      authGate();
      await deployAll();
      console.log(cWrap.fg("All schemas deployed successfully."));
    }
  );

export default deployCommand;
