import fs from "fs";
import path from "path";

const startSequence = "// --- START -- //";
const endSequence = "// --- END -- //";

const loadBoilerplateFile = (fileName: string, variables?: Record<string, string>) => {
  const filePath = path.join(__dirname, "..", "boilerplate", fileName);

  const file = fs.readFileSync(filePath, "utf8");
  // strip code above the start and below the end sequences, replace variables (match pattern is {{variable}})
  return file.split(startSequence)[1].split(endSequence)[0].replace(/{{(.*?)}}/g, (match, key) => variables?.[key] || match);
};

export default loadBoilerplateFile;