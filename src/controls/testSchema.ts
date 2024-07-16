import path from "path";
import { importDefault, importZod } from "../utils/imports";
import cWrap from "../utils/logging";

/**
 * Test the schema in the file at `schemaFilePath` against the value in the file at `sourcePath`.
 * @param schemaInFile path to the file where the schema is the default export
 * @param sourceInFile path to the file where the value to be tested is the default export
 */
const testSchema = async (schemaInFile: string, sourceInFile: string) => {
  const schemaPath = path.join(process.cwd(), schemaInFile);
  const sourcePath = path.join(process.cwd(), sourceInFile);

  const zod = await importZod(schemaPath);
  const source = await importDefault(sourcePath);

  zod.parse(source);
  console.log(cWrap.fg("Looks good to me!"));
};

export default testSchema;
