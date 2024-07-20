import yargs, { CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import auth from "./src/commands/auth";
import deploy from "./src/commands/deploy";
import docs from "./src/commands/docs";
import init from "./src/commands/init";
import keys from "./src/commands/key";
import schema from "./src/commands/schema";
import test from "./src/commands/test";
import { config } from "./src/config/config";
import cWrap from "./src/utils/logging";

// wrap(null) removes the default 80 character limit
const cli = yargs(hideBin(process.argv)).scriptName("forge").wrap(null);
// commands
auth(cli);
deploy(cli);
docs(cli);
init(cli);
keys(cli);
schema(cli);
test(cli);
// transform(cli);

const defaultCommand: CommandModule = {
  command: "$0",
  describe: false,
  handler: () => {
    console.log(
      `Welcome to Forge! Try running ${cWrap.fg(
        config.bin + " auth signup"
      )} or ${cWrap.fg(config.bin + " --help")} to get started.`
    );
  },
};
cli.command(defaultCommand);

cli.parse();
