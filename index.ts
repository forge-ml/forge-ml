import yargs, { CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import auth from "./src/commands/auth";
import deploy from "./src/commands/deploy";
import docs from "./src/commands/docs";
import init from "./src/commands/init";
import keys from "./src/commands/key";
import test from "./src/commands/test";
import create from "./src/commands/create";
import edit from "./src/commands/edit";
import generate from "./src/commands/generate";
import { config } from "./src/config/config";
import cWrap from "./src/utils/logging";
import update from "./src/commands/update";
import workflow from "./src/commands/workflow";
import { rootLoginSignup } from "./src/commands/auth";

// wrap(null) removes the default 80 character limit
const cli = yargs(hideBin(process.argv)).scriptName("forge").wrap(null);
// commands
rootLoginSignup(cli);
init(cli);
create(cli);
deploy(cli);
edit(cli);
docs(cli);
keys(cli);
test(cli);
update(cli);
generate(cli);
auth(cli);
workflow(cli);
// transform(cli);

const defaultCommand: CommandModule = {
  command: "$0",
  describe: false,
  handler: () => {
    console.log(
      `Welcome to Forge! Try running ${cWrap.fg(
        config.bin + " signup"
      )} or ${cWrap.fg(config.bin + " --help")} to get started.`
    );
  },
};
cli.command(defaultCommand);

cli.parse();
