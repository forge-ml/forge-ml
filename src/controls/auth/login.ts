import axios, { isAxiosError } from "axios";
import prompt from "prompt-sync";
import { Keys } from "../../commands/key";
import { config } from "../../config/config";
import localConfigService from "./svc";

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
      localConfigService.storeValue(Keys.FORGE, apiKey);
      console.log(
        `Your ${config.bin} configuration is stored here: ${config.apiKeyFilePath}`
      );
    } else {
      console.error(
        "Login failed. Please check your credentials and try again."
      );
    }
  } catch (error: any) {
    console.error("An error occurred during login:", error.message);
    if (isAxiosError(error)) {
      const data = JSON.stringify(error.response?.data, null, 2);
      console.error("axios error:", data);
    }
  }
};
export default login;
