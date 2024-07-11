import { config } from "../config/config";
import localConfigService from "../controls/auth/svc";
import cWrap from "./logging";

const authGate = () => {
  const loggedIn = localConfigService.getAPIKey();

  if (!loggedIn) {
    console.log(
      cWrap.fr(
        `You are not logged in. Please login by running \`${config.bin} auth login\``
      )
    );
    process.exit(1);
  }

  return true;
};

export default authGate;