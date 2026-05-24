# Week 1 Founder Setup Checklist

This checklist covers the external accounts and legal/business setup needed before VeloxLane implementation moves past local scaffolding.

Do not paste secrets into chat unless explicitly requested. Prefer creating restricted accounts and entering credentials into the local `.env` or GitHub/Vercel/AWS secret stores when Hermes asks for them.

## 1. Business entity

Recommended action:

- Form or confirm the legal entity that will operate VeloxLane.
- Recommended: LLC, unless counsel recommends another structure.
- Get an EIN if not already available.
- Open a business bank account for VeloxLane operating revenue only.

Important:

- This bank account is for VeloxLane operating fees only.
- Vehicle purchase funds must never flow through any VeloxLane account. Sale funds go through Escrow.com only.

Return to Hermes:

- Legal entity name.
- State of formation.
- Business mailing address to use in vendor accounts.
- Confirmation that the business bank account exists or is in progress.

## 2. Domains

Recommended registrar:

- Cloudflare Registrar if available, or Namecheap if you prefer simpler setup.

Register:

- `veloxlane.com` required.
- `veloxlane.co` recommended defensive registration.
- `veloxlane.io` optional defensive registration.

Recommended DNS:

- Use Cloudflare DNS even if the domain is registered elsewhere.
- Enable registrar lock and account MFA.

Return to Hermes:

- Registrar name.
- Which domains were acquired.
- Whether Cloudflare DNS is enabled.
- No registrar password/API token yet.

## 3. GitHub

Repository:

- `https://github.com/rodrigosbarbosa/veloxlane.git`

Recommended settings:

- Private repo during MVP.
- Enable issues and projects.
- Disable wiki unless you want it.
- Protect `main` once initial scaffold is pushed.
- Require pull request review before merge once CI exists.

Return to Hermes:

- Confirm repo exists and that this machine/user has push access.
- Confirm whether the repo should remain private.

## 4. AWS account

Recommended tier:

- Standard AWS account, no paid support plan for MVP unless you want support.

Security setup:

- Root user MFA enabled.
- Create an IAM Identity Center user for Rodrigo/admin access.
- Create a dedicated Terraform deployment identity only when Hermes asks for it.
- Set AWS Budget alert at $50/month and $100/month to start.

Region:

- Start with `us-east-1` unless you prefer another US region.

Return to Hermes:

- AWS account ID.
- Preferred default region.
- Confirmation that root MFA and billing alerts are enabled.
- Do not send root credentials.

## 5. Vercel

Recommended plan:

- Vercel Pro when you are ready to connect production deployments.
- Hobby is okay for early local-only experiments, but Pro is recommended before real beta users.

Setup:

- Create/import a Vercel team or personal project.
- Connect the GitHub repository after initial scaffold is pushed.
- Web app and admin app will be separate Vercel projects later.

Return to Hermes:

- Vercel account/team slug.
- Confirmation GitHub integration is connected.
- Confirm whether to use Vercel Pro now or defer.

## Done criteria for Week 1

Week 1 setup is complete when:

1. Legal entity path is confirmed.
2. `veloxlane.com` is registered.
3. GitHub repo exists and this machine has push access.
4. AWS account has root MFA and budget alerts.
5. Vercel account/team exists and GitHub integration is ready.
