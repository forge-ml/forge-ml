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

const buildDocuments = () => `
$documents: {
   get: (id: string) => {
    return getDocument(id, {forgeKey});
   },
   create: ({ name, text, collectionIds }: { name: string, text: string, collectionIds?: string[] }) => {
    return createDocument({ name, text, collectionIds: collectionIds || [] }, {forgeKey});
   },
   delete: (id: string) => {
    return deleteDocument(id, {forgeKey});
   },
   addToCollections: (id: string, collectionIds: string[]) => {
    return addDocumentToCollections(id, collectionIds, {forgeKey});
   },
   removeFromCollections: (id: string, collectionIds: string[]) => {
    return removeDocumentFromCollections(id, collectionIds, {forgeKey});
   },
},
`;

const buildCollections = () => `
$collections: {
   get: (id: string) => {
    return getCollection(id, {forgeKey});
   },
   create: ({ name, documentIds }: { name: string, documentIds?: string[] }) => {
    return createCollection({ name, documentIds: documentIds || [] }, {forgeKey});
   },
   delete: (id: string, options?: { deleteDocuments: boolean }) => {
    return deleteCollection(id, { deleteDocuments: options?.deleteDocuments || false }, {forgeKey});
   },
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

const buildImports = (configs: { config: any; file: string }[], isCommonJS: boolean) => {
  return configs
    .map(
      (config) =>
        isCommonJS
          ? `const ${cleanPath(config.config.path)}_${type_prefix} = require("./${config.file.replace(".ts", ".generated.js")}");`
          : `import ${cleanPath(config.config.path)}_${type_prefix} from "./${config.file.replace(".ts", ".generated.ts")}";`
    )
    .join("\n");
};

const buildClient = (
  username: string,
  configs: { config: any; file: string }[],
  isCommonJS: boolean
) => {
  const clientCode = `
  ${buildImports(configs, isCommonJS)}

  const generatedClient = (forgeKey: string) => {
    return {
      ${buildDocuments()}
      ${buildCollections()}
      ${buildRag()}
      ${buildFunctions(username, configs)}
    };
  };
  `;

  return clientCode;
};

const createClient = async (isCommonJS: boolean) => {
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
                file.replace(".ts", isCommonJS ? ".generated.js" : ".generated.ts")
              );
              if (isCommonJS) {
                const tsCode = fs.readFileSync(filePath, 'utf-8');
                const commonCode = tsCode.replace(/import (.+) from "(.+)";/g, 'const $1 = require("$2");');
                compileTypeScriptModule(commonCode, destPath);
              } else {
                fs.copyFileSync(filePath, destPath);
              }
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

  return buildClient(username, configs, isCommonJS);
};

const compileForgeLock = async (code: string, isCommonJS: boolean) => {
  console.log("Creating forge.lock (generated client)");

  const forgeLockPath = path.join(process.cwd(), cfg.forgeLockPath);

  if (projectService.language.get() === "typescript") {
    const target = path.join(forgeLockPath, isCommonJS ? "index.js" : "index.ts");
    if (isCommonJS) {
      const commonCode = code.replace(/import (.+) from "(.+)";/g, 'const $1 = require("$2");');
      compileTypeScriptModule(commonCode, target);
    } else {
      fs.writeFileSync(target, code);
    }
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

export const generate = async (isCommonJS: boolean = false) => {
  const boilerplate = loadBoilerplateFile("generated_client.ts.txt");

  clearForgeLock();

  const username = projectService.username.get();
  if (!username) {
    await loadAndSetUsername();
  }

  const clientCode = await createClient(isCommonJS);

  // @TODO: make this dynamic
  const variable_declarations = `
  const serverUrl = "${cfg.serverUrl}"
  `;

  const ext = isCommonJS ? ".js" : projectService.language.getExt();

  // Coerce boilerplate to use require when commonjs is true
  const commonBoilerplate = isCommonJS
    ? boilerplate.replace(/export default Forge;/, '')
        + '\nmodule.exports = Forge;'

    : boilerplate;

  // write the generated client
  compileForgeLock(variable_declarations + commonBoilerplate + clientCode, isCommonJS);
  console.log(
    "Client code re-generated and written to " +
      cWrap.fg(path.join(cfg.forgeLockPath, "index" + ext)) +
      ".\n"
  );
};
