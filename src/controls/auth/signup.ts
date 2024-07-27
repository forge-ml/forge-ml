import axios, { isAxiosError } from "axios";
import prompt from "prompt-sync";
import { Keys } from "../../commands/key";
import { config } from "../../config/config";
import localConfigService from "./svc";

const signup = async () => {
  const email = prompt()("Enter your email: ");
  const password = prompt().hide("Enter your password: ");
  const userName = prompt()("Enter your username: ");
  const apiKey = prompt().hide(
    `Enter your OpenAI API key (this is used for ${config.bin} test and deployed schemas) [https://platform.openai.com/api-keys]: `
  );

  try {
    const response = await axios.post(`${config.serverUrl}/cli/signup`, {
      email,
      password,
      apiKey,
      userName,
    });

    if (response.status >= 200 && response.status < 300) {
      const apiKey = response.data.apiKey;
      const username = response.data.userName;
      console.log("Signup successful!");
      console.log("Your username is: '" + username + "'");

      // Set the apiKey for future requests
      localConfigService.storeValue(Keys.FORGE, apiKey);
      localConfigService.storeValue(Keys.OPENAI, apiKey);

      console.log(
        `Your ${config.bin} configuration is stored here: ${config.apiKeyFilePath}`
      );
    } else {
      console.error(
        "Signup failed. Please check your credentials and try again."
      );
    }
  } catch (error: any) {
    console.error("An error occurred during signup:", error.message);
    if (isAxiosError(error)) {
      const data = JSON.stringify(error.response?.data, null, 2);
      console.error("axios error:", data);
    }
  }
};

export default signup;
