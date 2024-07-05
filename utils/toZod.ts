import jsonSchemaToZod from "json-schema-to-zod";
import fs from "fs";

export const toZod = jsonSchemaToZod;

const zodFile = (zodCode: string) =>
  `import z from "zod";

const zodSchema = ${zodCode};

export default zodSchema;
`;

export const writeToZod = (json: JSON, outFile: string) => {
  const content = zodFile(toZod(json).toString());

  fs.writeFileSync(outFile, content);
};