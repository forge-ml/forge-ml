import fs from "fs";
import { config } from "../../config/config";
import login from "./login";
import { Keys } from "../../commands/key";

const API_KEY_FILE_PATH = config.apiKeyFilePath;

const localConfigService = {
  loadConfig: (filePath = API_KEY_FILE_PATH): Record<string, string> => {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const value = fs.readFileSync(filePath, "utf8");
    try {
      return JSON.parse(value);
    } catch (error) {
      return {};
    }
  },
  storeValue: (key: string, value: string, filePath = API_KEY_FILE_PATH) => {
    const config = localConfigService.loadConfig(filePath);
    config[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(config));
  },
  deleteValue: (key: string, filePath = API_KEY_FILE_PATH): boolean => {
    const config = localConfigService.loadConfig(filePath);
    delete config[key];
    fs.writeFileSync(filePath, JSON.stringify(config));
    return true;
  },
  getValue: (key: string, filePath = API_KEY_FILE_PATH): string | null => {
    const config = localConfigService.loadConfig(filePath);
    return config[key] || null;
  },
  useAuthGuard: () => {
    const apiKey = localConfigService.getValue(Keys.FORGE);
    if (apiKey === null) {
      console.log("No API key found. Please login to continue.");
      login();
      return false;
    }
    return true;
  },
};

export default localConfigService;
