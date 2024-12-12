import fs from "fs";
import path, { dirname } from "path";
import { config } from "../config/config";

type ForgeConfig = {
  language: "typescript" | "javascript";
  username: string;
  projectId: string;
};

const defaultForgeConfig: ForgeConfig = {
  language: "typescript",
  username: "",
  projectId: "",
};

const projectService = {
  getForgeConfig: (): ForgeConfig => {
    const forgeConfigPath = path.join(process.cwd(), config.forgeConfigPath);

    // create if not exists
    if (!fs.existsSync(forgeConfigPath)) {
      fs.mkdirSync(dirname(forgeConfigPath), { recursive: true });
      fs.writeFileSync(
        forgeConfigPath,
        JSON.stringify(defaultForgeConfig, null, 2)
      );
    }

    const configContent = fs.readFileSync(forgeConfigPath, "utf-8");
    return JSON.parse(configContent) as ForgeConfig;
  },

  updateForgeConfig: (newConfig: Partial<ForgeConfig>): ForgeConfig => {
    const forgeConfigPath = path.join(process.cwd(), config.forgeConfigPath);

    const currentConfig = projectService.getForgeConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };

    fs.writeFileSync(forgeConfigPath, JSON.stringify(updatedConfig, null, 2));

    return updatedConfig;
  },
  language: {
    get: (): "typescript" | "javascript" => {
      const forgeConfig = projectService.getForgeConfig();
      return forgeConfig.language;
    },
    set: (language: "typescript" | "javascript"): void => {
      projectService.updateForgeConfig({ language });
    },
    getExt: (): string => {
      return projectService.language.get() === "typescript" ? ".ts" : ".js";
    },
  },
  username: {
    get: (): string => {
      const forgeConfig = projectService.getForgeConfig();
      return forgeConfig.username;
    },
    set: (username: string): string => {
      projectService.updateForgeConfig({ username });
      return username;
    },
  },
  projectId: {
    get: (): string => {
      const forgeConfig = projectService.getForgeConfig();
      return forgeConfig.projectId;
    },
    set: (projectId: string): string => {
      projectService.updateForgeConfig({ projectId });
      return projectId;
    },
  },
};

export default projectService;
