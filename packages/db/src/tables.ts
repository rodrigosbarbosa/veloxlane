import type { Database } from "./index";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type PhoneRateLimitRow =
  Database["public"]["Tables"]["auth_phone_rate_limits"]["Row"];
export type PhoneRateLimitUpdate =
  Database["public"]["Tables"]["auth_phone_rate_limits"]["Update"];
