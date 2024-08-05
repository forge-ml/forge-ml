import path from "path";
import makeRequest, { EP } from "../utils/request";
import fs, { readFileSync } from "fs";
import { cWrap } from "../utils/logging";
import readline from "node:readline";
import { selectOption, selectOptionBinary } from "../utils/optionSelect";
import { config } from "../config/config";
import { importConfig, importZod } from "../utils/imports";
import { loadDirectoryFiles } from "../utils/directory";

import { stdin as input, stdout as output } from "node:process";

//VALIDATION CREATE SHOULD ONLY BE CALLED AFTER INIT?

const edit = async () => {
  const files = loadDirectoryFiles();

  console.log(
    cWrap.fb("Let's edit your schema! Which file would you like to edit?")
  );

  const rl = readline.createInterface({ input, output });
  const fileName =
    files.length > 2
      ? await selectOption(files)
      : await selectOptionBinary(files);

  const prompt = require("prompt-sync")();
  const answer = prompt(cWrap.fm("What edits would you like to make?"));

  const schemaConfig = await importConfig(
    path.join(process.cwd(), config.schemaPath, fileName)
  );
  const schemaZod = await readFileSync(
    path.join(process.cwd(), config.schemaPath, fileName),
    "utf-8"
  );

  // create an object that matches questions to answers
  const promptAnswers = {
    path: schemaConfig.path,
    public: schemaConfig.public === false ? "private" : "public",
    cache: schemaConfig.cache || "None",
    contentType: schemaConfig.contentType || "text",
    model: schemaConfig.model || "gpt-4o-mini",
    endpointName: schemaConfig.name,
    endpointDescription: schemaConfig.description,
    schemaPrompt:
      "Please edit the following schema. It should be the base schema, only modify or remove values as needed. Be generous about adding .describe for mini-prompting. \n\n SCHEMA TO EDIT:" +
      schemaZod +
      "\n\n" +
      "modify it to comply with the following changes:\n\n" +
      answer,
  };

  console.log(cWrap.fm("Editing schema..."));

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
        response.error?.response?.data &&
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

    //DOUBLE CHECK THAT THIS IS THE CORRECT FILE PATH
    //DOUBLE CHECK NAMING CONVENTION FOR SCHEMA FILE
    const schemaDir = path.join(process.cwd(), config.schemaPath);
    //const filePath = promptAnswers.path + ".ts";

    //filename uses endpoint path - CHECK IF SHOULD HAVE schema.ts
    const destinationFilePath = path.join(schemaDir, fileName);

    //check if file exists - notify user and ask to overwrite
    if (fs.existsSync(destinationFilePath)) {
      console.log(cWrap.fm("Do you want to overwrite your existing schema?"));
      const overwrite = await selectOptionBinary(["Yes", "No"]);

      if (overwrite === "No") {
        console.log(
          cWrap.fm("\nSchema was not written to file. Feel free to try again.")
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
          cWrap.fg("forge test " + config.schemaPath + "/" + fileName)
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
          cWrap.fg("forge test " + config.schemaPath + "/" + fileName)
        );
      } catch (error) {
        console.error(cWrap.fr("\nFailed to write file:"), error);
      }
    }

    return response;
  } catch (error) {
    console.error(cWrap.fr("Failed to create schema:"));
    process.exit(1);
  }
};

export { edit };
