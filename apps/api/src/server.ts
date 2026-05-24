import { createApp } from "./app";
import { registerShutdownSignals, startServer } from "./runtime";

const port = Number(process.env.PORT ?? 3000);
const server = startServer({
  app: createApp(),
  port,
});

registerShutdownSignals({
  process,
  server,
});
