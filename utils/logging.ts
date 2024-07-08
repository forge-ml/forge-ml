const c = {
  br: "\x1b[41m", // red (background)
  fg: "\x1b[32m", // green
  fm: "\x1b[35m", // magenta
};
const reset = "\x1b[0m"; // reset

const cWrapFactory = (color: string) => (text: string) => `${color}${text}${reset}`;

export const cWrap = Object.keys(c).reduce((acc, key) => {
    acc[key] = cWrapFactory(c[key as keyof typeof c]);
  return acc;
}, {} as Record<string, (text: string) => string>);

export default cWrap;
