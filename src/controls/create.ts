import { importConfig, importZod } from "../utils/imports";
import { toJSON } from "../utils/toJSON";
import path from "path";
import makeRequest, { EP } from "../utils/request";
import fs from "fs";
import { cWrap } from "../utils/logging";
import { config as cfg } from "../config/config";
import { SchemaConfig } from "../utils/config";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { selectOptionBinary, selectOption } from "../utils/optionSelect";
import { error } from "console";

//TODO: ADD CACHING OPTIONS

enum SchemaType {
  AI = "AI Generated",
  MANUAL = "Manual Creation",
}

enum PathPrivacy {
  PUBLIC = "public",
  PRIVATE = "private",
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
  //get schema type from user
  console.log("How should we create your schema?");
  const schemaType = await selectOption([SchemaType.AI, SchemaType.MANUAL]);

  if (schemaType === SchemaType.MANUAL) {
    console.log(cWrap.fm("\nThis hasn't been implemented yet"));
    return;
  } else {
    //COULD REMOVE OPTIONAL QUESTIONS AND IMPROVISE ANSWERS
    const questions: string[] = [
      "What do you want the path of your schema to be? (required, must be one word, no special characters)\n",
      "Is this a public path?\n", // not used
      "What do you want the name of your endpoint to be? (optional)\n",
      "What do you want the description of your endpoint to be? (optional)\n",
      "Enter a prompt for your schema? (ex. Generate a Person schema with attributes like a job, name, age, etc.)\n",
    ];

    const answers: string[] = [];
    const optionalQuestions = [2, 3];

    console.log(cWrap.fb("\n\nLet's build your schema:"));

    for (let i = 0; i < questions.length; i++) {
      const rl = readline.createInterface({ input, output }); // open and closing within loop because rl doesn't work with select option
      if (i === 1) {
        console.log(cWrap.fm("Is this a public or private path?"));
        const privacy = await selectOption([
          PathPrivacy.PUBLIC,
          PathPrivacy.PRIVATE,
        ]);
        answers.push(privacy);
      } else {
        const answer = await askQuestion(rl, questions[i]);
        if (answer) {
          answers.push(answer);
        } else if (
          optionalQuestions.includes(i) &&
          (!answer || answer.trim() === "")
        ) {
          //if user doesn't want to add a response, just add an empty string - FOR OPTIONAL QUESTIONS
          answers.push("");
        } else if (!answer || answer.trim() === "") {
          console.log(cWrap.br("Error: you need to add a response"));
          return;
        }
      }
      rl.close();
    }

    //VALIDATE ANSWERS - make sure all answers have correct content (ex. path can't be empty and must be one word, etc.)

    //create an object that matches questions to answers
    const promptAnswers = {
      path: answers[0],
      public: answers[1],
      endpointName: answers[2],
      endpointDescription: answers[3],
      schemaPrompt: answers[4],
    };

    //VALIDATE OPENAI KEY

    console.log(cWrap.fm("\nCreating schema..."));
    const response = await makeRequest(EP.CREATE, {
      method: "POST",
      data: { promptAnswers },
    });

    if (response.error) {
      console.log(cWrap.br("Error creating schema"));
      console.log(cWrap.fr(response?.message as string));
      return;
    }

    //on healthy response, offer to write to file in forge folder
    console.log(cWrap.fm("Here is your schema:\n\n"), cWrap.fg(response.data));

    console.log(cWrap.fm("\nDo you want to write this to a file?"));
    const write = await selectOptionBinary(["Yes", "No"]);

    if (write === "Yes") {
      //DOUBLE CHECK THAT THIS IS THE CORRECT FILE PATH
      //DOUBLE CHECK NAMING CONVENTION FOR SCHEMA FILE
      const destinationDir = path.join(process.cwd(), "forge");

      //filename uses endpoint path - CHECK IF SHOULD HAVE schema.ts
      const destinationFilePath =
        destinationDir + "/" + promptAnswers.path + ".ts";

      console.log(cWrap.fm("\nDestination file path:"), destinationFilePath);

      //VALIDATION - check if file exists - notify user and ask to overwrite
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
          console.log(
            cWrap.fm(
              "File has been overwritten. You can deploy your file by running:"
            ),
            cWrap.fg("forge deploy all") //maybe change this forge deploy <path> <= where path is hard coded
          );
        } catch (error) {
          console.error(cWrap.fr("Failed to write file:"), error);
        }
      } else {
        //write file to destination
        try {
          console.log(cWrap.fm("\nWriting to file..."));
          fs.writeFileSync(destinationFilePath, response.data);

          console.log(
            cWrap.fm(
              "File has been written. You can deploy your file by running:"
            ),
            cWrap.fg("forge deploy all")
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
  }
};

export { create };
