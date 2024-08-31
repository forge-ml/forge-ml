// write the sdk from deployed endpoints

import path from "path";
import { loadDirectoryFiles } from "../utils/directory";
import { config as cfg, config } from "../config/config";
import { importConfig } from "../utils/imports";
import fs from "fs";
import compileTypeScriptModule from "../utils/compile";
import loadBoilerplateFile from "../utils/boilerplate";
import cWrap from "../utils/logging";
import { SchemaConfig } from "../utils/config";
import projectService from "../svc/projectService";
import { loadAndSetUsername } from "../utils/username";

const cleanPath = (path: string): string => {
  return path.replace(/[^a-zA-Z0-9]/g, "_");
};

const type_prefix = "schema";

const buildRag = () => `
$withContext: (prompt: string, opts: RAGRequestOptions) => {
    return ragRequest(prompt, {
      token: opts.token || forgeKey,
      collectionId: opts.collectionId,
      modelConfig: opts.modelConfig,
      chunkCount: opts.chunkCount,
    });
  },
`;

const functionTemplate = (username: string, path: string) => `
${cleanPath(path)}: {
    query: (prompt: string, opts?: RequestOptions) => {
        return createRequest<Zod.infer<typeof ${cleanPath(
          path
        )}_${type_prefix}>>({
          username: "${username}",
          path: "${path}",
        })(prompt, {
          token: opts?.token || forgeKey,
          cache: opts?.cache,
          model: opts?.model,
        });
      },
},`;

const imageFunctionTemplate = (username: string, path: string) => `
${cleanPath(path)}: {
    queryImage: (prompt: { imageUrl: string, prompt: string }, opts?: RequestOptions) => {
        return createRequest<Zod.infer<typeof ${cleanPath(
          path
        )}_${type_prefix}>>({
          username: "${username}",
          path: "${path}",
          contentType: "image"
        })(prompt, {
          token: opts?.token || forgeKey,
          cache: opts?.cache,
          model: opts?.model,
        });
      },
},`;

const buildFunctions = (
  username: string,
  configs: { config: Required<SchemaConfig>; file: string }[]
) => {
  return configs
    .map((config) =>
      config.config.contentType === "image"
        ? imageFunctionTemplate(username, config.config.path)
        : functionTemplate(username, config.config.path)
    )
    .join("\n");
};

const buildImports = (configs: { config: any; file: string }[]) => {
  return configs
    .map(
      (config) =>
        `import ${cleanPath(
          config.config.path
        )}_${type_prefix} from "./${config.file.replace(
          ".ts",
          ".generated.ts"
        )}"`
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
      ${buildRag()}
      ${buildFunctions(username, configs)}
    };
  };
  `;
};

const createClient = async () => {
  // Get all of the schema files
  const files = loadDirectoryFiles();
  // Ensure the forge lock directory exists
  const forgeLockDir = path.join(process.cwd(), cfg.forgeLockPath);
  if (!fs.existsSync(forgeLockDir)) {
    fs.mkdirSync(forgeLockDir, { recursive: true });
  }

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

        const schemaDir = path.join(process.cwd(), cfg.forgeLockPath);
        switch (projectService.language.get()) {
          case "typescript":
            {
              const destPath = path.join(
                schemaDir,
                file.replace(".ts", ".generated.ts")
              );
              fs.copyFileSync(filePath, destPath);
            }
            break;
          case "javascript":
            {
              // do nothing
            }
            break;
        }

        return { config: config, file: file };
      })
    )
  ).filter((x): x is { config: any; file: string } => !!x);

  const username = projectService.username.get();

  return buildClient(username, configs);
};

const compileForgeLock = async (code: string) => {
  console.log("Creating forge.lock (generated client)");

  const forgeLockPath = path.join(process.cwd(), cfg.forgeLockPath);

  if (projectService.language.get() === "typescript") {
    const target = path.join(forgeLockPath, "index.ts");
    fs.writeFileSync(target, code);
  } else {
    compileTypeScriptModule(code, path.join(forgeLockPath, "index.js"));
  }
};

// Clear the forge.lock directory
const clearForgeLock = () => {
  const forgeLockPath = path.join(process.cwd(), cfg.forgeLockPath);

  if (fs.existsSync(forgeLockPath)) {
    fs.readdirSync(forgeLockPath).forEach((file) => {
      const filePath = path.join(forgeLockPath, file);
      fs.unlinkSync(filePath);
    });
  }
};

export const generate = async () => {
  const boilerplate = loadBoilerplateFile("generated_client.ts.txt");

  clearForgeLock();

  const username = projectService.username.get();
  if (!username) {
    await loadAndSetUsername();
  }

  const clientCode = await createClient();

  // @TODO: make this dynamic
  const variable_declarations = `
  const serverUrl = "${cfg.serverUrl}"
  `;

  const ext = projectService.language.getExt();

  // write the generated client
  compileForgeLock(variable_declarations + boilerplate + clientCode);
  console.log(
    "Client code re-generated and written to " +
      cWrap.fg(path.join(cfg.forgeLockPath, "index" + ext)) +
      ".\n"
  );
};
