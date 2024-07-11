import type { Argv } from "yargs";
import makeRequest, { EP } from "../utils/request";
import cWrap from "../utils/logging";
import authGate from "../utils/authGate";
import localConfigService from "../controls/auth/svc";

export enum Keys {
  FORGE = "forgeKey",
  OPENAI = "openAiKey",
}

const keyCommand = (cli: Argv) =>
  cli.command("key", "manage your forge keys", (yargs) =>
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
        "copy <key>",
        "copies a forge key to your clipboard",
        (yargs) =>
          yargs.positional("key", {
            description: "The key to copy",
            type: "string",
            demandOption: true,
          }),
        async (args) => {}
      )
      .command(
        "set <key>",
        "sets a key",
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
            }),
        async (args) => {
          const { key, provider } = args;
          const keyToSet = provider || Keys.OPENAI;

          if (keyToSet === Keys.OPENAI) {
            const { data, error } = await makeRequest(EP.SET_OPENAI_KEY, {
              data: { key },
              method: "POST",
            });
            if (error) {
              console.log(`${cWrap.br("Error")} setting key.`);
              return;
            }
            console.log(`Key set successfully for ${cWrap.fg(keyToSet)}.`);
            
          }

          try {
            localConfigService.storeValue(keyToSet, key);
            console.log(`Key set successfully for ${cWrap.fg(keyToSet)}.`);
          } catch (error) {
            console.log(`${cWrap.br("Error")} setting key.`);
            return;
          }
        }
      )
  );

export default keyCommand;
