
import Forge from "@forge-ml/client";

// run `forge key copy forge` to copy your local key to the clipboard 
const keyGuard = () => {
  throw new Error("set FORGE_KEY in your .env");
};

const forgeKey = process.env.FORGE_KEY || keyGuard();

const forge = Forge({
  forgeKey: forgeKey,
});

export default forge;
