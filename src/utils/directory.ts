import path from "path";
import { config } from "../config/config";
import fs from "fs";

import { cWrap } from "./logging";

export const loadDirectoryFiles = () => {
  try {
    return fs.readdirSync(path.join(process.cwd(), config.schemaPath));
  } catch (error) {
    console.error(
      cWrap.fr(
        `Error reading schema directory \`${config.schemaPath}\`. Please verify it exists and try again.`,
      ),
    );
    return [];
  }
};