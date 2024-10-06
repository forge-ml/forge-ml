import type { Argv } from "yargs";
import { generate } from "../controls/generate";
import cWrap from "../utils/logging";

const generateCommand = (cli: Argv) =>
  cli.command(
    "generate",
    `${cWrap.fm("Generate a new forge client.")}
`,
    (yargs) => {
      return yargs.option("commonjs", {
        alias: "c",
        type: "boolean",
        description: "Generate CommonJS client",
      });
    },
    (args) => {
      generate(args.commonjs);
    }
  );

export default generateCommand;
