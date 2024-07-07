import type { Argv } from "yargs";
import authService from "../controls/auth/svc";

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
      const apiKey = authService.getAPIKey();
      if (!apiKey) {
        console.log("No API key found. Run `fax login` or `fax signup` to create one.");
        return;
      }
      console.log(args.endpoint);
    }
  );

  export default deploy;