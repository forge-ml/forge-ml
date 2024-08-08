<div align="center">

# 🚅 Forge: The Fastest Way to Build Bulletproof AI Products 🏃💨

[![npm version](https://img.shields.io/npm/v/forge-ml.svg?style=flat-square)](https://www.npmjs.com/package/forge-ml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/forge-ml.svg?style=flat-square)](https://www.npmjs.com/package/forge-ml)

#### Forge is the fastest way to deploy extraction and structured output from LLMs

[Installation](#-installation) •
[Quickstart](#-quickstart) •
[Creating Your First Endpoint](#%EF%B8%8F-creating-your-first-endpoint)

</div>

## 🚀 Installation

Install Forge globally:

```bash
npm install -g forge-ml
```

And you're live!

```bash
forge --help
```

[Get started now ->](#-quickstart)

## 🛠️ What is Forge?

Forge uses a combination of tools like [Zod](https://github.com/colinhacks/zod) and [Instructor](https://github.com/instructor-ai/instructor-js) to create and deploy endpoints that can be used to extract structured data from LLMs. It's a dead simple way to create custom LLM endpoints for your applications.

You define a [Zod](https://github.com/colinhacks/zod) schema, test it locally, and then deploy it to the cloud. From there you can access it from any application that can make HTTP requests, and it's guaranteed to have the expected response structure.

```js
// Define your schema
const whois = z.object({
  name: z.string(),
  occupation: z.string(),
  hobbies: z.array(z.string()),
});
```

```bash
# deploy
forge deploy
```

```ts
// endpoint: https://api.forge-ml.com/q/jakezegil/whois
// prompt: Jake Zegil is a Software Engineer who likes ripping code and driving boats
// Your endpoint response -
{
  name: "Jake Zegil",
  occupation: "Software Engineer",
  hobbies: ["ripping code", "driving boats"],
}

```

## 📈 Quickstart

To get started create a new project and run these commands, in terminal, in the root directory of your project:

```bash
# Sign up for a forge account
forge signup

## Install zod
npm install zod

## Initialize your forge project
forge init

## Create a forge schema
forge create

# Test your endpoint
forge test ./forge/schema/<your_schema>.ts

# Deploy your schema as an endpoint
forge deploy
```

_❗️ Note ❗️ In order to deploy, your schema file must have a zod object as the default export and a named `config` export containing the `path`._

```ts
export default z
  .object({
    // your schema here
  })
  .describe("my schema");

export const config: EndpointConfig = {
  // "path" determines the url path for the endpoint you'll deploy
  path: "my-schema", // one word, no special characters
  public: true || false, // determines if the endpoint is available for public access
  name: "My Schema", // name of the endpoint
  description: "My schema description",
  cache: "Individual" | "Common" | "None", // cache determines how the schema is cached.
  contentType: "text" | "image", // contentType determines the type of content the endpoint will receive
  model:
    "gpt-4o-mini" | "gpt-4o" | "gpt-4" | "gpt-3.5-turbo" | "<custom-model-id>", // model determines the model used to generate and query the endpoint
};
```

Once you're authenticated and have deployed an endpoint, you can view and test out all of your live endpoints on your swagger docs page:

```bash
forge docs   # https://api.forge-ml.com/docs/jakezegil
```

You can see [my openAPI spec here](https://api.forge-ml.com/docs/jakezegil).

## 🔐 Authentication

Auth lives at `forge auth`. When you log in or sign up, you'll get a fresh api key (this will not invalidate your old key). Your credentials are stored at `~/.forge/key.json`.

```bash
forge auth signup         # Sign up for a forge account
forge auth login          # Log in to your account
forge auth logout         # Log out of your account
```

For simplicity you can also just use `forge login` and `forge signup` to login and signup.

If you don't like your username, you can always update it, but beware! It will also update your deployed endpoints. Your swagger docs are dynamic, and will reflect your latest username and endpoints.

```bash
forge auth update    # update your forge username
```

## 🔑 Managing API Keys

Your api keys live in `~/.forge/key.json`. You can manage them using some of the utility functions forge provides out of the box:

```bash
  # List API key status (are keys set?)
  forge key list

  # Copy a key from the local forge credential cache to your clipboard
  # You'll need this once you're ready to hit a deployed endpoint
  forge key copy <provider>

  # Set a key (defaults to setting your openAI key, in case it isn't valid anymore or you want to change it)
  forge key set <API_KEY> --provider <provider>
```

## 🔨 Building your Schemas

Forge can create new schemas for you using `forge create`. After using the command, you'll be met with a series of prompts to set up your [endpoint configuration](#%EF%B8%8F-endpoint-config). Finally you'll be asked for a prompt to generate a schema:

```bash
forge> Enter a prompt for your schema? (ex. Generate a Person schema with attributes like a job, name, age, etc.)

user> Make me a superhero schema with attributes like name, sidekick, and abilities, etc. Add a lot of attributes and be very detailed.

forge> Creating schema...
```

Once the schema is generated, a new forge schema file `<endpoint-path>.ts` will be created in `./forge/schema` for you to test and deploy.

## 🤖 Using the Forge SDK

`forge init` and `forge deploy all` will generate a client for you, allowing you to interact with your endpoints programatically.

Lets walk through an example of how to use the Forge SDK

After `forge init` you'll have a `client.ts` file in your `forge` folder that looks like this:

```ts
import Forge from "@forge-ml/client";

const keyGuard = () => {
  throw new Error("set FORGE_KEY in your .env");
};

const forgeKey = process.env.FORGE_KEY || keyGuard();

const forge = Forge({
  forgeKey: forgeKey,
});

export default forge;
```

Feel free to edit this, it's only regenerated when you run `forge init`.

In the root of your project add a `.env` file with your forge key. You can get your forge key after logging in by running `forge key copy forge`.

```bash
FORGE_KEY=your-forge-key
```

Then, import your forge client and make a request:

```ts
import forge from "./forge/client";

const response = await forge.person.get({
  q: "Who is Mark Twain?",
});

// a typesafe response!
const firstName = response.name.firstName; // "Mark"
console.log(firstName);
```

And you'll get a typesafe response from your endpoint:

```json
{
  "name": {
    "full": "Mark Twain",
    "firstName": "Mark",
    "lastName": "Twain"
  },
  ...
  "_meta": {
    "usage": {
      "prompt_tokens": 211,
      "completion_tokens": 220,
      "total_tokens": 431
    },
    "cacheHit": false
  }
}
```

## ⚡️ Creating your first endpoint

2. Create a typescript file with a zod schema as the default export

   ```ts
   // ./forge/schema/endpointSchema.ts
   import z from "zod";

   const PersonCategory = z.enum([
     "historical",
     "celebrity",
     "politician",
     "scientist",
     "artist",
     "other",
   ]);

   // Define the main person schema
   const PersonSchema = z.object({
     name: z.object({
       full: z.string(),
       firstName: z.string(),
       lastName: z.string(),
     }),
     birthDate: z.date(),
     deathDate: z.date().optional(),
     nationality: z.string().optional(),
     occupation: z.array(z.string()).min(1),
     category: PersonCategory,
     knownFor: z.array(z.string()),
     briefBio: z.string().max(500),
     imageUrl: z.string().url(),
     sources: z.array(z.string().url()),
     lastUpdated: z.date().default(() => new Date()),
   });

   export default PersonSchema;
   ```

3. Add a config export to the schema typescript file. The path for the endpoint should be one word with no special characters

   ```ts
   /*
    *   forge/schema/endpointSchema.ts
    */

   export const config: EndpointConfig = {
     /** path to the endpoint. one word, no special characters */
     path: "the_path",
     /**
      * determines if the endpoint is available for public access.
      * users will always use their own OpenAI API key (you won't be dinged for others using your endpoint)
      */
     public: true,
     /** name of the endpoint */
     name: "Person",
     /** description of the endpoint */
     description: "A person in history or the present day",
     /** cache setting **/
     cache: "Individual", // this means it's set to be unique to each user
     contentType: "text", // this means the endpoint will process text
     model: "gpt-4o-mini", // this means the endpoint will use the gpt-4o-mini model
   };
   ```

4. Test the endpoint

   ```bash
   forge test ./forge/schema/endpointSchema.ts

   ## Enter your prompt: Who is Mark Twain?
   ```

   ```json
   // Your response should look something like this:
   {
     "name": "Mark Twain",
     "fullName": {
       "firstName": "Mark",
       "lastName": "Twain"
     },
     "birthDate": "1920-03-01",
     "deathDate": "1961-04-21",
     "nationality": "American",
     "occupation": ["writer", "illustrator"],
     "knownFor": [
       "The Adventures of Tom Sawyer",
       "Adventures of Huckleberry Finn"
     ],
     "briefBio": "Mark Twain, whose real name was Samuel Langhorne Clemens, was an American writer and humorist. He is best known for his novels 'The Adventures of Tom Sawyer' and 'Adventures of Huckleberry Finn,' which are considered classics of American literature.",
     "sources": ["https://en.wikipedia.org/wiki/Mark_Twain"],
     "_meta": {
       "usage": {
         "prompt_tokens": 75,
         "completion_tokens": 79,
         "total_tokens": 154
       }
     }
   }
   ```

5. Deploy the endpoint, and check it out in your swagger docs

   ```bash
   forge deploy  ## Deploy your endpoints
   forge docs    ## Check out your swagger docs
   ```

6. Grab your forge key

   ```bash
   forge key copy forge  ## Copy your forge key to your clipboard
   ```

7. Make your first request!

   ```bash
   # Make a request to your endpoint
   # If this seems like a lot, just use your forge client!
   # The only required header is `Authorization`
   curl -X POST https://api.forge-ml.com/q/your_username/the_path   -H "Authorization: Bearer <your-forge-key>" -d '{"q": "Who is Mark Twain?"}'
   # You can also pass -H "cache-behavior: <bust | evade | none>" and -H "model: <model-id>" to override the default behaviors
   ```

## ⚙️ Endpoint Config

The exported config is used for deployment. It _must_ be a `const config` exported from the schema file.

```ts
export type EndpointConfig = {
  /** path to the endpoint. one word, no special characters */
  path: string;
  /**
   * determines if the endpoint is available for public access
   * users must use their own OpenAI API key
   */
  public: boolean;
  /** name of the endpoint */
  name?: string;
  /** description of the endpoint */
  description?: string;
  /** cache setting
   * Individual - cache is unique to each user
   * Common - cache is shared amongst all users
   * None - no caching
   * **/
  cache: "Individual" | "Common" | "None";
  /** contentType setting
   * text - the endpoint will process text
   * image - the endpoint will process images
   * **/
  contentType: "text" | "image";
  /** model setting
   * gpt-4o-mini - the endpoint will use the gpt-4o-mini model
   * gpt-4o - the endpoint will use the gpt-4o model
   * gpt-4 - the endpoint will use the gpt-4 model
   * gpt-3.5-turbo - the endpoint will use the gpt-3.5-turbo model
   * <custom-model-id> - the endpoint will use a OpenAI custom model id - as of right now we only support OPENAI as a model provider
   * if no model is included we use gpt-4o-mini by default
   * **/
  model: "gpt-4o-mini" | "gpt-4o" | "gpt-4" | "gpt-3.5-turbo" | "<custom-model-id>";
};

export const config: EndpointConfig = {
  ...
}
```

## 📝 Editing a schema

You can edit a schema by running `forge edit`. You will then be prompted for a schema to edit and the changes you would like to make.

```bash
forge> Let's edit your schema! Which file would you like to edit?

user>   superhero.ts    student.ts    recipe.ts  * book.ts    example.ts    test.ts    vegetables.ts

forge> What edits would you like to make?

user> Make genre an array and add a new attribute "pageCount"

forge> Editing schema...
```

## 🧪 Testing an endpoint

Endpoint schemas can be tested locally using:

```bash
forge test <path-to-schema>
```

## 👆 Deploying a schema

Example schemas can be found in the `./forge/schema` folder of this project.

`forge deploy` deploys all schemas in the `./forge/schema` folder by default. Files with a .ignore.ts extension are ignored.

```bash
forge deploy    ## Deploy all schemas in the ./forge folder
```
