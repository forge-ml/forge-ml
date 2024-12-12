import { importConfig, importZod } from "../utils/imports";
import { toJSON } from "../utils/toJSON";
import path from "path";
import makeRequest, { EP } from "../utils/request";
import { cWrap } from "../utils/logging";
import { config as cfg } from "../config/config";
import { CacheType, SchemaConfig } from "../utils/config";
import { loadDirectoryFiles } from "../utils/directory";
import { generate } from "./generate";
import fs from "fs";
import axios from "axios";
import { execSync } from "child_process";
import { modelProviderOptions } from "../utils/config";
/**
 * helper functions to check latest version of npm package
 */

async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://registry.npmjs.org/${packageName}`
    );
    return response.data["dist-tags"].latest;
  } catch (error) {
    throw new Error(`Failed to fetch package info: ${error}`);
  }
}

async function checkVersionAndWarnUser() {
  try {
    // Get the globally installed version using forge --version
    const globalVersion = execSync(`${cfg.bin} --version`, {
      encoding: "utf8",
    }).trim();

    const latestVersion = await getLatestVersion("forge-ml");
    if (globalVersion !== latestVersion) {
      console.log(
        cWrap.fr(
          `You are using an outdated version of forge-ml (${globalVersion}). Please update to the latest version ${latestVersion}, by running:`
        ) +
          cWrap.fy("\nnpm install -g forge-ml@latest ") +
          "or " +
          cWrap.fy("forge update\n")
      );
    }
  } catch (e) {
    console.log(
      cWrap.fr(
        "Error checking for updates: forge-ml might not be installed globally."
      )
    );
  }
}

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
      contentType: config.contentType,
      model: config.model,
      provider: config.provider,
      context: config.context,
    },
  });

  if (response.error) {
    const error = response.error;

    //used for handling zod type validation errors
    if (error.isAxiosError && error.response && error.response.data) {
      const errorData = error.response.data[0];
      if (errorData && errorData.errors && errorData.errors.issues) {
        const cacheSettingError = errorData.errors.issues.find(
          (issue: { path: string[] }) => issue.path[0] === "cacheSetting"
        );
        const providerError = errorData.errors.issues.find(
          (issue: { path: string[] }) => issue.path[0] === "provider"
        );

        if (cacheSettingError) {
          console.log(
            cWrap.br("Endpoint Setting Error For Path: " + config.path),
            cWrap.fr(cacheSettingError.message + ": " + config.cache + ". ")
          );
          console.log(
            cWrap.fr("Please set the cache setting to ") +
              cWrap.fy("'common', 'individual' or 'none'") +
              cWrap.fr(" in the schema config of ") +
              cWrap.fy(inFile)
          );
        }

        // @TODO: modelOptions is exported from create.ts we should move this out to shared location
        const providers = Object.keys(modelProviderOptions);
        if (providerError) {
          console.log(
            cWrap.br("Endpoint Setting Error For Path: " + config.path),
            cWrap.fr(providerError.message + ": " + config.provider + ". ")
          );
          console.log(
            cWrap.fr(
              "Please set the provider to one of the following: " +
                cWrap.fy("[" + providers.join(", ") + "]") +
                cWrap.fr(" in the schema config of ") +
                cWrap.fy(inFile)
            )
          );
        }
      }
    }

    if (response.message === "Model does not support images") {
      //used to handle error gracefully
      return {
        error: true,
        message: response.message,
      };
    }

    console.log(cWrap.br("Error deploying"));
    console.log(cWrap.fr(response?.message as string));
  }

  return response;
};

const deployAll = async () => {
  //check for npm package updates and inform user - WORKS IN DEV TEST IN PRODUCTION
  await checkVersionAndWarnUser();

  const files = loadDirectoryFiles();

  for (const file of files) {
    const filePath = path.join(process.cwd(), cfg.schemaPath, file);
    const config = await importConfig(filePath);

    if (!config?.path) {
      console.log(
        `- ${cWrap.fm("No path found")} in ${cWrap.fg(file)}. Skipping...`
      );
      continue;
    }

    if (file.includes(".ignore.")) {
      console.log(`- ${cWrap.fm("Ignoring")} ${cWrap.fg(file)}. Skipping...`);
      continue;
    }

    try {
      const response = await deploy(filePath, config.path, config);
      if (response.error) {
        if (response.message === "Model does not support images") {
          console.log(
            "- " +
              cWrap.fr(
                "Error deploying endpoint: " +
                  config.path +
                  ". '" +
                  config.model +
                  "' does not support images"
              )
          );
          continue; // check if should be return
        }
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

  generate();
};

export { deploy, deployAll };
