# Resend — VeloxLane email

VeloxLane uses [Resend](https://resend.com) for transactional email. Supabase Auth emails (signup confirm, password reset, magic link) route through Resend SMTP to bypass Supabase's built-in rate limits. App-owned emails (welcome, notifications) use the Resend API via the `resend` package.

## 1. Resend dashboard

1. Create a Resend account and project for VeloxLane.
2. **API Keys** → Create API key → copy `re_...` into `RESEND_API_KEY` (server only — never `NEXT_PUBLIC_`).
3. **Domains** → Add `veloxlane.com` and add the DNS records Resend provides (SPF, DKIM). Wait until status is **Verified**.

### Sender address

| Environment                              | `RESEND_FROM_EMAIL`                 | Notes                                                                 |
| ---------------------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| Local / staging (no verified domain yet) | `VeloxLane <onboarding@resend.dev>` | Resend test sender; only delivers to the email on your Resend account |
| Staging / production                     | `VeloxLane <hello@veloxlane.com>`   | Requires verified `veloxlane.com` in Resend                           |

Use the same sender in Supabase SMTP **Sender email** and **Sender name** fields.

## 2. Supabase Auth — custom SMTP

Project: `rsjgjsjrkdtlhiohjigw` (staging)

**Project Settings → Authentication → SMTP Settings**

1. Enable **Custom SMTP**.
2. Configure:

| Field        | Value                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------- |
| Host         | `smtp.resend.com`                                                                           |
| Port         | `465` (SSL) or `587` (STARTTLS)                                                             |
| Username     | `resend`                                                                                    |
| Password     | Your `RESEND_API_KEY` (`re_...`)                                                            |
| Sender email | Same as `RESEND_FROM_EMAIL` address (e.g. `hello@veloxlane.com` or `onboarding@resend.dev`) |
| Sender name  | `VeloxLane`                                                                                 |

3. Save. Send a test email from the Supabase dashboard if available, or trigger signup / password reset on staging.

Auth templates (confirm signup, reset password, magic link) remain in **Authentication → Email Templates**; only the transport changes to Resend.

### Auth redirect URLs (required for email confirm / magic link)

**Authentication → URL Configuration**

| Field         | Staging value                                 |
| ------------- | --------------------------------------------- |
| Site URL      | `https://staging.veloxlane.com`               |
| Redirect URLs | `https://staging.veloxlane.com/**`            |
|               | `https://staging.veloxlane.com/auth/callback` |

Without these, confirmation emails fall back to the Site URL (often `http://localhost:3000/?code=...`).

App code passes `emailRedirectTo: ${NEXT_PUBLIC_APP_URL}/auth/callback` on signup and magic-link flows. Set `NEXT_PUBLIC_APP_URL=https://staging.veloxlane.com` on the staging Vercel project and redeploy.

Local `supabase/config.toml` keeps `site_url = "http://127.0.0.1:3000"` for the CLI stack only; remote staging uses the dashboard values above.

## 3. Vercel environment variables

Add to the `veloxlane-web` project (Preview + Production as needed):

```
NEXT_PUBLIC_APP_URL=https://staging.veloxlane.com
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=VeloxLane <hello@veloxlane.com>
```

Redeploy after adding vars so the welcome email route and any future Resend calls pick them up.

## 4. Local development

Copy from `.env.example` into `.env.local`:

```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=VeloxLane <onboarding@resend.dev>
```

Without these vars, `POST /api/auth/welcome` succeeds but skips sending (no-op).
