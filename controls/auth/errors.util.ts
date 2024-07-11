
const knownErrors = {
    "OpenAI provider key is required": "Please run `forge key set openai` to set your OpenAI API key.",
    "OpenAI provider key is invalid": "Please run `forge key set openai` to set your OpenAI API key.",
}

const getErrorMessage = (error: string) => {
    return error in knownErrors ? `${error}\n\n${knownErrors[error as keyof typeof knownErrors]}` : error;
}

export default getErrorMessage;