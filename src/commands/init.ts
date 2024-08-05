import type { Argv } from "yargs";
import init from "../controls/init";
import cWrap from "../utils/logging";

const initCommand = (cli: Argv) =>
  cli.command(
    "init",
    `${cWrap.fm("Initialize the forge directory with an example schema.")}
`,
    () => {},
    (_args) => {
      init();
    }
  );

export default initCommand;
