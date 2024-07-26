// write the sdk from deployed endpoints

import path from "path";
import { loadDirectoryFiles } from "../utils/directory";
import { config as cfg } from "../config/config";
import { importConfig } from "../utils/imports";
import fs from "fs";
import compileTypeScriptModule from "../utils/compile";
import loadBoilerplateFile from "../utils/boilerplate";
import axios from "axios";
import makeRequest, { EP } from "../utils/request";
import cWrap from "../utils/logging";

const cleanPath = (path: string): string => {
  return path.replace(/[^a-zA-Z0-9]/g, "_");
};

const type_prefix = "schema";

const functionTemplate = (username: string, path: string) => `
${cleanPath(path)}: {
    query: (prompt: string, opts?: RequestOptions): Promise<Zod.infer<typeof ${cleanPath(
      path
    )}_${type_prefix}>> => {
        return createRequest({
          username: "${username}",
          path: "${path}",
        })(prompt, {
          token: opts?.token || forgeKey,
          // cache: opts?.cache,
        });
      },
},`;

const buildFunctions = (
  username: string,
  configs: { config: any; file: string }[]
) => {
  return configs
    .map((config) => functionTemplate(username, config.config.path))
    .join("\n");
};

const buildImports = (configs: { config: any; file: string }[]) => {
  return configs
    .map(
      (config) =>
        `import ${cleanPath(
          config.config.path
        )}_${type_prefix} from "../schema/${config.file}"`
    )
    .join("\n");
};

const buildClient = (
  username: string,
  configs: { config: any; file: string }[]
) => {
  return `
  ${buildImports(configs)}

  const generatedClient = (forgeKey: string) => {
    return {
      ${buildFunctions(username, configs)}
    };
  };
  `;
};

const createClient = async () => {
  const files = loadDirectoryFiles();

  const configs = (
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(process.cwd(), cfg.schemaPath, file);
        const config = await importConfig(filePath);

        if (!config?.path) {
          return;
        }

        if (file.includes(".ignore.")) {
          return;
        }

        const dir = path.join(
          process.cwd(),
          "node_modules",
          "@forge",
          "schema"
        );
        const destPath = path.join(dir, file);
        const tsCode = fs.readFileSync(filePath, "utf8");
        const target = path.join(dir, file.replace(".ts", ".js"));
        const description = `Compiled ${file}`;
        compileTypeScriptModule(tsCode, target);
        fs.copyFileSync(filePath, destPath);

        return { config: config, file: file };
      })
    )
  ).filter((x): x is { config: any; file: string } => !!x);

  const response = await makeRequest(EP.ENDPOINT_ALL, { method: "GET" });
  const username = response.data.data.username;

  return buildClient(username, configs);
};

export const generate = async () => {
  const boilerplate = loadBoilerplateFile("generated_client.ts.txt");
  const packageJson = loadBoilerplateFile("package.json.txt");

  const clientCode = await createClient();

  // @TODO: make this dynamic
  const variable_declarations = `
  const serverUrl = "${cfg.serverUrl}"
  `;

  // write the generated client
  compileTypeScriptModule(
    variable_declarations + boilerplate + clientCode,
    path.join(process.cwd(), "node_modules", "@forge", "client", "index.js")
  );
  console.log(
    "Client code re-generated and installed as " +
      cWrap.fg("@forge/client") +
      ". You may need to 'reload window' on your IDE to refresh type-completion."
  );
  // write the package.json
  fs.writeFileSync(
    path.join(
      process.cwd(),
      "node_modules",
      "@forge",
      "client",
      "package.json"
    ),
    packageJson
  );
};
