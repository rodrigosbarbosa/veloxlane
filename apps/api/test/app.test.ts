import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("VeloxLane API scaffold", () => {
  it("returns the health payload", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(response.headers["x-dns-prefetch-control"]).toBe("off");
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

  it("returns an email auth setup scaffold without echoing email", async () => {
    const email = "founder@example.test";
    const response = await request(createApp())
      .post("/auth/email/start")
      .send({ email });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({
      provider: "email",
      action: "configure_firebase_auth",
      status: "pending_setup",
      message:
        "Firebase Authentication email sign-in is pending founder setup.",
    });
    expect(JSON.stringify(response.body)).not.toContain(email);
  });

  it("rejects invalid email auth requests without echoing the submitted value", async () => {
    const email = "not-an-email";
    const response = await request(createApp())
      .post("/auth/email/start")
      .send({ email });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "invalid_request",
        message: "Request validation failed",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain(email);
  });

  it("returns a Google auth setup scaffold", async () => {
    const response = await request(createApp()).post("/auth/google/start");

    expect(response.status).toBe(202);
    expect(response.body).toEqual({
      provider: "google",
      action: "configure_firebase_auth",
      status: "pending_setup",
      message:
        "Firebase Authentication Google sign-in is pending founder setup.",
    });
  });

  it("returns a phone OTP setup scaffold without echoing phone", async () => {
    const phone = "+15551234567";
    const response = await request(createApp())
      .post("/auth/phone/start")
      .send({ phone });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({
      provider: "phone",
      action: "configure_twilio_verify",
      status: "pending_setup",
      message: "Twilio Verify phone OTP is pending founder setup.",
      smsSent: false,
    });
    expect(JSON.stringify(response.body)).not.toContain(phone);
  });

  it("rejects invalid phone OTP starts without echoing phone", async () => {
    const phone = "5551234567";
    const response = await request(createApp())
      .post("/auth/phone/start")
      .send({ phone });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "invalid_request",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain(phone);
  });

  it("returns a not-configured phone OTP verification scaffold", async () => {
    const phone = "+15551234567";
    const response = await request(createApp())
      .post("/auth/phone/verify")
      .send({ phone, code: "123456" });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({
      provider: "phone",
      action: "configure_twilio_verify",
      status: "not_configured",
      verified: false,
      message: "Twilio Verify phone OTP verification is not configured yet.",
    });
    expect(JSON.stringify(response.body)).not.toContain(phone);
  });

  it("rejects invalid phone OTP verification codes", async () => {
    const response = await request(createApp())
      .post("/auth/phone/verify")
      .send({ phone: "+15551234567", code: "abc123" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "invalid_request",
      },
    });
  });

  it("returns anonymous auth context from auth me", async () => {
    const response = await request(createApp()).get("/auth/me");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      authenticated: false,
      user: null,
      expiresAt: null,
    });
  });
});
