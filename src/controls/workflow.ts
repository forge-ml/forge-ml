import { CacheType, SchemaConfig } from "../utils/config";
import cWrap from "../utils/logging";
import {
  selectOption,
  selectOptionBinary,
  selectOptionBinaryRaw,
  selectOptionRaw,
} from "../utils/optionSelect";
import makeRequest, { EP } from "../utils/request";
import path from "path";
import fs from "fs";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

type workflowRequest = {
  //number of nodes in the workflow
  nodeCount: number;
  //what the user is building - will be used as context for prompting
  context: string;
  //the interfaces that will build the schemas/nodes - interfaces.length should equal nodeCount
  interfaces: string[];
};

enum PathPrivacy {
  PUBLIC = "public",
  PRIVATE = "private",
}

type InputQuestion = {
  type: "input";
};

type SelectQuestion = {
  type: "select";
  options:
    | string[]
    | ((answers: Record<string, string>) => { label: string; value: string }[]);
};

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
/*EXAMPLE REQUEST 
type guesses = {
  userGuess: string;
  correctAnswer: string;
};

type location = {
  city: string;
  country: string;
  lat: number;
  lng: number;
};

type locations = {
  userGuess: location;
  correctAnswer: location;
};

type distance = {
  distance: number;
  unit: string;
};
*/

const workFlowPath = "workflow";

//prompt for context, workflow path, cache, contentType (should only be text to begin with), model, provider

const dummyWorkflow: workflowRequest = {
  nodeCount: 3,
  context: "We want to find the distance between two given locations",
  interfaces: [
    "type guesses = { userGuess: string; correctAnswer: string; };",
    "type locations = { userGuess: { city: string; country: string; lat: number; lng: number; }; correctAnswer: { city: string; country: string; lat: number; lng: number; };",
    "type distance = { distance: number; unit: string; };",
  ],
};

//prompt for context, workflow path, cache, contentType (should only be text to begin with), model, provide
async function getPromptAnswers() {
  //ask for nodecount
  //ask for context
  //ask for interfaces
  const answers: Record<string, string> = {};
  for (const key in questions) {
    const question = questions[key as keyof typeof questions];
    const answer = await getAnswer(question, answers);
    if (answer !== null) {
      answers[key as keyof typeof answers] = answer;
      if (question.type === "select") output.write("\n");
    }
  }
  return answers;
}

const workflow = async () => {
  console.log(cWrap.fb("Let's build a workflow!"));
  console.log(cWrap.fb("First we'll setup your config"));
  const answers = await getPromptAnswers();

  const config: SchemaConfig = {
    path: answers["path"],
    public: answers["privacy"] === PathPrivacy.PUBLIC,
    name: answers["name"],
    description: answers["description"],
    cache: answers["cache"] as CacheType,
    contentType: "text",
    model: answers["model"],
    provider: answers["provider"],
  };

  try {
    const res = await makeRequest(EP.WORKFLOW, {
      method: "POST",
      data: {
        workflow: dummyWorkflow,
        config: config,
      },
    });

    if (res.error) {
      console.log(cWrap.fr(res.message));
    }

    const schemas = res.data.schemas;
    const transformations = res.data.transformations;

    // console.log(" ********** SCHEMA 1 **********\n");
    // console.log(schemas[0]);
    // console.log("\n ********** TRANSFORMATION 1**********\n");
    // console.log(transformations[0]);
    // console.log("\n ********** SCHEMA 2 **********\n");
    // console.log(schemas[1]);
    // console.log("\n ********** TRANSFORMATION 2 **********\n");
    // console.log(transformations[1]);
    // console.log("\n ********** SCHEMA 3 **********\n");
    // console.log(schemas[2]);
  } catch (err) {
    console.log(err);
    console.log(cWrap.fr("Error sending workflow request"));
  }
};

export default workflow;
