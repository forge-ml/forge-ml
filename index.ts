import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import deploy from "./commands/deploy";
import transform from "./commands/transform";
import test from "./commands/test";
import auth from "./commands/auth";
import docs from "./commands/docs";
import { config } from "./config/config";
import cWrap from "./utils/logging";

// import { clean_notes, create_note_handler, get_notes_handler, open_web_ui, search_note_handler } from "./handlers";

const cli = yargs(hideBin(process.argv));

// commands
deploy(cli);
transform(cli);
test(cli);
auth(cli);
docs(cli);

cli.command("$0", "default", (args) => {
  console.log(
    `Try running ${cWrap.fg(
      config.bin + " test your_schema.ts"
    )} to get started.`
  );
});

cli.parse();
