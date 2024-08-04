import os from "os";

const bin = "forge";

const LOCAL_SERVER = process.env.FORGE_LOCAL_SERVER;

export const config = {
  serverUrl: LOCAL_SERVER || "https://api.forge-ml.com",
  schemaPath: "forge/schema",
  clientPath: "forge",
  forgeLockPath: "forge/forge.lock",
  forgeConfigPath: "forge/forge.config.json",
  apiKeyFilePath: os.homedir() + `/.${bin}/key.json`,
  bin,
};
