const knownErrors = {
  "OpenAI provider key is required":
    "Please run `forge key set` to set your OpenAI API key.",
  "OpenAI provider key is invalid":
    "Please run `forge key set` to set your OpenAI API key.",
  "Error updating username":
    "Please run `forge auth update` with a different username.",
  "You don't belong. Who do you know here?":
    "Please run `forge login` to login to your account.",
};

const getErrorMessage = (error: string) => {
  return error in knownErrors
    ? `${error}\n\n${knownErrors[error as keyof typeof knownErrors]}`
    : error;
};

export default getErrorMessage;
