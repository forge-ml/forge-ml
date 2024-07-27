import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";
import path from "path";
import { config } from "../config/config";
import { generate } from "./generate";
import loadBoilerplateFile from "../utils/boilerplate";
import fs from "fs";
import { execSync } from "child_process";
import cWrap from "../utils/logging";

const init = async () => {
  // Install zod
  execSync("npm install zod");

  const exampleFilePath = path.join(__dirname, "../../forge/schema/person.ts");
  const destinationDir = path.join(process.cwd(), config.schemaPath);
  const clientPath = path.join(process.cwd(), config.clientPath);
  const destinationFilePath = destinationDir + "/example.ignore.ts";

  const dirExists = existsSync(destinationDir);

  if (dirExists) {
    console.log("Forge directory already exists.");
  } else {
    console.log("Creating forge directory...");
    await mkdir(destinationDir, { recursive: true });
  }

  console.log("Copying example file (example.ignore.ts) to forge directory...");
  await copyFile(exampleFilePath, destinationFilePath);

  console.log(cWrap.fm("Generating initial client code...\n"));
  await generate();

  const initialClient = loadBoilerplateFile("initial_client.ts.txt");
  fs.writeFileSync(clientPath + "/client.ts", initialClient);
  console.log(
    "Generated " +
      cWrap.fg("forge/client.ts") +
      ". Modify this file to add your own client code.\n"
  );

  console.log(
    "Created forge directory with example schema at:",
    cWrap.fg(destinationFilePath) + "\n"
  );
};

export default init;
