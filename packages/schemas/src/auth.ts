import { z } from "zod";

import { isValidUsPhone } from "./phone";

export const userRoleSchema = z.enum(["buyer", "seller"]);

export const onboardingStepSchema = z.enum([
  "signup",
  "phone",
  "identity",
  "complete",
]);

export const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string(),
    fullName: z
      .string()
      .min(2, "Enter your full name.")
      .max(80, "Name is too long."),
    role: userRoleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, "Enter a valid US phone number.")
    .max(20, "Phone number is too long.")
    .refine(isValidUsPhone, "Enter a valid US phone number."),
});

export const otpSchema = z.object({
  phone: z.string().min(10),
  token: z
    .string()
    .length(6, "Enter the 6-digit code.")
    .regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type OnboardingStep = z.infer<typeof onboardingStepSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
