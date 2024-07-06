import importZod from "../utils/imports";
import { toZod, writeToZod } from "../utils/toZod";
import { toJSON, writeToJSON } from "../utils/toJSON";
import path from "path";
import makeRequest, { EP } from "../utils/request";

const deploy = async (inFile: string, endpoint: string) => {
  const filePath = path.join(process.cwd(), inFile);

  const zod = await importZod(filePath);
  const json = toJSON(zod);

  makeRequest(EP.DEPLOY, {
    method: "POST",
    data: {
      schema: json,
      endpoint,
    },
  });
};

export default deploy;
