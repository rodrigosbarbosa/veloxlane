import express from "express";
import helmet from "helmet";

import { openApiDocument } from "./openapi";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());

  app.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "veloxlane-api",
    });
  });

  app.get("/openapi.json", (_request, response) => {
    response.json(openApiDocument);
  });

  return app;
};
