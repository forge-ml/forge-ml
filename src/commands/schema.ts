import type { Argv, CommandModule } from "yargs";
import testSchema from "../controls/testSchema";
import cWrap from "../utils/logging";

const parentCommand: CommandModule = {
  command: `schema`,
  describe: cWrap.fm("Manage your endpoint schemas"),
  builder: (yargs) =>
    yargs
      .hide("version")
      .command(testCommand)
      .example(
        cWrap.fg("forge schema test <path-to-schema> <path-to-source>"),
        cWrap.fc("parses a source file with the specified schema")
      ),
  handler: (args) => {
    console.log(cWrap.fr(`Invalid action: ${args.action}`));
  },
};

const testCommand: CommandModule = {
  command: "test <path-to-schema> <path-to-source>",
  describe: cWrap.fm(
    "Run the default export of a source file against a given schema to test schema parsing."
  ),
  builder: (yargs) =>
    yargs
      .hide("action")
      .positional(cWrap.fb("path-to-schema"), {
        demandOption: true,
        description:
          "The location of the file containing the zod schema to test against.",
        normalize: true, // normalize the path
        type: "string",
      })
      .positional(cWrap.fb("path-to-source"), {
        demandOption: true,
        description:
          "The location of the file containing the default export to test with.",
        normalize: true, // normalize the path
        type: "string",
      }),

  handler: (args) => {
    if (typeof args["path-to-source"] !== "string") {
      console.log(
        cWrap.fr(
          `invalid path to source file: ${args["path-to-source"]}. Please provide a valid path.`
        )
      );
    }
    if (typeof args["path-to-schema"] !== "string") {
      console.log(
        cWrap.fr(
          `invalid path to source file: ${args["path-to-schema"]}. Please provide a valid path.`
        )
      );
    }
    const schemaPath = args["path-to-schema"] as string;
    const sourcePath = args["path-to-source"] as string;
    testSchema(schemaPath, sourcePath);
  },
};

const schemaCommand = (cli: Argv) => cli.command(parentCommand);

export default schemaCommand;
