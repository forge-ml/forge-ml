import path from "path";
import makeRequest, { EP } from "../utils/request";
import fs from "fs";
import { cWrap } from "../utils/logging";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import {
  selectOption,
  selectOptionBinary,
  selectOptionBinaryRaw,
  selectOptionRaw,
} from "../utils/optionSelect";
import { config } from "../config/config";

//TODO: VALIDATION FOR FORGE FILE PATH
//TODO BACKLOG: Manual schema creation

enum PathPrivacy {
  PUBLIC = "public",
  PRIVATE = "private",
}

enum CacheType {
  COMMON = "Common",
  NONE = "None",
  INDIVIDUAL = "Individual",
}

enum ContentType {
  TEXT = "text",
  IMAGE = "image",
}

const askQuestion = (
  rl: readline.Interface,
  question: string
): Promise<string | null> => {
  return new Promise((resolve) => {
    rl.question(cWrap.fm(question), (answer) => {
      resolve(answer);
    });
  });
};

//VALIDATION CREATE SHOULD ONLY BE CALLED AFTER INIT?

type InputQuestion = {
  type: "input";
};

type SelectQuestion = {
  type: "select";
  options:
    | string[]
    | ((answers: Record<string, string>) => { label: string; value: string }[]);
};

type Question = {
  question: string;
  conditional?: (answers: Record<string, string>) => boolean;
  required?: boolean;
  optional?: boolean;
  validate?: (answer: string) => boolean;
  errorMessage?: string;
} & (InputQuestion | SelectQuestion);

const modelOptions = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4", "gpt-3.5-turbo", "Custom"],
  anthropic: [
    "claude-3-5-sonnet-20240620",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240307",
    "claude-3-haiku-20240307",
  ],
};

const withFirstAsDefault = (options: string[]) =>
  options.map((option) => ({
    label: option + (option === options[0] ? " (default)" : ""),
    value: option,
  }));

const questions: Record<string, Question> = {
  path: {
    type: "input",
    question:
      "What do you want the path of your schema to be? (required, must be one lowercase word, no special characters)\n",
    validate: (answer: string) => /^[a-z0-9]+$/.test(answer),
    errorMessage:
      "Error: path must be all lowercase and contain no special characters",
    required: true,
  },
  privacy: {
    type: "select",
    question: "Is this a public or private path?\n",
    options: [PathPrivacy.PUBLIC, PathPrivacy.PRIVATE],
  },
  cache: {
    type: "select",
    question: "Would you like to cache your schema?\n",
    options: [CacheType.NONE, CacheType.COMMON, CacheType.INDIVIDUAL],
  },
  contentType: {
    type: "select",
    question: "What is the content type of your schema?\n",
    options: [ContentType.TEXT, ContentType.IMAGE],
  },
  provider: {
    type: "select",
    question: "Which provider would you like to use?\n",
    options: ["openai", "anthropic"],
  },
  model: {
    type: "select",
    question: "Which model would you like to use?\n",
    options: (answers: Record<string, string>) =>
      withFirstAsDefault(
        modelOptions[answers["provider"] as keyof typeof modelOptions]
      ),
  },
  customModelId: {
    type: "input",
    question:
      "What's the id of your custom model? (required for custom models)\n",
    conditional: (answers: Record<string, string>) =>
      answers["model"] === "Custom",
    required: true,
  },
  endpointName: {
    type: "input",
    question: "What do you want the name of your endpoint to be? (optional)\n",
    optional: true,
  },
  endpointDescription: {
    type: "input",
    question:
      "What do you want the description of your endpoint to be? (optional)\n",
    optional: true,
  },
  schemaPrompt: {
    type: "input",
    question:
      "Enter a prompt for your schema? (ex. Generate a Person schema with attributes like a job, name, age, etc.)\n",
    required: true,
  },
} as const;

const getAnswer = async (
  question: (typeof questions)[keyof typeof questions],
  previousAnswers: Record<string, string>
): Promise<string | null> => {
  if (question.conditional && !question.conditional(previousAnswers)) {
    return null;
  }

  if (question.type === "select" && question.options) {
    process.stdout.write(cWrap.fm(question.question)); //used process stdout to avoid new line

    if (typeof question.options === "function") {
      const options = question.options(previousAnswers);
      return question.options.length === 2
        ? await selectOptionBinaryRaw(options)
        : await selectOptionRaw(options);
    } else {
      const options = question.options;
      return question.options.length === 2
        ? await selectOptionBinary(options)
        : await selectOption(options);
    }
  } else if (question.type === "input") {
    const rl = readline.createInterface({ input, output });
    const answer = await askQuestion(rl, question.question);
    rl.close();

    if (!answer && !question.optional) {
      console.log(cWrap.br("Error: you need to add a response"));
      process.exit(0);
    }

    if (question.validate && !question.validate(answer || "")) {
      console.log(cWrap.br(question.errorMessage || ""));
      process.exit(0);
    }

    return answer || "";
  }

  throw new Error("Unsupported question type");
};

