import { z } from "zod";

export const userRoleSchema = z.enum(["public", "staff", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const authProviderSchema = z.enum(["email", "google", "phone"]);
export type AuthProvider = z.infer<typeof authProviderSchema>;

export const authConfigurationStatusSchema = z.enum([
  "configured",
  "not_configured",
  "pending_setup",
]);
export type AuthConfigurationStatus = z.infer<
  typeof authConfigurationStatusSchema
>;

export const authActionSchema = z.enum([
  "configure_firebase_auth",
  "configure_twilio_verify",
  "send_email_link",
  "redirect_to_google",
  "send_phone_otp",
  "verify_phone_otp",
]);
export type AuthAction = z.infer<typeof authActionSchema>;

export const authUserSchema = z.object({
  id: z.string().min(1),
  role: userRoleSchema,
  providers: z.array(authProviderSchema),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const authSessionSchema = z.object({
  authenticated: z.boolean(),
  user: authUserSchema.nullable(),
  expiresAt: z.string().datetime({ offset: true }).nullable(),
});
export type AuthSession = z.infer<typeof authSessionSchema>;

export const emailSignInStartRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export type EmailSignInStartRequest = z.infer<
  typeof emailSignInStartRequestSchema
>;

export const emailSignInStartResultSchema = z.object({
  provider: z.literal("email"),
  action: authActionSchema,
  status: authConfigurationStatusSchema,
  message: z.string().min(1),
});
export type EmailSignInStartResult = z.infer<
  typeof emailSignInStartResultSchema
>;

export const googleSignInStartResultSchema = z.object({
  provider: z.literal("google"),
  action: authActionSchema,
  status: authConfigurationStatusSchema,
  message: z.string().min(1),
});
export type GoogleSignInStartResult = z.infer<
  typeof googleSignInStartResultSchema
>;

export const e164PhoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{1,14}$/, "Phone number must be E.164 formatted");
export type E164PhoneNumber = z.infer<typeof e164PhoneNumberSchema>;

export const phoneOtpStartRequestSchema = z.object({
  phone: e164PhoneNumberSchema,
});
export type PhoneOtpStartRequest = z.infer<typeof phoneOtpStartRequestSchema>;

export const phoneOtpStartResultSchema = z.object({
  provider: z.literal("phone"),
  action: authActionSchema,
  status: authConfigurationStatusSchema,
  message: z.string().min(1),
  smsSent: z.boolean(),
});
export type PhoneOtpStartResult = z.infer<typeof phoneOtpStartResultSchema>;

export const phoneOtpVerifyRequestSchema = z.object({
  phone: e164PhoneNumberSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "OTP code must be 4-8 digits"),
});
export type PhoneOtpVerifyRequest = z.infer<typeof phoneOtpVerifyRequestSchema>;

export const phoneOtpVerifyResultSchema = z.object({
  provider: z.literal("phone"),
  action: authActionSchema,
  status: authConfigurationStatusSchema,
  verified: z.boolean(),
  message: z.string().min(1),
});
export type PhoneOtpVerifyResult = z.infer<typeof phoneOtpVerifyResultSchema>;

export const publicAuthClaimsSchema = z
  .object({
    subject: z.string().min(1),
    role: z.literal("public"),
    providers: z.array(authProviderSchema),
    emailVerified: z.boolean(),
    phoneVerified: z.boolean(),
  })
  .strict();
export type PublicAuthClaims = z.infer<typeof publicAuthClaimsSchema>;

export const staffAuthClaimsSchema = z
  .object({
    subject: z.string().min(1),
    role: z.enum(["staff", "admin"]),
    providers: z.array(authProviderSchema),
    emailVerified: z.boolean(),
    phoneVerified: z.boolean(),
    permissions: z.array(z.string().min(1)),
  })
  .strict();
export type StaffAuthClaims = z.infer<typeof staffAuthClaimsSchema>;

export const authClaimsSchema = z.discriminatedUnion("role", [
  publicAuthClaimsSchema,
  staffAuthClaimsSchema,
]);
export type AuthClaims = z.infer<typeof authClaimsSchema>;
