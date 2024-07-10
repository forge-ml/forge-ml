import {importConfig, importZod} from "../utils/imports";
import { toJSON} from "../utils/toJSON";
import path from "path";
import makeRequest, { EP } from "../utils/request";
import fs from "fs";
import { cWrap } from "../utils/logging";

const deploy = async (inFile: string, endpoint: string) => {
  const zod = await importZod(inFile);
  const json = toJSON(zod);

  const response = await makeRequest(EP.DEPLOY, {
    method: "POST",
    data: {
      name: "default description",
      description: "default description",
      structure: JSON.stringify(json),
      path: endpoint,
    },
  });

  if ("error" in response) {
    console.log(cWrap.br("Error deploying"));
    console.log(cWrap.fr(response.message.error as string));
  }

  return response;
};


const deployAll = async () => {
  const files = fs.readdirSync(path.join(process.cwd(), "schemas"));
  for (const file of files) {
    const filePath = path.join(process.cwd(), "schemas", file);
    const config = await importConfig(filePath);

    if (!config?.path) {
      console.log(`- ${cWrap.fm("No path found")} in ${cWrap.fg(file)}. Skipping...`);
      continue;
    }

    try {
      await deploy(filePath, config.path);
      console.log(`- ${cWrap.fg("Deployed")} ${cWrap.fg(file)} to ${cWrap.fg(config.path)}`);
    } catch (error) {
      console.log(`- ${cWrap.br("Error deploying")} ${cWrap.fg(file)}. Please check that you have a valid zodSchema as the default export. Skipping...`);
    }
  }
};

export { deploy, deployAll };
