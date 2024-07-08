import type { Argv } from "yargs";
import authService from "../controls/auth/svc";
import { deploy, deployAll } from "../controls/deploy";
import { importConfig } from "../utils/imports";
import path from "path";

const deployCommand = (cli: Argv) =>
  cli.command(
    "deploy <filename>",
    "deploy a schema to the fax api. You can optionally override the path by passing in the --path flag.",
    (yargs) =>
      yargs
        .positional("filename", {
          description:
            "The filename of the schema to deploy. This is the name of the file that contains the schema. `deploy all` to deploy all schemas in the fax directory.",
          type: "string",
          default: "all",
        })
        .option("path", {
          description:
            "the path to deploy the schema to. This will override the exported path. Only alphanumeric characters are valid.",
          type: "string",
        }).example("deploy all", "Deploy all schemas in the fax directory")
        .example("deploy mySchema.ts", "Deploy the schema in the fax directory with the name mySchema"),
    async (args) => {
      if (args.filename === "all") {
        await deployAll();
        return;
      }

      const file = path.join(process.cwd(), args.filename);

      const endpoint = args.path || (await importConfig(file)).path;

      if (!endpoint) {
        console.log("No path found. Please provide a path or filename.");
        return;
      }

      const response = await deploy(file, endpoint);

      if ("error" in response) {
        console.error("Whoops! Looks like something went wrong.");
        return;
      }

      console.log(`Deployed schema to ${response.data.url}`);
    }
  );

export default deployCommand;
