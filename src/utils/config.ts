export enum CacheType {
  COMMON = "Common",
  NONE = "None",
  INDIVIDUAL = "Individual",
}

export type SchemaConfig = {
  path?: string;
  name?: string;
  description?: string;
  public?: boolean;
  cache?: CacheType;
  model?: string; //change this to defaultModel
  provider?: string;
  contentType?: "text" | "image";
  context?: string; //the collection id to get data from
};

export const modelProviderOptions = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4", "gpt-3.5-turbo", "Custom"],
  anthropic: [
    "claude-3-5-sonnet-20240620",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240307",
    "claude-3-haiku-20240307",
  ],
  groq: ["llama3-8b-8192", "llama3-70b-8192", "llama3-70b-4096"],
};
