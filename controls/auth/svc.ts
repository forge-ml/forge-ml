import fs from "fs";
import { config } from "../../config/config";

const API_KEY_FILE_PATH = config.apiKeyFilePath;

const authService = {
  storeAPIKey: (key: string, filePath = API_KEY_FILE_PATH) => {
    const apiKey = { key };
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(apiKey));
  },
  getAPIKey: (filePath = API_KEY_FILE_PATH): string | null => {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const apiKey = fs.readFileSync(filePath, "utf8");
    return JSON.parse(apiKey).key;
  },
  deleteAPIKey: (filePath = API_KEY_FILE_PATH): boolean => {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    fs.unlinkSync(filePath);
    return true;
  },
};

export default authService;
