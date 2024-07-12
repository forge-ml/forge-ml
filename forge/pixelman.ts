import { z } from "zod";

type ZEnum<T> = readonly [T, ...T[]];

const types: ZEnum<string> = ["Fire", "Water", "Earth", "Air", "Light", "Dark"];
const rarity: ZEnum<string> = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
];

// Define types for Pixelman
const ElementType = z
  .enum(types)
  .describe("only valid options are " + types.join(","));

const StatRange = z.number().int().min(1).max(100);

const PixelmanSchema = z.object({
  name: z.string().min(1).max(20).describe("Name of the Pixelman"),
  elementType: ElementType.describe("Elemental type of the Pixelman"),
  rarity: z
    .enum(rarity)
    .describe(
      "Rarity level of the Pixelman. Acceptable values are " + rarity.join(","),
    ),
  stats: z
    .object({
      hp: StatRange.describe("Hit points"),
      attack: StatRange.describe("Attack power"),
      defense: StatRange.describe("Defense power"),
      speed: StatRange.describe("Speed"),
    })
    .describe("Statistics for the Pixelman"),

  abilities: z
    .array(z.string())
    .min(1)
    .max(2)
    .describe("List of special abilities (max 2)"),

  evolutionLevel: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Level at which the Pixelman evolves, if applicable"),
});

export default PixelmanSchema;

export const config = { path: "pixelman" };
