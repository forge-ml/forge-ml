import type { Argv } from "yargs";
import localConfigService from "../controls/auth/svc";
import cWrap from "../utils/logging";
import makeRequest, { EP } from "../utils/request";
import { selectOption } from "../utils/optionSelect";
import { debug } from "util";

export enum Keys {
  FORGE = "forge",
  OPENAI = "openAI",
  ANTHROPIC = "anthropic",
  GROQ = "groq",
}

const keyCommand = (cli: Argv) =>
  cli.command(
    "key <action>",
    `${cWrap.fm("Manage your forge-associated keys with actions:")}
${cWrap.fb("copy")}\t\tcopy a key to your clipboard
${cWrap.fb("list")}\t\tlist the supported providers and key status
${cWrap.fb(
  "set"
)}\t\tset a key. If Provider is not specified, it will prompt you to select a provider.
`,
    (yargs) =>
      yargs
        .command(
          "list",
          "lists the supported providers and key status",
          async () => {
            const apiKey = localConfigService.getValue(Keys.FORGE);
            const openAiKey = localConfigService.getValue(Keys.OPENAI);
            const anthropicKey = localConfigService.getValue(Keys.ANTHROPIC);
            const groqKey = localConfigService.getValue(Keys.GROQ);
            console.log("     Key           |     Status     ");
            console.log("--------------------------------");
            console.log(
              `Forge API Key      |   ${cWrap.fg(apiKey ? "Set" : "Not Set")}`
            );
            console.log(
              `OpenAI API Key     |   ${cWrap.fg(
                openAiKey ? "Set" : "Not Set"
              )}`
            );
            console.log(
              `Anthropic API Key  |   ${cWrap.fg(
                anthropicKey ? "Set" : "Not Set"
              )}`
            );
            console.log(
              `Groq API Key       |   ${cWrap.fg(
                groqKey ? "Set" : "Not Set"
              )}`
            );
          }
        )
        .command(
          "copy <provider>",
          "copies a key to your clipboard. This is a nice utility function, particularly useful for grabbing your forge key when you need to make authenticated requests.",
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
                cWrap.fc("gets forge API Key")
              )
              .example(
                cWrap.fg("forge key copy openAI"),
                cWrap.fc("gets locally set OpenAI API Key")
              )
              .example(
                cWrap.fg("forge key copy anthropic"),
                cWrap.fc("gets locally set Anthropic API Key")
              )
              .example(
                cWrap.fg("forge key copy groq"),
                cWrap.fc("gets locally set Groq API Key")
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
          "sets a key.",
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
                cWrap.fc("sets your provider key")
              ),
          async (args) => {
            const { key, provider } = args;
            const keyToSet =
              provider || (await selectOption(Object.values(Keys)));

            if ([Keys.OPENAI, Keys.ANTHROPIC, Keys.GROQ].includes(keyToSet)) {
              const { data, error } = await makeRequest(EP.SET_PROVIDER_KEY, {
                data: { apiKey: key, provider: keyToSet },
                method: "POST",
              });
              if (error) {
                console.log(
                  `\n\n${cWrap.br("Error")} setting key: `,
                  error?.response?.data?.error
                );
                return;
              }
              console.log(
                `\n\nDeployment key successfully updated for ${cWrap.fg(
                  keyToSet
                )}.`
              );
            }

            try {
              localConfigService.storeValue(keyToSet, key);
              console.log(
                `\nLocal key successfully updated for ${cWrap.fg(keyToSet)}.`
              );
            } catch (error) {
              console.log(`${cWrap.br("Error")} setting key.`);
              return;
            }
          }
        )
        .example(
          cWrap.fg("forge key set sk-abcxyz"),
          cWrap.fc(
            "sets your provider key. This will prompt you to select a provider (openAI, anthropic, groq, forge)."
          )
        )
        .example(
          cWrap.fg("forge key copy forge"),
          cWrap.fc("copies your forge API Key to clipboard")
        )
        .example(
          cWrap.fg("forge key list"),
          cWrap.fc("lists the supported providers and key status")
        )
        .showHelpOnFail(true)
  );

export default keyCommand;
