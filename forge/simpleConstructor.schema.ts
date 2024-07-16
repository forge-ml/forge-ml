/**
 * ! THIS WORKS!
 * * Tested with prompt: "Create an endpoint to fetch dungeons and dragons characters"
 * * Response: 
{
  config: {
    path: "dndCharacters",
    public: true,
    name: "Dungeons & Dragons Characters",
    description: "Endpoint to fetch Dungeons & Dragons characters",
  },
  properties: [
    {
      description: "The name of the Dungeons & Dragons character",
      name: "name",
      type: "string",
    }, {
      description: "The level of the character",
      name: "level",
      type: "number",
    }, {
      description: "The class of the character",
      name: "class",
      type: "string",
    }, {
      description: "The race of the character",
      name: "race",
      type: "string",
    }
  ],
  _meta: {
    usage: {
      prompt_tokens: 185,
      completion_tokens: 101,
      total_tokens: 286,
    },
  },
}
 */
import z from "zod";

// Define the main person schema
const configSchema = z.object({
  path: z
    .string()
    .describe("path to the endpoint, one word, no special characters"),
  public: z
    .boolean()
    .describe("determines if the endpoint is available for public access"),
  name: z.string().optional().describe("name of the endpoint"),
  description: z.string().optional().describe("description of the endpoint"),
});

const ZodType = z
  .enum(["string", "number", "date", "boolean", "array", "object"])
  .describe("type of the schema property");

/**
 * Primitive Property Schema
 */
const primitveProp = z.object({
  description: z.string().describe("description of the schema property"),
  name: z.string().describe("name of the schema property, one word, camelCase"),
  optional: z
    .boolean()
    .optional()
    .describe("determines if the property is optional"),
  type: ZodType.extract(["string", "number", "date", "boolean"]),
});

const endpointSchema = z.object({
  config: configSchema,
  properties: primitveProp.array(),
});

export default endpointSchema;

type EndpointConfig = {
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

export const config: EndpointConfig = {
  path: "simpleConstructor",
  public: false,
  name: "Simple Constructor",
  description: "Constructs a simple schema for a forge endpoint",
};
