import type { Argv } from "yargs";

const deploy = (cli: Argv) =>
  cli.command(
    "deploy <endpoint>",
    "converts an exported zod schema to a typescript type",
    (yargs) =>
      yargs.positional("endpoint", {
        description: "The location",
        type: "string",
      }),
    (args) => {
      console.log(args.endpoint);
    }
  );

  export default deploy;