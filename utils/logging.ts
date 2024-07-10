const c = {
  br: "\x1b[41m", // red (background)
  bg: "\x1b[42m", // green (background) 
  fr: "\x1b[31m", // red
  fg: "\x1b[32m", // green
  fy: "\x1b[33m", // orange
  fm: "\x1b[35m", // magenta
  fb: "\x1b[34m", // blue
};
const reset = "\x1b[0m"; // reset

const cWrapFactory = (color: string) => (text: string) => `${color}${text}${reset}`;

type TC = keyof typeof c;

export const cWrap = Object.keys(c).reduce((acc, key) => {
  acc[key as TC] = cWrapFactory(c[key as TC]);
  return acc;
}, {} as Record<TC, (text: string) => string>);

export default cWrap;
