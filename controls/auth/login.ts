import axios from "axios";
import prompt from "prompt-sync";
import localConfigService from "./svc";
import { config } from "../../config/config";


const login = async () => {
  const email = prompt()("Enter your email: ");
  const password = prompt().hide("Enter your password: ");

  try {
    const response = await axios.post(`${config.serverUrl}/cli/login`, {
      email,
      password,
    });

    if (response.status === 200) {
      const apiKey = response.data.apiKey;
      console.log("Login successful!");

      // Set the apiKey for future requests
      localConfigService.storeAPIKey(apiKey);
    } else {
      console.error(
        "Login failed. Please check your credentials and try again."
      );
    }
  } catch (error: any) {
    console.error("An error occurred during login:", error.message);
  }
};
export default login;
