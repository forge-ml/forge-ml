export enum CacheType {
  COMMON = "Common",
  NONE = "None",
  INDIVIDUAL = "Individual",
}

export enum ModelType {
  GPT4oMini = "GPT4oMini",
  GPT4 = "GPT4",
  GPT4Turbo = "GPT4Turbo",
  GPT4o = "GPT4o",
  GPT4oTurbo = "GPT4oTurbo",
  GPT3_5Turbo = "GPT3_5Turbo",
}

export type SchemaConfig = {
  path?: string;
  name?: string;
  description?: string;
  public?: boolean;
  cache?: CacheType;
  model?: ModelType;
  contentType?: "text" | "image";
};
