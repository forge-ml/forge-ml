import { importConfig, importZod } from "../utils/imports";
import { toJSON } from "../utils/toJSON";
import path from "path";
import makeRequest, { EP } from "../utils/request";
import fs from "fs";
import { cWrap } from "../utils/logging";
import { config as cfg } from "../config/config";
import { CacheType, SchemaConfig } from "../utils/config";

const deploy = async (
  inFile: string,
  endpoint: string,
  config: SchemaConfig
) => {
  const zod = await importZod(inFile);
  const json = toJSON(zod);

  const response = await makeRequest(EP.DEPLOY, {
    method: "POST",
    data: {
      name: config.name || "Set me in the schema config (name)",
      description:
        config.description || "Set me in the schema config (description)",
      structure: JSON.stringify(json),
      path: endpoint,
      public: config.public,
      cacheSetting: config.cache || CacheType.NONE,
    },
  });

  if (response.error) {
    console.log(cWrap.br("Error deploying"));
    console.log(cWrap.fr(response?.message as string));
  }

  return response;
};

const deployAll = async () => {
  let files;
  try {
    files = fs.readdirSync(path.join(process.cwd(), cfg.schemaPath));
  } catch (error) {
    console.error(
      cWrap.fr(
        `Error reading schema directory \`${cfg.schemaPath}\`. Please verify it exists and try again.`
      )
    );
    return;
  }

  for (const file of files) {
    const filePath = path.join(process.cwd(), cfg.schemaPath, file);
    const config = await importConfig(filePath);

    if (!config?.path) {
      console.log(
        `- ${cWrap.fm("No path found")} in ${cWrap.fg(file)}. Skipping...`
      );
      continue;
    }

    try {
      const response = await deploy(filePath, config.path, config);
      if (response.error) {
        console.log(
          `- ${cWrap.fr("Error deploying")} ${cWrap.fm(
            file
          )}. Something went wrong. Are you logged in?`
        );
      } else {
        console.log(
          `- ${cWrap.fg("Deployed")} ${cWrap.fg(file)} to ${cWrap.fg(
            config.path
          )}`
        );
      }
    } catch (error) {
      console.log(
        `- ${cWrap.fr("Error deploying")} ${cWrap.fm(
          file
        )}. Please check that you have a valid zodSchema as the default export. Skipping...`
      );
    }
  }
};

export { deploy, deployAll };
