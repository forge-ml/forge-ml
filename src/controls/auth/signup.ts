import axios, { isAxiosError } from "axios";
import prompt from "prompt-sync";
import { Keys } from "../../commands/key";
import { config } from "../../config/config";
import localConfigService from "./svc";
import PromptSyncPlus from "prompt-sync-plus";
import cWrap from "../../utils/logging";

const c = {
  echo: "* ",
} as Parameters<typeof PromptSyncPlus>[0];

const signup = async () => {
  const email = prompt()("Enter your email: ");
  const password = prompt()({ ask: "Enter your password: ", echo: "* " });
  const userName = prompt()("Enter your username: ");
  console.log(
    cWrap.fm(`
We're going to ask for your API keys for OpenAI, Anthropic, and Groq.
You can set up all of them, or just the one you most commonly use. Press enter to skip a key.

These keys will be used whenever you use the generated forge sdk.

`)
  );
  const openAIKey = PromptSyncPlus(c)(
    `Enter your OpenAI API key [https://platform.openai.com/api-keys]: `
  );
  const anthropicKey = PromptSyncPlus(c)(
    `Enter your Anthropic API key [https://console.anthropic.com/settings/keys]: `
  );
  const groqKey = PromptSyncPlus(c)(
    `Enter your Groq API key [https://console.groq.com/keys]: `
  );

  if (!email || !password || !userName) {
    console.error("All fields are required.");
    return;
  }

  if (!openAIKey && !anthropicKey && !groqKey) {
    console.error("Please provide an API key for at least one LLM provider.");
    return;
  }

  try {
    const response = await axios.post(`${config.serverUrl}/cli/signup`, {
      email,
      password,
      openAIKey,
      anthropicKey,
      userName,
    });

    if (response.status >= 200 && response.status < 300) {
      const apiKey = response.data.apiKey;
      const username = response.data.userName;
      console.log("Signup successful!");
      console.log("Your username is: '" + username + "'");

      // Set the apiKey for future requests
      localConfigService.storeValue(Keys.FORGE, apiKey);
      localConfigService.storeValue(Keys.OPENAI, openAIKey);
      localConfigService.storeValue(Keys.ANTHROPIC, anthropicKey);

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
