import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("VeloxLane API scaffold", () => {
  it("returns the health payload", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "veloxlane-api",
    });
  });

  it("serves the OpenAPI document as JSON", async () => {
    const response = await request(createApp()).get("/openapi.json");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/application\/json/);
    expect(response.body).toMatchObject({
      openapi: "3.1.0",
      info: {
        title: "VeloxLane API",
        version: "0.1.0",
      },
      paths: {
        "/health": {
          get: {
            responses: {
              "200": {
                description: "Service health response",
              },
            },
          },
        },
      },
    });
  });
});
