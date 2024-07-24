export enum CacheType {
  COMMON = "common",
  NONE = "none",
  INDIVIDUAL = "individual",
}

export type SchemaConfig = {
  path?: string;
  name?: string;
  description?: string;
  public?: boolean;
  cache?: CacheType;
};
