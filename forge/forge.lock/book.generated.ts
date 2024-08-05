import z from "zod";

// Define the main person schema
const BookSchema = z.object({
  title: z.string(),
  vibes: z.array(z.string()),
  summary: z.string(),
  author: z.string(),
  genre: z.string(),
  publishDate: z.date(),
  pages: z.number(),
});

export default BookSchema;

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
  path: "book",
  public: false,
  name: "Book",
  description: "A book",
};
