import readline from "node:readline";
import cWrap from "./logging";
const input = process.stdin;
const output = process.stdout;

type Option<T extends string> = {
  label: string;
  value: T;
}

//Padding on cursor on is broken - cursor stays left (unpadded) but text gets padded to right
//see if there is a way to remove the terminal cursor when user is selecting
function selectFromOptions<T extends string>(
  options: Option<T>[],
  useCursor: boolean = true,
  paddingLength: number = 0,
  leftToRight: boolean = false,
  cursor: string = ">"
): Promise<T> {
  return new Promise((resolve) => {
    const selectOption = {
      selectIndex: 0,
      options: options,
      selector: cursor,
      isFirstTimeShowMenu: true,
      createOptionMenu: (): void => {},
      getPadding: (length: number): string => " ".repeat(length),
      close: (): void => {
        output.write("\nExiting...\n");
        process.exit(0);
      },
    };

    selectOption.createOptionMenu = (): void => {
      const optionLength = selectOption.options.length;
      if (!selectOption.isFirstTimeShowMenu) {
        output.write(ansiEraseLines(leftToRight ? 1 : optionLength));
      }
      selectOption.isFirstTimeShowMenu = false;

      const padding = selectOption.getPadding(paddingLength);
      const cursorColor = ansiColors(selectOption.selector, "green");

      const menu = selectOption.options
        .map((option, i) => {
          if (i === selectOption.selectIndex) {
            return useCursor
              ? `${cursorColor} ${cWrap.fg(`${padding}${option.label}`)}`
              : `${padding}${ansiColors(option.label, "green")}`;
          } else {
            const extraSpace = useCursor ? " ".repeat(2) : "";
            return `${padding}${extraSpace}${option.label}`;
          }
        })
        .join(leftToRight ? "  " : "\n");

      output.write(menu);
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
          } else if (key.name === "left" && selectOption.selectIndex > 0) {
            selectOption.selectIndex -= 1;
          }
        } else {
          if (key.name === "down" && selectOption.selectIndex < optionLength) {
            selectOption.selectIndex += 1;
          } else if (key.name === "up" && selectOption.selectIndex > 0) {
            selectOption.selectIndex -= 1;
          }
        }
        if ((leftToRight && ["right", "left"].includes(key.name)) || (!leftToRight && ["down", "up"].includes(key.name))) {
          selectOption.createOptionMenu();
        } else if (key.name === "return") {
          input.setRawMode(false);
          input.pause();
          input.removeListener("keypress", keyPressedHandler);
          resolve(selectOption.options[selectOption.selectIndex].value);
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

      return Array.from({ length: count }, (_, i) =>
        eraseLine + (i < count - 1 ? cursorUp() : "")
      ).join("") + cursorLeft;
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


async function selectOptionBinaryRaw<T extends string>(
  options: Option<T>[],
  useCursor: boolean = true,
  paddingLength: number = 0,
  leftToRight: boolean = true,
  cursor: string = "*"
): Promise<string> {
  return selectFromOptions(options, useCursor, paddingLength, leftToRight, cursor);
}

async function selectOptionRaw<T extends string>(
  options: Option<T>[],
  useCursor: boolean = true,
  paddingLength: number = 0,
  leftToRight: boolean = false,
  cursor: string = "*"
): Promise<T> {
  return selectFromOptions(options, useCursor, paddingLength, leftToRight, cursor);
}

const selectOption = <T extends string>(options: T[]): Promise<T> => selectOptionRaw(options.map(option => ({ label: option, value: option })));
const selectOptionBinary = (options: string[]) => selectOptionBinaryRaw(options.map(option => ({ label: option, value: option })));

export { selectOption, selectOptionBinary, selectOptionRaw, selectOptionBinaryRaw };
