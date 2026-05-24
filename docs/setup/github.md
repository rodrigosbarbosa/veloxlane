# GitHub Setup — VeloxLane

Remote: `https://github.com/rodrigosbarbosa/veloxlane.git`

Founder actions:

1. Confirm the repository exists.
2. Keep it private during MVP unless you intentionally want it public.
3. Give this development machine/user push access.
4. After initial scaffold is pushed, enable branch protection on `main`:
   - Require pull request before merge.
   - Require at least 1 approving review.
   - Require CI once GitHub Actions exists.
   - Block force pushes and deletions.

Credentials/access to return:

- Confirmation that push access works.
- No personal access token unless push/auth fails.

Notes:

- Hermes will not commit production code directly.
- Codex implementation commits must be reviewed by Claude before acceptance.
