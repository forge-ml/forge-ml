import cWrap from "../utils/logging";

const update = async () => {
  try {
    console.log("Checking for updates...");
    const { execSync } = require('child_process');
    
    // Run npm to update forge-ml to the latest version
    execSync('npm install -g forge-ml@latest', { stdio: 'inherit' });
    
    const version = execSync('npm list -g forge-ml --depth=0', { encoding: 'utf-8' }).trim().split('@')[1];
    console.log(cWrap.fg(`\nforge-ml has been successfully updated to version ${version}.`));
  } catch (error) {
    console.error("An error occurred while updating forge-ml:", error?.message);
    process.exit(1);
  }
};

export default update;
