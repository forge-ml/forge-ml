import os from "os";

const bin = "forge";

const LOCAL_SERVER = process.env.LOCAL_SERVER;

export const config = {
  serverUrl: "http://localhost:3000",
  schemaPath: "forge",
  apiKeyFilePath: os.homedir() + `/.${bin}/key.json`,
  bin,
};