const create = async () => {
  console.log(cWrap.fb("Let's build your schema:"));

  const answers: Record<string, string> = {};
  for (const key in questions) {
    const question = questions[key as keyof typeof questions];
    const answer = await getAnswer(question, answers);
    if (answer !== null) {
      answers[key as keyof typeof answers] = answer;
      if (question.type === "select") output.write("\n");
    }
  }

  //create an object that matches questions to answers - adjusted one question for custom model input
  const promptAnswers = {
    path: answers["path"],
    public: answers["privacy"],
    cache: answers["cache"],
    contentType: answers["contentType"],
    model:
      answers["model"] === "Custom"
        ? answers["customModelId"]
        : answers["model"],
    endpointName: answers["endpointName"],
    endpointDescription: answers["endpointDescription"],
    schemaPrompt:
      "Be generous about adding .describe for mini-prompting. " +
      answers["schemaPrompt"],
    provider: answers["provider"],
  };

  console.log(cWrap.fm("\nCreating schema..."));

  try {
    const response = await makeRequest(EP.CREATE, {
      method: "POST",
      data: promptAnswers,
    });

    if (response.message?.includes("key is required")) {
      console.log(
        cWrap.fr(
          "You have not set up a provider key. Please set up a provider key by running `forge key set`"
        )
      );
      process.exit(1);
    }

    if (response.error) {
      //This error handling work but backend shouldn't be wrapping errors in errors - fix

      if (response.error?.response?.data) {
        if (
          response.error?.response?.data ===
          "Invalid API key provided. Please check your API key and try again."
        ) {
          console.log(
            cWrap.fr(
              "There was an invalid key error when testing your schema: Please verify that you have an active provider key set up in your account.\nIf not, you can set your key by running `forge key set`"
            )
          );
          process.exit(1);
        } else {
          console.log(cWrap.fr(JSON.stringify(response.error?.response?.data)));
          process.exit(1);
        }
      }

      console.log(cWrap.fr("Error generating schema"));
      process.exit(1);
    }

    //on healthy response, offer to write to file in forge folder
    console.log(cWrap.fm("Here is your schema:\n\n"), cWrap.fg(response.data));

    console.log(cWrap.fm("\nDo you want to write this to a file?"));
    const write = await selectOptionBinary(["Yes", "No"]);

    if (write === "Yes") {
      //DOUBLE CHECK THAT THIS IS THE CORRECT FILE PATH
      //DOUBLE CHECK NAMING CONVENTION FOR SCHEMA FILE
      const schemaDir = path.join(process.cwd(), config.schemaPath);
      const filePath = promptAnswers.path + ".ts";

      //filename uses endpoint path - CHECK IF SHOULD HAVE schema.ts
      const destinationFilePath = path.join(schemaDir, filePath);

      console.log(cWrap.fm("\nDestination file path:"), destinationFilePath);

      //check if directory exists
      const directoryExists = fs.existsSync(schemaDir);
      if (!directoryExists) {
        console.log(cWrap.fm("Forge directory does not exist. Creating..."));
        fs.mkdirSync(schemaDir, { recursive: true });
      }

      //check if file exists - notify user and ask to overwrite
      if (fs.existsSync(destinationFilePath)) {
        console.log(
          cWrap.fm("File already exists. Do you want to overwrite it?")
        );
        const overwrite = await selectOptionBinary(["Yes", "No"]);

        if (overwrite === "No") {
          console.log(
            cWrap.fm(
              "\nSchema was not written to file. Feel free to try again."
            )
          );
          console.log(cWrap.fm("Exiting..."));
          return;
        }

        //overwrite file
        try {
          console.log(cWrap.fm("\nWriting to file..."));
          fs.writeFileSync(destinationFilePath, response.data);
          console.log(cWrap.fm("File has been overwritten"));
          console.log(
            cWrap.fm("You can deploy your file by running:"),
            cWrap.fg("forge deploy")
          );
          console.log(
            cWrap.fm("You can test your file by running:"),
            cWrap.fg("forge test " + config.schemaPath + "/" + filePath)
          );
        } catch (error) {
          console.error(cWrap.fr("Failed to write file:"), error);
        }
      } else {
        //write file to destination
        try {
          console.log(cWrap.fm("\nWriting to file..."));
          fs.writeFileSync(destinationFilePath, response.data);

          console.log(cWrap.fm("File has been written"));
          console.log(
            cWrap.fm("You can deploy your file by running:"),
            cWrap.fg("forge deploy")
          );
          console.log(
            cWrap.fm("You can test your file by running:"),
            cWrap.fg("forge test " + config.schemaPath + "/" + filePath)
          );
        } catch (error) {
          console.error(cWrap.fr("\nFailed to write file:"), error);
        }
      }
    } else {
      //incase user selects don't write to file
      console.log(
        cWrap.fm("\nSchema was not written to file. Feel free to try again.")
      );
    }

    return response;
  } catch (error) {
    console.error(cWrap.fr("Failed to create schema:"));
    process.exit(1);
  }
};

export { create };
