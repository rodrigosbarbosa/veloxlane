import type { Database } from "./index";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type PhoneRateLimitRow =
  Database["public"]["Tables"]["auth_phone_rate_limits"]["Row"];
export type PhoneRateLimitUpdate =
  Database["public"]["Tables"]["auth_phone_rate_limits"]["Update"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
export type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];
export type WebhookEventRow =
  Database["public"]["Tables"]["webhook_events"]["Row"];
