# forge-ml

To install forge:

```bash
npm install zod forge-ml
```

## Dependencies

- [Zod](https://github.com/colinhacks/zod) is used for endpoint schemas.

## Getting Started

To view available commands:

```bash
forge --help
```

To log in to forge:

```bash
forge auth login
```

To check API keys:

```bash
forge key list
```

To set openAI API key:

```bash
forge key set <OpenAI API Key>
```

## Authentication

To sign up for a forge account:

```bash
forge auth signup
```

To log in to an existing forge account:

```bash
forge auth login
```

To log out of the current forge account:

```bash
forge auth logout
```

To update your forge username:

```bash
forge auth update
```

## Managing API Keys

To list API key status:

```bash
forge key list
```

To copy a key from the local forge config:

```bash
forge key copy <provider>
```

To set a key

```bash
forge key set <API_KEY> --provider <provider>
```

## Creating your first endpoint

1. Sign up for a forge account

    ```bash
    forge auth signup
    ```

1. Create a forge folder in your apps directory

    ```bash
    mkdir forge
    ```

1. Create a typescript file with a zod schema as the default export

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

1. Add a config export to the schema typescript file. The path for the endpoint should be one word with no special characters

    ```ts
    // ./forge/endpointSchema.ts

    export const config: EndpointConfig = {
      /** path to the endpoint. one word, no special characters */
      path: "person",
      /**
      * determines if the endpoint is available for public access
      * users must use their own OpenAI API key
      */
      public: false,
      /** name of the endpoint */
      name: "Person",
      /** description of the endpoint */
      description: "A person in history or the present day",
    };
    ```

1. Test the endpoint

    ```bash
    forge test ./forge/endpointSchema.ts
    ```

1. Deploy the endpoint

    ```bash
    forge deploy ./forge/endpointSchema.ts
    ```

1. View the docs for your new endpoint!

    ```bash
    forge docs
    ```

## Endpoint Config

The endpoint config is required for deployment. It must be a `const` exported from the schema file with the name `config`. It has a type of `EndpointConfig`

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
};
```

## Testing an endpoint

Endpoint schemas can be tested locally using:

```bash
forge test <path-to-schema>
```

## Deploying a schema

Example schemas can be found in the `./forge` folder of this project.

 `forge deploy` deploys all schemas in the `./forge` by default. A specific schema can be deployed using:

```bash
forge deploy <.path-to-schema>
```

## Viewing Open API docs

Documentation for deployed endpoints can be viewed on the forge-ml platform. Get a url to the endpoint documentation using:

```bash
forge docs
```
