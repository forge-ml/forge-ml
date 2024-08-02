import { importConfig, importZod } from "../utils/imports";
import { toJSON } from "../utils/toJSON";
import path from "path";
import makeRequest, { EP } from "../utils/request";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import cWrap from "../utils/logging";
import getErrorMessage from "./auth/errors.util";

const test = async (inFile: string) => {
  const filePath = path.join(process.cwd(), inFile);
  const zod = await importZod(filePath);
  const json = toJSON(zod);

  const config = await importConfig(filePath);
  const modelSetting = config.model || "GPT4oMini";
  const rl = readline.createInterface({ input, output });

  rl.question("Enter a prompt to test your schema: ", async (prompt) => {
    const res = await makeRequest(EP.TEST, {
      method: "POST",
      data: {
        schema: JSON.stringify(json),
        prompt,
        modelSetting,
      },
    });

    //in case user signs up with no openAI key
    if (res.message === "OpenAI provider key is required") {
      console.log(
        cWrap.fr(
          "You have not set up an OpenAI key. Please set up an OpenAI key by running `forge key set`"
        )
      );
      process.exit(1);
    }

    if (
      res.data.error ===
      "Invalid API key provided. Please check your API key and try again."
    ) {
      console.log(
        cWrap.fr(
          "There was an OpenAI invalid key error when testing your schema: Please verify if you have an active OpenAI key set up in your account.\nIf not, you can set your OpenAI key by running `forge key set`"
        )
      );
      process.exit(1);
    }
    if (res.error) {
      console.log(cWrap.br(res.error as string));
      console.log(cWrap.fr("Issue testing " + inFile + ":\n"));
      console.log(cWrap.fr(getErrorMessage(res.message)));
      process.exit(1);
    } else {
      console.log(cWrap.bg("Healthy response from " + inFile));
      console.log(res.data);
    }

    rl.close();
  });
};

export default test;
