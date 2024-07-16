import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";
import path from "path";

const init = async () => {
  const exampleFilePath = path.join(__dirname, "../../forge/person.ts");
  const destinationDir = path.join(process.cwd(), "forge");
  const destinationFilePath = destinationDir + "/person.schema.ts";

  const dirExists = existsSync(destinationDir);

  if (dirExists) {
    console.log("Forge directory already exists.\n");
  } else {
    console.log("Creating forge directory...\n");
    await mkdir(destinationDir);
  }

  console.log(
    "Copying example file (person.schema.ts) to forge directory...\n"
  );
  await copyFile(exampleFilePath, destinationFilePath);
  console.log(
    "Created forge directory with example schema at:",
    destinationFilePath
  );
};

export default init;
