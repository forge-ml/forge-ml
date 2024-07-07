import { config } from "../../config/config";
import authService from "./svc";

const logout = () => {
  const success = authService.deleteAPIKey();
  if (success) {
    console.log("Bye!");
  } else {
    console.log("No API key found at", config.apiKeyFilePath);
  }
};

export default logout;
