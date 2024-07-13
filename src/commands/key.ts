import type { Argv } from "yargs";
import makeRequest, { EP } from "../utils/request";
import cWrap from "../utils/logging";
import localConfigService from "../controls/auth/svc";

export enum Keys {
  FORGE = "forge",
  OPENAI = "openAI",
}

const keyCommand = (cli: Argv) =>
  cli.command("key", "manage your forge-associated keys", (yargs) =>
    yargs
      .command(
        "list",
        "lists the supported providers and key status",
        async () => {
          const apiKey = localConfigService.getValue(Keys.FORGE);
          const openAiKey = localConfigService.getValue(Keys.OPENAI);
          console.log("     Key       |     Status     ");
          console.log("--------------------------------");
          console.log(
            `Forge API Key  |   ${cWrap.fg(apiKey ? "Set" : "Not Set")}`
          );
          console.log(
            `OpenAI API Key |   ${cWrap.fg(openAiKey ? "Set" : "Not Set")}`
          );
        }
      )
      .command(
        "copy <provider>",
        "copies a key to your clipboard. This is a nice utility function, particularly useful for grabbing your forge key once you need to make authenticated requests.",
        (yargs) =>
          yargs
            .positional("provider", {
              description: "The provider to copy the key for",
              type: "string",
              demandOption: true,
              choices: Object.values(Keys),
            })
            .example(
              cWrap.fg("forge key copy forge"),
              cWrap.fc("gets forge API Key"),
            )
            .example(
              cWrap.fg("forge key copy openAI"),
              cWrap.fc("gets locally set OpenAI API Key")
            ),
        async (args) => {
          const { provider } = args;
          const key = localConfigService.getValue(provider);
          if (!key) {
            console.log(`${cWrap.br("Error")} copying key.`);
            return;
          }
          // ONLY WORKS ON MACOS
          const proc = require("child_process").spawn("pbcopy");
          proc.stdin.write(key);
          proc.stdin.end();

          console.log(`Key copied to clipboard for ${cWrap.fg(provider)}.`);
        }
      )
      .command(
        "set <key>",
        "sets a key. defaults to setting your openAI key.",
        (yargs) =>
          yargs
            .positional("key", {
              description: "The key to set",
              type: "string",
              demandOption: true,
            })
            .option("provider", {
              type: "string",
              description: "The provider to set the key for",
              choices: Object.values(Keys),
              default: Keys.OPENAI,
            })
            .fail((msg, err, yargs) => {
              if (err) throw err;
              if (
                msg ===
                "Not enough non-option arguments: got 0, need at least 1"
              ) {
                console.error("You need to provide a key to set:\n");
              }
              yargs.showHelp();
            })
            .example(
              cWrap.fg("forge key set sk-abcxyz"),
              cWrap.fc("sets your openAI key")
            ),
        async (args) => {
          const { key, provider } = args;
          const keyToSet = provider || Keys.OPENAI;

          if (keyToSet === Keys.OPENAI) {
            const { data, error } = await makeRequest(EP.SET_OPENAI_KEY, {
              data: { apiKey: key },
              method: "POST",
            });
            if (error) {
              console.log(`${cWrap.br("Error")} setting key.`);
              return;
            }
            console.log(
              `Deployment key successfully updated for ${cWrap.fg(keyToSet)}.`
            );
          }

          try {
            localConfigService.storeValue(keyToSet, key);
            console.log(
              `Local key successfully updated for ${cWrap.fg(keyToSet)}.`
            );
          } catch (error) {
            console.log(`${cWrap.br("Error")} setting key.`);
            return;
          }
        }
      )
      .example(
        cWrap.fg("forge key set sk-abcxyz"),
        cWrap.fc("sets your openAI key")
      )
      .example(
        cWrap.fg("forge key copy forge"),
        cWrap.fc("copies your forge API Key to clipboard")
      )
      .example(
        cWrap.fg("forge key list"),
        cWrap.fc("lists the supported providers and key status")
      )
      .showHelp()
  )

export default keyCommand;
