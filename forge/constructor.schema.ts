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
  desc: z.string().describe("description of the schema property"),
  propertyName: z
    .string()
    .describe("name of the schema property, one word, camelCase"),
  isOptional: z
    .boolean()
    .optional()
    .describe("determines if the property is optional"),
  zType: ZodType.extract(["string", "number", "date", "boolean"]),
});
/**
 * Primitive Array Property Schema
 * * Currently there is not support for nested arrays
 */
const primitveArrayProp = z.object({
  desc: z.string().describe("description of the schema property"),
  propertyName: z
    .string()
    .describe("name of the schema property, one word, camelCase"),
  isOptional: z
    .boolean()
    .optional()
    .describe("determines if the property is optional"),
  zType: ZodType.extract(["array"]),
  arrayType: ZodType.extract(["string", "number", "date", "boolean"]),
});
/**
 * Object Property Schema
 */
const objectProp = z.object({
  desc: z.string().describe("description of the schema property"),
  propertyName: z
    .string()
    .describe("name of the schema property, one word, camelCase"),
  isOptional: z
    .boolean()
    .optional()
    .describe("determines if the property is optional"),
  zType: ZodType.extract(["object"]),
  nestedProperties: z.lazy(() => propertySchema.array()),
});
/**
 * Complex Array Property Schema
 */
const objectArrayProp = z.object({
  desc: z.string().describe("description of the schema property"),
  propertyName: z
    .string()
    .describe("name of the schema property, one word, camelCase"),
  isOptional: z
    .boolean()
    .optional()
    .describe("determines if the property is optional"),
  zType: ZodType.extract(["array"]),
  arrayType: ZodType.extract(["object"]),
  nestedProperties: z.lazy(() => propertySchema.array()),
});

const propertySchema = z.union([
  primitveProp,
  // primitveProp,
  // primitveArrayProp,
  objectProp,
  // objectArrayProp,
]);

const endpointSchema = z.object({
  config: configSchema,
  outputProperties: propertySchema,
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
  path: "complexConstructor",
  public: false,
  name: "Complex Constructor",
  description: "Constructs a complex schema for a forge endpoint",
};
