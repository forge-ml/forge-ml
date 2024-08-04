import readline from "node:readline";
import cWrap from "./logging";
const input = process.stdin;
const output = process.stdout;

//Padding on cursor on is broken - cursor stays left (unpadded) but text gets padded to right
//see if there is a way to remove the terminal cursor when user is selecting

function selectFromOptions<T extends string>(
  options: T[],
  useCursor?: boolean,
  paddingLength?: number,
  leftToRight?: boolean,
  cursor?: string
): Promise<T> {
  return new Promise((resolve) => {
    const selectOption = {
      selectIndex: 0, // index of selected option
      options: options, // array of options
      selector: cursor || ">", // selector for selected option
      isFirstTimeShowMenu: true, // flag to check if it's the first time the menu is shown
      createOptionMenu: (): void => {}, // function to create the option menu
      getPadding: (length: number): string => "", // function to get the padding for the option menu
      close: (): void => {}, // function to close the option menu
    };

    selectOption.createOptionMenu = (): void => {
      const optionLength = selectOption.options.length;
      if (selectOption.isFirstTimeShowMenu) {
        selectOption.isFirstTimeShowMenu = false;
      } else {
        output.write(ansiEraseLines(leftToRight ? 1 : optionLength));
      }
      //adds left side padding to options
      const padding = selectOption.getPadding(paddingLength || 0);
      const cursorColor = ansiColors(selectOption.selector, "green");

      let menu = "";
      for (let i = 0; i < optionLength; i++) {
        let selectedOption: string;
        if (i === selectOption.selectIndex) {
          if (useCursor) {
            selectedOption = `${cursorColor} ${cWrap.fg(
              `${padding}${selectOption.options[i]}`
            )}`;
          } else {
            selectedOption = `${padding}${ansiColors(
              selectOption.options[i],
              "green"
            )}`;
          }
        } else {
          const extraSpace = useCursor ? " ".repeat(2) : "";
          selectedOption = `${padding}${extraSpace}${selectOption.options[i]}`;
        }
        menu +=
          selectedOption +
          (i < optionLength - 1 ? (leftToRight ? "  " : "\n") : "");
      }
      output.write(menu);
    };

    selectOption.getPadding = (length: number): string => {
      return " ".repeat(length);
    };

    selectOption.close = (): void => {
      output.write("\nExiting...\n");
      process.exit(0);
    };

    const keyPressedHandler = (
      _: string,
      key: { name: string; ctrl: boolean }
    ): void => {
      if (key) {
        const optionLength = selectOption.options.length - 1;
        if (leftToRight) {
          if (key.name === "right" && selectOption.selectIndex < optionLength) {
            selectOption.selectIndex += 1;
            selectOption.createOptionMenu();
          } else if (key.name === "left" && selectOption.selectIndex > 0) {
            selectOption.selectIndex -= 1;
            selectOption.createOptionMenu();
          }
        } else {
          if (key.name === "down" && selectOption.selectIndex < optionLength) {
            selectOption.selectIndex += 1;
            selectOption.createOptionMenu();
          } else if (key.name === "up" && selectOption.selectIndex > 0) {
            selectOption.selectIndex -= 1;
            selectOption.createOptionMenu();
          }
        }
        if (key.name === "return") {
          input.setRawMode(false);
          input.pause();
          resolve(selectOption.options[selectOption.selectIndex]);
        } else if (key.name === "escape" || (key.name === "c" && key.ctrl)) {
          selectOption.close();
        }
      }
    };

    const ansiEraseLines = (count: number): string => {
      const ESC = "\u001B[";
      const eraseLine = ESC + "2K";
      const cursorUp = (count = 1): string => ESC + count + "A";
      const cursorLeft = ESC + "G";

      let clear = "";

      for (let i = 0; i < count; i++) {
        clear += eraseLine + (i < count - 1 ? cursorUp() : "");
      }

      if (count) {
        clear += cursorLeft;
      }

      return clear;
    };

    const ansiColors = (text: string, color: string): string => {
      const colors: { [key: string]: number } = {
        green: 32,
        blue: 34,
        yellow: 33,
        white: 37,
      };
      return colors[color] ? `\x1b[${colors[color]}m${text}\x1b[0m` : text;
    };

    input.setRawMode(true);
    input.resume();
    readline.emitKeypressEvents(input);
    input.on("keypress", keyPressedHandler);

    selectOption.createOptionMenu();
  });
}

async function selectOptionBinary(
  options: string[],
  useCursor: boolean = true,
  paddingLength: number = 0,
  leftToRight: boolean = true,
  cursor: string = "*"
) {
  const selectedOption = await selectFromOptions(
    options,
    useCursor,
    paddingLength,
    leftToRight,
    cursor
  );
  return selectedOption;
}

//usage example - uses async/await
//defaults to no cursor can be changed to true
async function selectOption<T extends string>(
  options: T[],
  useCursor: boolean = true,
  paddingLength: number = 0,
  leftToRight: boolean = false,
  cursor: string = ">"
): Promise<T> {
  const selectedOption = await selectFromOptions(
    options,
    useCursor,
    paddingLength,
    leftToRight,
    cursor
  );
  return selectedOption;
}

export { selectOption, selectOptionBinary };
// // Usage example - uses .then
// selectFromOptions(["mango", "banana", "apple", "orange"]).then(
//   (selectedOption) => {
//     console.log(`\nYou selected: ${selectedOption}`);
//   }
// );
