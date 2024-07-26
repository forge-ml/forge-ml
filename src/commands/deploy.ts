import path from "path";
import type { Argv } from "yargs";
import { deploy, deployAll } from "../controls/deploy";
import authGate from "../utils/authGate";
import { importConfig } from "../utils/imports";
import cWrap from "../utils/logging";
const deployCommand = (cli: Argv) =>
  cli.command(
    "deploy <path-to-schema>",
    `${cWrap.fm("Deploy a schema to the Forge API.")}
${cWrap.fb("--path <path>")}\toverride the endpoint path
`,
    (yargs) =>
      yargs
        .positional("path-to-schema", {
          description: cWrap.fg(
            `The filename of the schema to deploy. This is the name of the file that contains the schema. \`deploy all\` to deploy all schemas in the forge/schema directory.`
          ),
          type: "string",
          default: "all"
        })
        .option("path", {
          description:
            "the path to deploy the schema to. This will override the path specified by the exported config. Only alphanumeric characters are valid.",
          type: "string",
        })
        .example(
          cWrap.fg("deploy all"),
          cWrap.fc("Deploy all schemas in the forge/ directory")
        )
        .example(
          cWrap.fg("deploy forge/mySchema.ts"),
          cWrap.fc(
            "Deploy schema file in the forge/ directory with the name mySchema"
          )
        ),
    async (args) => {
      authGate();

      const filename = args["path-to-schema"] || "all";

      if (filename === "all") {
        await deployAll();
        return;
      }

      const file = path.join(process.cwd(), filename);

      const config = await importConfig(file);
      const endpoint = args.path || config.path;

      if (!endpoint) {
        console.log("No path found. Please provide a path or filename.");
        return;
      }

      const response = await deploy(file, endpoint, config);

      if (response.error) {
        console.error("Whoops! Looks like something went wrong.");
        process.exit(1);
      } else {
        console.log(`Deployed schema to ${cWrap.fg(response.data.url)}`);
      }
    }
  );

export default deployCommand;
