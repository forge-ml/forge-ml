import { importZod } from "../utils/imports";
import { writeToJSON } from "../utils/toJSON";
import { writeToZod } from "../utils/toZod";
import path from "path";

const transform = async (inFile: string, outFile: string) => {
  const extension = inFile.split(".").pop();

  const filePath = path.join(process.cwd(), inFile);

  switch (extension) {
    case "ts":
      const zod = await importZod(filePath);
      return writeToJSON(zod, outFile);
    case "json":
      const { default: json } = await import(filePath);
      return writeToZod(json, outFile);
    default:
      console.warn("invalid file type specified: ");
  }

  console.log("You've got a nice little surprise in");
};

export default transform;
