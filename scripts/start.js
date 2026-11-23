import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const server = spawn(process.execPath, [require.resolve("react-scripts/scripts/start")], {
  env: { ...process.env, HOST: "localhost", PORT: "3000" },
  // Non-interactive output prevents CRA from offering another port.
  stdio: ["inherit", "pipe", "inherit"],
});

server.stdout.pipe(process.stdout, { end: false });
server.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1);
});
