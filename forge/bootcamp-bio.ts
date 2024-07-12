import z from "zod";

const BootcampHouse = z
  .enum(["Cracked", "Chilling", "Pumped Up", "Silly Rabbits"])
  .describe("Like a harry potter house but for Fractal Bootcamp");

// Define the main person schema
const BootcampBio = z
  .object({
    name: z.object({
      firstName: z.string(),
      lastName: z.string(),
    }),
    birthDate: z.date(),
    previousJobs: z.array(z.string()).min(1),
    hobbies: z.array(z.string()),
    bootcampHouse: BootcampHouse,
    knownFor: z.array(z.string()),
    addictedTo: z.array(z.string()),
    preferredStack: z
      .string()
      .describe("description of their preferred coding stack"),
    averageDailyPRCount: z.number().gte(1),
    briefBio: z.string().max(500),
    confidence: z
      .number()
      .gte(0)
      .lte(100)
      .describe(
        "a number between 0 and 100 describing how confident you are about this response"
      ),
    suggestions: z
      .array(z.string())
      .describe(
        "some suggestions for improving this schema, including what fields are missing, what fields are incorrect, and what fields are redundant"
      ),
  })
  .strict();

z.object({ _meta: z.object({}) }).and(BootcampBio);

export default BootcampBio;

// No config, can be tested but won't be deployed