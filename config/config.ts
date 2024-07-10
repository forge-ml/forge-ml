import os from "os";

const bin = "forge";

export const config = {
  serverUrl: "http://localhost:3009",
  apiKeyFilePath: os.homedir() + `/.${bin}/key.json`,
  bin,
};
