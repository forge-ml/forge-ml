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
/**
 * Primitive Array Property Schema
 * * Currently there is not support for nested arrays
 */
const primitveArrayProp = z.object({
  description: z.string().describe("description of the schema property"),
  name: z.string().describe("name of the schema property, one word, camelCase"),
  optional: z
    .boolean()
    .optional()
    .describe("determines if the property is optional"),
  type: ZodType.extract(["array"]),
  arrayType: ZodType.extract(["string", "number", "date", "boolean"]),
});
/**
 * Object Property Schema
 */
const objectProp = z.object({
  description: z.string().describe("description of the schema property"),
  name: z.string().describe("name of the schema property, one word, camelCase"),
  optional: z
    .boolean()
    .optional()
    .describe("determines if the property is optional"),
  type: ZodType.extract(["object"]),
  objectProperties: z.lazy(() => propertySchema.array()),
});
/**
 * Complex Array Property Schema
 */
const objectArrayProp = z.object({
  description: z.string().describe("description of the schema property"),
  name: z.string().describe("name of the schema property, one word, camelCase"),
  optional: z
    .boolean()
    .optional()
    .describe("determines if the property is optional"),
  type: ZodType.extract(["array"]),
  arrayType: ZodType.extract(["object"]),
  objectProperties: z.lazy(() => propertySchema.array()),
});

const propertySchema = z.union([
  primitveProp,
  primitveArrayProp,
  objectProp,
  objectArrayProp,
]);

const endpointSchema = z.object({
  config: configSchema,
  properties: propertySchema.array(),
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
  path: "person",
  public: false,
  name: "Person",
  description: "A person in history or the present day",
};
