import { config } from "../../config/config";
import localConfigService from "./svc";

const logout = () => {
  const success = localConfigService.deleteAPIKey();
  if (success) {
    console.log("Bye!");
  } else {
    console.log("No API key found at", config.apiKeyFilePath);
  }
};

export default logout;
