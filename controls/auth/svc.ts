import fs from "fs";
import { config } from "../../config/config";
import login from "./login";

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
  useAuthGuard: () => {
    const apiKey = authService.getAPIKey();
    if (apiKey === null) {
      console.log("No API key found. Please login to continue.");
      login();
      return false;
    }
    return true;
  },
};

export default authService;
