import zodToJsonSchema from "zod-to-json-schema";
import fs from "fs";

export const toJSON: typeof zodToJsonSchema = (...args) => {
  const json = zodToJsonSchema(...args) as { additionalProperties: boolean };

  json.additionalProperties = true;

  return json;
};

export const writeToJSON = (schema: Zod.Schema, outFile: string) => {
  const json = toJSON(schema);

  fs.writeFileSync(outFile, JSON.stringify(json));
};
