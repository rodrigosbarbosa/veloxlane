# API Spec

Initial scaffold is served by `apps/api` at `GET /openapi.json`.

Current surface:

- `GET /health` returns `{ "status": "ok", "service": "veloxlane-api" }`
- `GET /openapi.json` returns the OpenAPI 3.1 document for the current API scaffold
