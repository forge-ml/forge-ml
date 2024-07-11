import { importZod } from "../utils/imports";
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

  const rl = readline.createInterface({ input, output });

  rl.question("Enter a prompt to test your schema: ", async (prompt) => {
    const res = await makeRequest(EP.TEST, {
      method: "POST",
      data: {
        schema: JSON.stringify(json),
        prompt,
      },
    });

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
