import prompt from "prompt-sync";
import makeRequest, { EP } from "../../utils/request";
import cWrap from "../../utils/logging";
import getErrorMessage from "./errors.util";

//sends a post request to update username
const update = async () => {
  //needs validation that its not current username
  //need to tune errors - why did it fail? (ex. another user already has that username)

  const newUsername = prompt()("Enter your new username: ");

  try {
    const { data, error, message } = await makeRequest(EP.UPDATE_USERNAME, {
      data: { username: newUsername },
      method: "POST",
    });
    if (error) {
      console.log(`${cWrap.br("Error")} setting new username.`);
      console.log(cWrap.fr(getErrorMessage(message)));
      return;
    }
    console.log(`Username successfully updated to ${cWrap.fg(newUsername)}.`);
  } catch (error: any) {
    console.error("An error occurred during username update:", error.message);
  }
};
export default update;
