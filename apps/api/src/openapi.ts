export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "VeloxLane API",
    version: "0.1.0",
  },
  paths: {
    "/health": {
      get: {
        summary: "Service health check",
        responses: {
          "200": {
            description: "Service health response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: false,
                  required: ["status", "service"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["ok"],
                    },
                    service: {
                      type: "string",
                      enum: ["veloxlane-api"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
