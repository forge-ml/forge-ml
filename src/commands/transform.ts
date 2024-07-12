import type { Argv } from "yargs";
import transform from "../controls/transform";

const transformCommand = (cli: Argv) =>
  cli.command(
    "transform <from>",
    "converts an exported zod schema to a typescript type",
    (yargs) =>
      yargs
        .positional("from", {
          description: "The location of the source file to transform",
          type: "string",
          demandOption: true,
        })
        .option("to", {
          description:
            "The location of the target file to write to. Defaults to .ts if json or .json if .ts",
          type: "string",
        }),

    (args) => {
      const to = (() => {
        if (args.to) {
          return args.to;
        }

        return args.from.replace(/\.\w+$/, (ext) =>
          ext === ".json" ? ".ts" : ".json",
        );
      })();
      const defaultFile = transform(args.from, to);
    },
  );

export default transformCommand;
