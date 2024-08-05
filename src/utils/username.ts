import { Keys } from "../commands/key";
import { config } from "../config/config";
import localConfigService from "../controls/auth/svc";
import projectService from "../svc/projectService";
import cWrap from "./logging";
import makeRequest, { EP } from "./request";

export const loadAndSetUsername = async () => {
  const username = await fetchUsername();
  setUsername(username);
};

const fetchUsername = async () => {
  const apiKey =
    process.env.FORGE_KEY || localConfigService.getValue(Keys.FORGE);

  if (!apiKey) {
    console.log(
      cWrap.fy("Warning: ") +
        "You're not logged in, so the client will generate a dummy client. You can login or signup with '" +
        cWrap.fg(config.bin + " auth") +
        "' and try again.\n"
    );
  } else {
    const response = await makeRequest(EP.ENDPOINT_ALL, { method: "GET" });
    try {
      return response.data.data.username;
    } catch (e) {
      console.warn(
        "Failed to fetch username, check your network settings or try logging in again."
      );
      return "";
    }
  }
};

const setUsername = (username: string) => {
  return projectService.username.set(username);
};
