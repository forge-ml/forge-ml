
import z from "zod";

const Recipe = z.object({
    name: z.string(),
    description: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
    tags: z.array(z.string()),
});

export default Recipe;

export const config = { path: "recipe", public: false };
