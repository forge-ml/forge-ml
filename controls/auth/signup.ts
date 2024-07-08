import axios from "axios";
import { config } from "../../config/config";
import prompt from "prompt-sync";
import authService from "./svc";

const signup = async () => {
  const email = prompt()("Enter your email: ");
  const password = prompt().hide("Enter your password: ");
  
  try {
    const response = await axios.post(
      `${config.serverUrl}/cli/signup`,
      {
        email,
        password,
      }
    );

    if (response.status >= 200 && response.status < 300) {
      const apiKey = response.data.apiKey;
      console.log("Signup successful!");

      // Set the apiKey for future requests
      authService.storeAPIKey(apiKey);
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