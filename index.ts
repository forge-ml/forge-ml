import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import deploy from "./src/commands/deploy";
import transform from "./src/commands/transform";
import test from "./src/commands/test";
import auth from "./src/commands/auth";
import docs from "./src/commands/docs";
import { config } from "./src/config/config";
import cWrap from "./src/utils/logging";
import keys from "./src/commands/key";

const cli = yargs(hideBin(process.argv)).scriptName("forge")
// commands
deploy(cli);
transform(cli);
test(cli);
auth(cli);
docs(cli);
keys(cli);


cli.command("$0", "default", (args) => {
  console.log(
    `Welcome to Forge! Try running ${cWrap.fg(
      config.bin + " auth signup",
    )} or ${cWrap.fg(config.bin + " --help")} to get started.`,
  );
});

cli.parse();
