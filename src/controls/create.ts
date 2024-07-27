import { importConfig, importZod } from "../utils/imports";
import { toJSON } from "../utils/toJSON";
import path from "path";
import makeRequest, { EP } from "../utils/request";
import fs from "fs";
import { cWrap } from "../utils/logging";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { selectOptionBinary, selectOption } from "../utils/optionSelect";

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

const create = async () => {
  //AI generated schema creation
  const questions: string[] = [
    "What do you want the path of your schema to be? (required, must be one lowercase word, no special characters)\n",
    "Is this a public path?\n", // not used
    "Would you like to cache your schema? (None - no caching, Common - cache is shared amongst all users, Individual - cache is unique to each user)\n",
    "What do you want the name of your endpoint to be? (optional)\n",
    "What do you want the description of your endpoint to be? (optional)\n",
    "Enter a prompt for your schema? (ex. Generate a Person schema with attributes like a job, name, age, etc.)\n",
  ];

  const answers: string[] = [];
  const optionalQuestions = [3, 4];

  console.log(cWrap.fb("Let's build your schema:"));

  for (let i = 0; i < questions.length; i++) {
    if (i === 1) {
      console.log(cWrap.fm("Is this a public or private path?"));
      const privacy = await selectOptionBinary([
        PathPrivacy.PUBLIC,
        PathPrivacy.PRIVATE,
      ]);
      answers.push(privacy);
    } else if (i === 2) {
      console.log(cWrap.fm("\nWould you like to cache your schema?"));
      const cache = await selectOptionBinary([
        CacheType.NONE,
        CacheType.COMMON,
        CacheType.INDIVIDUAL,
      ]);
      answers.push(cache);
      output.write("\n");
    } else {
      //TO FIX: when readline is in else statement public and private disappear on user input
      //when readline is on outside the user can type during public/private input
      const rl = readline.createInterface({ input, output }); // open and closing within loop because rl doesn't work with select option
      const answer = await askQuestion(rl, questions[i]);
      if (answer) {
        //validate that path is all lowercase and contains no special characters
        if (i === 0 && !/^[a-z0-9]+$/.test(answer)) {
          console.log(
            cWrap.br(
              "Error: path must be all lowercase and contain no special characters"
            )
          );
          process.exit(0);
        }

        answers.push(answer);
      } else if (
        optionalQuestions.includes(i) &&
        (!answer || answer.trim() === "")
      ) {
        //if user doesn't want to add a response, just add an empty string - FOR OPTIONAL QUESTIONS
        answers.push("");
      } else if (!answer || answer.trim() === "") {
        console.log(cWrap.br("Error: you need to add a response"));
        rl.close();
        process.exit(0);
      }
      rl.close();
    }
  }

  //create an object that matches questions to answers
  const promptAnswers = {
    path: answers[0],
    public: answers[1],
    cache: answers[2],
    endpointName: answers[3],
    endpointDescription: answers[4],
    schemaPrompt: answers[5],
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
      if (
        response.error.response.data &&
        response.error.response.data ===
          "Invalid API key provided. Please check your API key and try again."
      ) {
        console.log(
          cWrap.fr(
            "There was an OpenAI invalid key error when testing your schema: Please verify if you have an active OpenAI key set up in your account.\nIf not, you can set your OpenAI key by running `forge key set`"
          )
        );
        process.exit(1);
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
      const destinationDir = path.join(process.cwd(), "forge");
      const forgeFilePath = "forge/" + promptAnswers.path + ".ts";

      //filename uses endpoint path - CHECK IF SHOULD HAVE schema.ts
      const destinationFilePath =
        destinationDir + "/" + promptAnswers.path + ".ts";

      console.log(cWrap.fm("\nDestination file path:"), destinationFilePath);

      //check if directory exists
      const directoryExists = fs.existsSync(destinationDir);
      if (!directoryExists) {
        console.log(cWrap.fm("Forge directory does not exist. Creating..."));
        fs.mkdirSync(destinationDir);
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
            cWrap.fg("forge deploy " + forgeFilePath) // check if this is correct - does it work when someone is not in forge cli directory
          );
          console.log(
            cWrap.fm("You can test your file by running:"),
            cWrap.fg("forge test " + forgeFilePath)
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
            cWrap.fg("forge deploy " + forgeFilePath) // check if this is correct - does it work when someone is not in forge cli directory
          );
          console.log(
            cWrap.fm("You can test your file by running:"),
            cWrap.fg("forge test " + forgeFilePath)
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
