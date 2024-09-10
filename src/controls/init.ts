import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";
import path from "path";
import { config } from "../config/config";
import { generate } from "./generate";
import loadBoilerplateFile from "../utils/boilerplate";
import fs from "fs";
import { execSync } from "child_process";
import cWrap from "../utils/logging";
import { selectOption } from "../utils/optionSelect";
import projectService from "../svc/projectService";
import { loadAndSetUsername } from "../utils/username";
import makeRequest, { EP } from "../utils/request";

const createProject = async (projectName?: string) => {
  try {
    const response = await makeRequest(EP.PROJECT, {
      method: "POST",
      data: { projectName },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

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

  console.log(cWrap.fm("What language is your project?"));
  const language = await selectOption(["typescript", "javascript"]);
  projectService.language.set(language);

  loadAndSetUsername();

  console.log(cWrap.fm("\n\nWhat is the name of your project?"));
  const projectName = await new Promise<string>((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    readline.question("", (name: string) => {
      readline.close();
      resolve(name.trim());
    });
  });

  if (projectName) {
    console.log(
      cWrap.fm(`Project name set to: ` + cWrap.fg(projectName) + "\n")
    );
  } else {
    console.log(cWrap.fy("No project name provided. Using default settings."));
  }

  console.log(cWrap.fm("Initializing project...\n"));
  try {
    const projectId = await createProject(projectName);
    projectService.projectId.set(projectId);
  } catch (error) {
    console.error("Error initializing project:", error);
    throw error;
  }

  console.log(cWrap.fm("\nGenerating initial client code...\n"));
  await generate();

  // JS or TS
  const ext = projectService.language.getExt();

  const initialClient = loadBoilerplateFile("initial_client.ts.txt", {
    forgeLockPath: "./forge.lock/index" + ext,
  });
  fs.writeFileSync(clientPath + "/client" + ext, initialClient);
  console.log(
    "Generated " +
      cWrap.fg("forge/client" + ext) +
      ". Modify this file to add your own client code.\n"
  );

  console.log(
    "Created forge directory with example schema at:",
    cWrap.fg(destinationFilePath) + "\n"
  );
};

export default init;
