import type { Server } from "node:http";

import type { Express } from "express";

type Logger = Pick<typeof console, "error" | "log">;
type ProcessLike = Pick<NodeJS.Process, "exit" | "exitCode" | "on">;

const defaultLogger: Logger = console;

export const startServer = ({
  app,
  logger = defaultLogger,
  port,
}: {
  app: Express;
  logger?: Logger;
  port: number;
}) =>
  app.listen(port, () => {
    logger.log(`veloxlane-api listening on port ${port}`);
  });

export const createShutdownHandler = ({
  logger = defaultLogger,
  process: processLike,
  server,
}: {
  logger?: Logger;
  process: ProcessLike;
  server: Server;
}) => {
  let isShuttingDown = false;

  return (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    logger.log(`received ${signal}, shutting down`);

    server.close((error) => {
      if (error) {
        logger.error("failed to shut down cleanly", error);
        processLike.exitCode = 1;
      }

      processLike.exit();
    });
  };
};

export const registerShutdownSignals = ({
  logger = defaultLogger,
  process: processLike,
  server,
}: {
  logger?: Logger;
  process: ProcessLike;
  server: Server;
}) => {
  const shutdown = createShutdownHandler({
    logger,
    process: processLike,
    server,
  });

  processLike.on("SIGINT", shutdown);
  processLike.on("SIGTERM", shutdown);
};
