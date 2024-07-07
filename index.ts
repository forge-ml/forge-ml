import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import deploy from "./commands/deploy";
import transform from "./commands/transform";
import testCommand from "./commands/test";
import auth from "./commands/auth";
import authService from "./controls/auth/svc";


// import { clean_notes, create_note_handler, get_notes_handler, open_web_ui, search_note_handler } from "./handlers";

const cli = yargs(hideBin(process.argv));

// commands
deploy(cli);
transform(cli);
testCommand(cli)
auth(cli)

// list
// get
// delete


// cli.command("$0", "default", (req) => {
//   console.log(
//     "\x1b[35m",
//     "Hey, friend. The AI isn't going to do this part for you!\n\n",
//     "\x1b[32m",
//     "--help if you're struggling."
//   );
// });

// final touch
cli.parse();
