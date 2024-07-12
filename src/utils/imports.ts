import fs from "fs";
import { toJSON } from "./toJSON";

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

export const importConfig = (from: string) => {
  return import(from).then((module) => {
    return module.config as { path?: string };
  });
};
