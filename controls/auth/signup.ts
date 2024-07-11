import axios from "axios";
import { config } from "../../config/config";
import prompt from "prompt-sync";
import localConfigService from "./svc";
import { Keys } from "../../commands/key";

const signup = async () => {
  const email = prompt()("Enter your email: ");
  const userName = prompt()("Enter your username: ");
  const password = prompt().hide("Enter your password: ");
  const apiKey = prompt().hide(
    `Enter your OpenAI API key (this is used for ${config.bin} test and deployed schemas): `
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
      console.log("Your API key is stored here: ", config.apiKeyFilePath);
      console.log("Your username is: '" + username + "'");

      // Set the apiKey for future requests
      localConfigService.storeAPIKey(apiKey);
      localConfigService.storeValue(Keys.OPENAI, apiKey);
    } else {
      console.error(
        "Signup failed. Please check your credentials and try again."
      );
    }
  } catch (error: any) {
    console.error("An error occurred during signup:", error.message);
  }
};

export default signup;
