import { Resend } from "resend";

export type ResendConfig = {
  apiKey: string;
  fromEmail: string;
};

export function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return null;
  }

  return { apiKey, fromEmail };
}

export function createResendClient(config: ResendConfig): Resend {
  return new Resend(config.apiKey);
}
