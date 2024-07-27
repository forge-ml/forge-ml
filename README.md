<div align="center">

# ⚒️ Forge: Dead Simple Structured Extraction for LLMs 🔩️

[![npm version](https://img.shields.io/npm/v/forge-ml.svg?style=flat-square)](https://www.npmjs.com/package/forge-ml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/forge-ml.svg?style=flat-square)](https://www.npmjs.com/package/forge-ml)

#### Forge is the fastest way to deploy extraction and structured output from LLMs

[Installation](#-installation) •
[Getting Started](#-getting-started) •
[Creating Your First Endpoint](#-creating-your-first-endpoint)

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
forge deploy whois.ts
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

## 📈 Getting Started

```bash
# Sign up for a forge account
forge auth signup

## Create an example zod schema
forge init

# Test your endpoint
forge test ./forge/my_schema.ts

# Deploy your endpoint
forge deploy ./forge/my_schema.ts
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
  cache: "Individual" || "Common" || "None", // cache determines how the schema is cached. "Individual" - cache is unique to each user, "Common" - cache is shared amongst all users, "None" - no caching
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
forge auth signup    # Sign up for a forge account
forge auth signin    # Sign in to your account
forge auth logout    # Log out of your account
```

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

## ⚡️ Creating your first endpoint

2. Create a typescript file with a zod schema as the default export

   ```ts
   // ./forge/endpointSchema.ts
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
    *   forge/endpointSchema.ts
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
     cache: "Individual",
   };
   ```

4. Test the endpoint

   ```bash
   forge test ./forge/endpointSchema.ts

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
         "prompt_tokens": 211,
         "completion_tokens": 257,
         "total_tokens": 468
       },
       "cacheHit": false
     }
   }
   ```

5. Deploy the endpoint, and check it out in your swagger docs

   ```bash
   forge deploy ./forge/endpointSchema.ts    ## Deploy the endpoint
   forge docs    ## Check out your swagger docs
   ```

6. Grab your forge key

   ```bash
   forge key copy forge  ## Copy your forge key to your clipboard
   ```

7. Make your first request!

   ```bash
   # Make a request to your endpoint
   curl -X POST https://api.forge-ml.com/q/your_username/the_path  -H "cache-behavior: <your-cache-behavior-value>" -H "Authorization: Bearer <your-forge-key>" -d '{"q": "Who is Mark Twain?"}'
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
  cache: "Individual" || "Common" || "None";
};

export const config: EndpointConfig = {
  ...
}
```

## 🧪 Testing an endpoint

Endpoint schemas can be tested locally using:

```bash
forge test <path-to-schema>
```

## 👆 Deploying a schema

Example schemas can be found in the `./forge/schema` folder of this project.

`forge deploy all` deploys all schemas in the `./forge/schema` folder by default. Files with a .ignore.ts extension are ignored.

```bash
forge deploy <.path-to-schema>    ## Deploy a single schema
forge deploy all    ## Deploy all schemas in the ./forge folder
```
