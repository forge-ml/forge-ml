import zodToJsonSchema from "zod-to-json-schema";
import fs from "fs";

export const toJSON = zodToJsonSchema;

export const writeToJSON = (schema: Zod.Schema, outFile: string) => {
    const json = toJSON(schema)

    fs.writeFileSync(outFile, JSON.stringify(json));
}