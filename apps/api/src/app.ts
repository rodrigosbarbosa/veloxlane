import {
  authSessionSchema,
  emailSignInStartRequestSchema,
  emailSignInStartResultSchema,
  googleSignInStartResultSchema,
  phoneOtpStartRequestSchema,
  phoneOtpStartResultSchema,
  phoneOtpVerifyRequestSchema,
  phoneOtpVerifyResultSchema,
} from "@veloxlane/types";
import express from "express";
import helmet from "helmet";

import { openApiDocument } from "./openapi";

const validationErrorResponse = (
  issues: Array<{ path: Array<string | number>; message: string }>,
) => ({
  error: {
    code: "invalid_request",
    message: "Request validation failed",
    issues: issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  },
});

export const createApp = () => {
  const app = express();
  const jsonBodyParser = express.json({ limit: "16kb" });

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

  app.post("/auth/email/start", jsonBodyParser, (request, response) => {
    const parsedRequest = emailSignInStartRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response
        .status(400)
        .json(validationErrorResponse(parsedRequest.error.issues));
      return;
    }

    const result = emailSignInStartResultSchema.parse({
      provider: "email",
      action: "configure_firebase_auth",
      status: "pending_setup",
      message:
        "Firebase Authentication email sign-in is pending founder setup.",
    });

    response.status(202).json(result);
  });

  app.post("/auth/google/start", (_request, response) => {
    const result = googleSignInStartResultSchema.parse({
      provider: "google",
      action: "configure_firebase_auth",
      status: "pending_setup",
      message:
        "Firebase Authentication Google sign-in is pending founder setup.",
    });

    response.status(202).json(result);
  });

  app.post("/auth/phone/start", jsonBodyParser, (request, response) => {
    const parsedRequest = phoneOtpStartRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response
        .status(400)
        .json(validationErrorResponse(parsedRequest.error.issues));
      return;
    }

    const result = phoneOtpStartResultSchema.parse({
      provider: "phone",
      action: "configure_twilio_verify",
      status: "pending_setup",
      message: "Twilio Verify phone OTP is pending founder setup.",
      smsSent: false,
    });

    response.status(202).json(result);
  });

  app.post("/auth/phone/verify", jsonBodyParser, (request, response) => {
    const parsedRequest = phoneOtpVerifyRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response
        .status(400)
        .json(validationErrorResponse(parsedRequest.error.issues));
      return;
    }

    const result = phoneOtpVerifyResultSchema.parse({
      provider: "phone",
      action: "configure_twilio_verify",
      status: "not_configured",
      verified: false,
      message: "Twilio Verify phone OTP verification is not configured yet.",
    });

    response.status(202).json(result);
  });

  app.get("/auth/me", (_request, response) => {
    response.json(
      authSessionSchema.parse({
        authenticated: false,
        user: null,
        expiresAt: null,
      }),
    );
  });

  return app;
};
