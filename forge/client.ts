import Forge from "@forge/client";

const keyGuard = () => {
  throw new Error("set FORGE_KEY in your .env");
};

const forgeKey = process.env.FORGE_KEY || keyGuard();

const forge = Forge({
  forgeKey: forgeKey,
});

export default forge;