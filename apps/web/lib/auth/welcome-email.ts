import { copy, tagline } from "@veloxlane/brand/copy";

type WelcomeEmailInput = {
  email: string;
  fullName: string;
};

export function buildWelcomeEmailHtml({ fullName }: WelcomeEmailInput): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;background:#0A1628;color:#F8F6F1;font-family:Inter,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="background:#0F1D32;border-radius:12px;padding:32px;">
            <tr>
              <td style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#E8A03D;">
                ${copy.productName}
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;font-size:28px;font-weight:600;font-style:italic;color:#F8F6F1;">
                Welcome to the lane, ${fullName}
              </td>
            </tr>
            <tr>
              <td style="padding-top:12px;font-size:16px;line-height:1.6;color:#A7AEB9;">
                ${tagline} Your account is live. Verify your phone next so buyers and sellers can trust the handoff.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendWelcomeEmail(
  input: WelcomeEmailInput,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.email,
      subject: `Welcome to ${copy.productName}`,
      html: buildWelcomeEmailHtml(input),
    }),
  });
}
