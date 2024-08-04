import { CacheType } from "./config";

export const importZod = (from: string) => {
  return import(from).then((module) => {
    if (!("_def" in module.default)) {
      throw Error(
        "Friend! The default export is not a zod schema. What were you thinking?" +
          `\n` +
          "Update your default export and try again."
      );
    }

    return module.default as unknown as Zod.Schema;
  });
};

type Config = {
  path?: string;
  public?: boolean;
  cache?: CacheType;
  name?: string;
  description?: string;
  contentType?: "text" | "image";
  model?: string;
};

export const importConfig = (from: string) => {
  return import(from).then((module) => {
    return module.config as Config;
  });
};
