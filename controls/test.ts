import { importZod } from "../utils/imports";
import { toJSON } from "../utils/toJSON";
import path from "path";
import makeRequest, { EP } from "../utils/request";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

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

    rl.close();
  });
};

export default test;
