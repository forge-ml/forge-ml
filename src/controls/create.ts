import path from "path";
import makeRequest, { EP } from "../utils/request";
import fs from "fs";
import { cWrap } from "../utils/logging";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { selectOption, selectOptionBinary } from "../utils/optionSelect";
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

const questions = [
  {
    type: "input",
    question:
      "What do you want the path of your schema to be? (required, must be one lowercase word, no special characters)\n",
    validate: (answer: string) => /^[a-z0-9]+$/.test(answer),
    errorMessage:
      "Error: path must be all lowercase and contain no special characters",
    required: true,
  },
  {
    type: "select",
    question: "Is this a public or private path?\n",
    options: [PathPrivacy.PUBLIC, PathPrivacy.PRIVATE],
  },
  {
    type: "select",
    question: "What is the content type of your schema?\n",
    options: ["text", "image"],
  },
  {
    type: "select",
    question: "Would you like to cache your schema?\n",
    options: [CacheType.NONE, CacheType.COMMON, CacheType.INDIVIDUAL],
  },
  {
    type: "select",
    question: "Which model would you like to use?\n",
    options: ["gpt-4o-mini", "gpt-4o", "gpt-4", "gpt-3.5-turbo", "Custom"],
  },
  {
    type: "input",
    question:
      "What's the id of your custom model? (required for custom models)\n",
    conditional: (answers) => answers[answers.length - 1] === "Custom",
    required: true,
  },
  {
    type: "input",
    question: "What do you want the name of your endpoint to be? (optional)\n",
    optional: true,
  },
  {
    type: "input",
    question:
      "What do you want the description of your endpoint to be? (optional)\n",
    optional: true,
  },
  {
    type: "input",
    question:
      "Enter a prompt for your schema? (ex. Generate a Person schema with attributes like a job, name, age, etc.)\n",
    required: true,
  },
];

const getAnswer = async (
  question: any,
  previousAnswers: string[]
): Promise<string | null> => {
  if (question.conditional && !question.conditional(previousAnswers)) {
    return null;
  }

  if (question.type === "select") {
    process.stdout.write(cWrap.fm(question.question)); //used process stdout to avoid new line
    return question.options.length === 2
      ? selectOptionBinary(question.options)
      : selectOption(question.options);
  } else if (question.type === "input") {
    const rl = readline.createInterface({ input, output });
    const answer = await askQuestion(rl, question.question);
    rl.close();

    if (!answer && !question.optional) {
      console.log(cWrap.br("Error: you need to add a response"));
      process.exit(0);
    }

    if (question.validate && !question.validate(answer)) {
      console.log(cWrap.br(question.errorMessage));
      process.exit(0);
    }

    return answer || "";
  }

  throw new Error("Unsupported question type");
};

const create = async () => {
  console.log(cWrap.fb("Let's build your schema:"));

  const answers = [];
  for (const question of questions) {
    const answer = await getAnswer(question, answers);
    if (answer !== null) {
      answers.push(answer);
      if (question.type === "select") output.write("\n");
    }
  }

  //create an object that matches questions to answers - adjusted one question for custom model input
  const promptAnswers = {
    path: answers[0],
    public: answers[1],
    contentType: answers[2],
    cache: answers[3],
    model: answers[4] === "Custom" ? answers[5] : answers[4],
    endpointName: answers[4] === "Custom" ? answers[6] : answers[5],
    endpointDescription: answers[4] === "Custom" ? answers[7] : answers[6],
    schemaPrompt:
      "Be generous about adding .describe for mini-prompting. " +
      (answers[4] === "Custom" ? answers[8] : answers[7]),
  };

  console.log(cWrap.fm("\nCreating schema..."));

  try {
    const response = await makeRequest(EP.CREATE, {
      method: "POST",
      data: promptAnswers,
    });

    if (response.message === "OpenAI provider key is required") {
      console.log(
        cWrap.fr(
          "You have not set up an OpenAI key. Please set up an OpenAI key by running `forge key set`"
        )
      );
      process.exit(1);
    }

    if (response.error) {
      //This error handling work but backend shouldn't be wrapping errors in errors - fix

      if (response.error.response.data) {
        if (
          response.error.response.data ===
          "Invalid API key provided. Please check your API key and try again."
        ) {
          console.log(
            cWrap.fr(
              "There was an OpenAI invalid key error when testing your schema: Please verify if you have an active OpenAI key set up in your account.\nIf not, you can set your OpenAI key by running `forge key set`"
            )
          );
          process.exit(1);
        } else {
          console.log(cWrap.fr(response.error.response.data));
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
