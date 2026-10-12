import { spawn } from "node:child_process";
const children = [
  spawn("node", ["node_modules/tsx/dist/cli.mjs", "watch", "server/local.ts"], {
    stdio: "inherit",
  }),
  spawn(
    "node",
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "0.0.0.0",
      "--port",
      process.env.FRONTEND_PORT || "5173",
    ],
    {
      stdio: "inherit",
    },
  ),
];
const stop = () => {
  for (const c of children) c.kill("SIGTERM");
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const c of children)
  c.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });

for (const c of children)
  c.on("error", (error) => {
    console.error("Не удалось запустить процесс", error.message);
    stop();
    process.exit(1);
  });
