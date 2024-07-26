import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";
import path from "path";
import { config } from "../config/config";
import { generate } from "./generate";
import loadBoilerplateFile from "../utils/boilerplate";
import fs from "fs";

const init = async () => {
  const exampleFilePath = path.join(__dirname, "../../forge/schema/person.ts");
  const destinationDir = path.join(process.cwd(), config.schemaPath);
  const clientPath = path.join(process.cwd(), config.clientPath);
  const destinationFilePath = destinationDir + "/example.ignore.ts";

  const dirExists = existsSync(destinationDir);

  if (dirExists) {
    console.log("Forge directory already exists.\n");
  } else {
    console.log("Creating forge directory...\n");
    await mkdir(destinationDir, { recursive: true });
  }

  console.log(
    "Copying example file (example.ignore.ts) to forge directory...\n"
  );
  await copyFile(exampleFilePath, destinationFilePath);

  console.log("Generating initial client code...\n");
  await generate();
  
  const initialClient = loadBoilerplateFile("initial_client.ts.txt");
  fs.writeFileSync(clientPath + "/client.ts", initialClient);
  console.log("Created client.ts file in forge directory\n");

  console.log(
    "Created forge directory with example schema at:",
    destinationFilePath
  );
};

export default init;
