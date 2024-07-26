import type { Argv } from "yargs";
import { generate } from "../controls/generate";
import cWrap from "../utils/logging";

const generateCommand = (cli: Argv) =>
  cli.command(
    "generate",
    `${cWrap.fm("Generate a new forge client.")}
`,
    () => {},
    (_args) => {
      generate();
    }
  );

export default generateCommand;
