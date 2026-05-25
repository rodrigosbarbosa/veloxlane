# Firebase Auth Setup

Status: pending founder confirmation. Pause before live integration.

VeloxLane will use Firebase Authentication for email sign-in and Google
sign-in after the founder creates and confirms the Firebase project details.
The current API implementation is a scaffold only and makes no Firebase network
calls.

## Recommended Plan

Start on the Firebase Spark plan for Phase 1 validation if it supports the
required auth usage. Move to Blaze only after the founder approves billing and
expected usage.

## Founder Steps

1. Create or select the VeloxLane Firebase project.
2. Enable Authentication.
3. Enable the Email/Password or Email Link provider that the founder wants for
   the first launch.
4. Enable the Google provider.
5. Add approved web domains and local development redirect domains.
6. Confirm the production redirect URL and any mobile deep-link requirements.
7. Return only the non-secret client config needed by public clients, and share
   server credentials through the approved secret manager.

## Values To Return

- Firebase project ID
- Firebase app ID for web
- Firebase API key, if required by the public client SDK
- Firebase auth domain
- Google provider client ID
- Approved redirect URLs
- Secret-manager reference for any server-side Firebase service account

Do not paste service account JSON, private keys, or unrestricted credentials in
chat, docs, source code, tests, or issue comments.

## Environment Variables

Final names will be confirmed before live integration. Expected variables:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_WEB_APP_ID`
- `FIREBASE_WEB_API_KEY`
- `FIREBASE_GOOGLE_CLIENT_ID`
- `FIREBASE_SERVICE_ACCOUNT_SECRET_REF`

## Integration Hold

Stop after setup documentation and scaffold contracts. Live Firebase SDK wiring
must wait for founder confirmation of the provider settings, redirect URLs,
billing posture, and secret delivery path.
