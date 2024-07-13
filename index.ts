import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import auth from "./src/commands/auth";
import deploy from "./src/commands/deploy";
import docs from "./src/commands/docs";
import keys from "./src/commands/key";
import test from "./src/commands/test";
import { config } from "./src/config/config";
import cWrap from "./src/utils/logging";

// wrap(null) removes the default 80 character limit
const cli = yargs(hideBin(process.argv)).scriptName("forge").wrap(null);
// commands
deploy(cli);
// transform(cli);
test(cli);
auth(cli);
docs(cli);
keys(cli);

cli.command("$0", "default", (args) => {
  console.log(
    `Welcome to Forge! Try running ${cWrap.fg(
      config.bin + " auth signup"
    )} or ${cWrap.fg(config.bin + " --help")} to get started.`
  );
});

cli.parse();
