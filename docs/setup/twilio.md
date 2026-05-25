# Twilio Setup

Status: pending founder confirmation. Pause before live integration.

VeloxLane will use Twilio Verify for phone OTP after the founder creates and
confirms the Twilio account and Verify service. The current API implementation
is a scaffold only and sends no SMS.

## Recommended Plan

Use Twilio's lowest suitable paid setup for Verify testing only after the
founder approves billing. Keep usage limits conservative during Phase 1 and
avoid broad production traffic until fraud controls are reviewed.

## Founder Steps

1. Create or select the VeloxLane Twilio account.
2. Enable Verify.
3. Create a Verify service for VeloxLane.
4. Configure allowed countries, rate limits, and fraud protections.
5. Confirm sender/brand requirements for the launch markets.
6. Share credentials only through the approved secret manager.

## Values To Return

- Twilio account SID
- Twilio Verify service SID
- Secret-manager reference for the Twilio auth token
- Approved countries and any blocked regions
- Expected OTP code length and expiration window
- Rate-limit policy for OTP starts and verification attempts

Do not paste auth tokens, recovery codes, unrestricted API keys, or customer
phone numbers in chat, docs, source code, tests, or issue comments.

## Environment Variables

Final names will be confirmed before live integration. Expected variables:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_VERIFY_SERVICE_SID`
- `TWILIO_AUTH_TOKEN_SECRET_REF`
- `TWILIO_VERIFY_ALLOWED_COUNTRIES`

## Integration Hold

Stop after setup documentation and scaffold contracts. Live Twilio SDK wiring
must wait for founder confirmation of billing, Verify settings, rate limits,
fraud controls, and secret delivery path.
