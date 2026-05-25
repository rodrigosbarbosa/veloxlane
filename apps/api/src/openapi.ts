export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "VeloxLane API",
    version: "0.1.0",
  },
  paths: {
    "/auth/email/start": {
      post: {
        summary: "Start email sign-in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EmailSignInStartRequest",
              },
            },
          },
        },
        responses: {
          "202": {
            description:
              "Email sign-in scaffold response. Firebase Auth setup is pending.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EmailSignInStartResult",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
        },
      },
    },
    "/auth/google/start": {
      post: {
        summary: "Start Google sign-in",
        responses: {
          "202": {
            description:
              "Google sign-in scaffold response. Firebase Auth setup is pending.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GoogleSignInStartResult",
                },
              },
            },
          },
        },
      },
    },
    "/auth/phone/start": {
      post: {
        summary: "Start phone OTP sign-in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PhoneOtpStartRequest",
              },
            },
          },
        },
        responses: {
          "202": {
            description:
              "Phone OTP scaffold response. No SMS is sent until Twilio setup is confirmed.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PhoneOtpStartResult",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
        },
      },
    },
    "/auth/phone/verify": {
      post: {
        summary: "Verify phone OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PhoneOtpVerifyRequest",
              },
            },
          },
        },
        responses: {
          "202": {
            description:
              "Phone OTP verification scaffold response. Verification is disabled until Twilio setup is confirmed.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PhoneOtpVerifyResult",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get current auth session",
        responses: {
          "200": {
            description:
              "Current scaffold auth context. Returns anonymous until live auth is configured.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthSession",
                },
              },
            },
          },
        },
      },
    },
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
  components: {
    responses: {
      ValidationError: {
        description: "Request validation failed",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ValidationError",
            },
          },
        },
      },
    },
    schemas: {
      AuthProvider: {
        type: "string",
        enum: ["email", "google", "phone"],
      },
      AuthConfigurationStatus: {
        type: "string",
        enum: ["configured", "not_configured", "pending_setup"],
      },
      AuthSession: {
        type: "object",
        additionalProperties: false,
        required: ["authenticated", "user", "expiresAt"],
        properties: {
          authenticated: {
            type: "boolean",
          },
          user: {
            anyOf: [
              {
                $ref: "#/components/schemas/AuthUser",
              },
              {
                type: "null",
              },
            ],
          },
          expiresAt: {
            anyOf: [
              {
                type: "string",
                format: "date-time",
              },
              {
                type: "null",
              },
            ],
          },
        },
      },
      AuthUser: {
        type: "object",
        additionalProperties: false,
        required: ["id", "role", "providers", "emailVerified", "phoneVerified"],
        properties: {
          id: {
            type: "string",
          },
          role: {
            type: "string",
            enum: ["public", "staff", "admin"],
          },
          providers: {
            type: "array",
            items: {
              $ref: "#/components/schemas/AuthProvider",
            },
          },
          emailVerified: {
            type: "boolean",
          },
          phoneVerified: {
            type: "boolean",
          },
        },
      },
      EmailSignInStartRequest: {
        type: "object",
        additionalProperties: false,
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
          },
        },
      },
      EmailSignInStartResult: {
        type: "object",
        additionalProperties: false,
        required: ["provider", "action", "status", "message"],
        properties: {
          provider: {
            type: "string",
            enum: ["email"],
          },
          action: {
            type: "string",
            enum: ["configure_firebase_auth"],
          },
          status: {
            $ref: "#/components/schemas/AuthConfigurationStatus",
          },
          message: {
            type: "string",
          },
        },
      },
      GoogleSignInStartResult: {
        type: "object",
        additionalProperties: false,
        required: ["provider", "action", "status", "message"],
        properties: {
          provider: {
            type: "string",
            enum: ["google"],
          },
          action: {
            type: "string",
            enum: ["configure_firebase_auth"],
          },
          status: {
            $ref: "#/components/schemas/AuthConfigurationStatus",
          },
          message: {
            type: "string",
          },
        },
      },
      PhoneOtpStartRequest: {
        type: "object",
        additionalProperties: false,
        required: ["phone"],
        properties: {
          phone: {
            type: "string",
            pattern: "^\\+[1-9]\\d{1,14}$",
          },
        },
      },
      PhoneOtpStartResult: {
        type: "object",
        additionalProperties: false,
        required: ["provider", "action", "status", "message", "smsSent"],
        properties: {
          provider: {
            type: "string",
            enum: ["phone"],
          },
          action: {
            type: "string",
            enum: ["configure_twilio_verify"],
          },
          status: {
            $ref: "#/components/schemas/AuthConfigurationStatus",
          },
          message: {
            type: "string",
          },
          smsSent: {
            type: "boolean",
          },
        },
      },
      PhoneOtpVerifyRequest: {
        type: "object",
        additionalProperties: false,
        required: ["phone", "code"],
        properties: {
          phone: {
            type: "string",
            pattern: "^\\+[1-9]\\d{1,14}$",
          },
          code: {
            type: "string",
            pattern: "^\\d{4,8}$",
          },
        },
      },
      PhoneOtpVerifyResult: {
        type: "object",
        additionalProperties: false,
        required: ["provider", "action", "status", "verified", "message"],
        properties: {
          provider: {
            type: "string",
            enum: ["phone"],
          },
          action: {
            type: "string",
            enum: ["configure_twilio_verify"],
          },
          status: {
            $ref: "#/components/schemas/AuthConfigurationStatus",
          },
          verified: {
            type: "boolean",
          },
          message: {
            type: "string",
          },
        },
      },
      ValidationError: {
        type: "object",
        additionalProperties: false,
        required: ["error"],
        properties: {
          error: {
            type: "object",
            additionalProperties: false,
            required: ["code", "message", "issues"],
            properties: {
              code: {
                type: "string",
                enum: ["invalid_request"],
              },
              message: {
                type: "string",
              },
              issues: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["path", "message"],
                  properties: {
                    path: {
                      type: "string",
                    },
                    message: {
                      type: "string",
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
