#!/usr/bin/env node
import { spawn } from "child_process";
/**
 * This file is the entry point for the Forge CLI tool. It uses the 'child_process' module to spawn a new process
 * that runs the 'bun' command with the provided arguments. The 'bun' command is used to execute the 'bin/index.js' file,
 * which contains the main logic for the CLI tool.
 *
 * The script first slices the command-line arguments to exclude the first two default arguments (node and script path).
 * It then spawns a new process to run 'bun' with the remaining arguments and sets the stdio option to 'inherit' to
 * allow the child process to use the parent process's standard input/output.
 *
 * If there is an error while spawning the 'bun' process, it logs an error message to the console and exits the process
 * with a status code of 1. If the 'bun' process closes, it exits the parent process with the same status code.
 *
 * Additionally, if there is an error related to the 'spawn bun' syscall, it logs a specific error message indicating
 * that 'bun' is not installed and exits the process with a status code of 1.
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const args = process.argv.slice(2);
  const bunProcess = spawn("bun", [join(__dirname, "index.ts"), ...args], { stdio: "inherit" });
  bunProcess.on("error", (error) => {
    if (error.code === "ENOENT") {
      console.error(
        "\x1b[31m%s\x1b[0m",
        "Please install bun (curl -fsSL https://bun.sh/install | bash) to use Forge CLI.",
      );
      process.exit(1);
    } else {
      throw error;
    }
  });

  bunProcess.on("close", (code) => {
    process.exit(code);
  });
} catch (error) {
  console.log(error.syscall);
  if (error.syscall === "spawn bun") {
    console.error(
      "Error running bun. Please make sure you have bun installed.",
    );
    process.exit(1);
  }
}
