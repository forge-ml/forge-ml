import fs from "fs";
import path from "path";

const startSequence = "// --- START -- //";
const endSequence = "// --- END -- //";

const loadBoilerplateFile = (fileName: string) => {
  const filePath = path.join(__dirname, "..", "boilerplate", fileName);

  const file = fs.readFileSync(filePath, "utf8");
  return file.split(startSequence)[1].split(endSequence)[0];
};

export default loadBoilerplateFile;