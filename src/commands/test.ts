import type { Argv } from "yargs";
import test from "../controls/test";
import authGate from "../utils/authGate";
import cWrap from "../utils/logging";

const testCommand = (cli: Argv) =>
  cli.command(
    "test <path-to-schema>",
    `${cWrap.fm(
      "Run a prompt against a given schema to simulate a Forge endpoint."
    )}
`,
    (yargs) =>
      yargs
        .positional("schema-file", {
          description:
            "The location of the file containing the zod schema to test against.",
          type: "string",
          demandOption: true,
        })
        .example(
          cWrap.fg("forge test <schema-file>"),
          cWrap.fc("tests schema file with a user entered prompt")
        ),
    (args) => {
      authGate();

      test(args["schema-file"]);
    }
  );

export default testCommand;
