import cWrap from "../utils/logging";
import makeRequest, { EP } from "../utils/request";

type workflowRequest = {
  //number of nodes in the workflow
  nodeCount: number;
  //what the user is building - will be used as context for prompting
  context: string;
  //the interfaces that will build the schemas/nodes - interfaces.length should equal nodeCount
  interfaces: string[];
};

/*EXAMPLE REQUEST 
type guesses = {
  userGuess: string;
  correctAnswer: string;
};

type location = {
  city: string;
  country: string;
  lat: number;
  lng: number;
};

type locations = {
  userGuess: location;
  correctAnswer: location;
};

type distance = {
  distance: number;
  unit: string;
};
*/

const dummyWorkflow: workflowRequest = {
  nodeCount: 3,
  context: "We want to find the distance between two given locations",
  interfaces: [
    "type guesses = { userGuess: string; correctAnswer: string; };",
    "type location = { city: string; country: string; lat: number; lng: number; }; type locations = { userGuess: location; correctAnswer: location; };",
    "type distance = { distance: number; unit: string; };",
  ],
};

const workflow = async () => {
  console.log(cWrap.fb("Sending workflow request"));
  try {
    const res = await makeRequest(EP.WORKFLOW, {
      method: "POST",
      data: {
        workflow: dummyWorkflow,
      },
    });

    if (res.error) {
      console.log(cWrap.fr(res.message));
    }
  } catch (err) {
    console.log(err);
    console.log(cWrap.fr("Error sending workflow request"));
  }
};

export default workflow;
