# API Spec

Initial scaffold is served by `apps/api` at `GET /openapi.json`.

Current surface:

- `POST /auth/email/start` validates an email address and returns a Firebase
  email sign-in scaffold response with `status: "pending_setup"`. The response
  does not echo the submitted email.
- `POST /auth/google/start` returns a Firebase Google sign-in scaffold response
  with `status: "pending_setup"`.
- `POST /auth/phone/start` validates an E.164 phone number and returns a Twilio
  OTP scaffold response with `smsSent: false`. The response does not echo the
  submitted phone number or send SMS.
- `POST /auth/phone/verify` validates an E.164 phone number plus a 4-8 digit OTP
  code and returns `verified: false` with `status: "not_configured"`.
- `GET /auth/me` returns `{ "authenticated": false, "user": null, "expiresAt": null }`
  until live auth is configured.
- `GET /health` returns `{ "status": "ok", "service": "veloxlane-api" }`
- `GET /openapi.json` returns the OpenAPI 3.1 document for the current API scaffold
- The scaffold disables Express `x-powered-by` and applies standard `helmet` response headers

Shared auth schemas live in `@veloxlane/types` and cover:

- roles: `public`, `staff`, `admin`
- providers: `email`, `google`, `phone`
- auth user/session payloads
- email sign-in start request/result
- Google sign-in start result
- phone OTP start and verify requests/results
- normalized public and staff auth claims
