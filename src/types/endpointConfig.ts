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
  /**
   * the cache config - "None", "Common", "Individual"
   */
  cache?: "None" | "Common" | "Individual";

  /**
   * the content type of the endpoint (defaults to text)
   *
   * "text" | "image"
   */
  contentType?: "text" | "image";

  /** the model type to use for the endpoint */
  model?: string;
};
