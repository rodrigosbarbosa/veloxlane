/**
 * Placeholder database types until `supabase gen types` runs in CI/local.
 * Replace with generated Database type from Supabase CLI.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          full_name: string | null;
          role: string;
          status: string;
          id_verified: boolean;
          phone_verified: boolean;
          onboarding_step: string;
          identity_attempts: number;
          identity_manual_review: boolean;
          risk_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          full_name?: string | null;
          role?: string;
          status?: string;
          id_verified?: boolean;
          phone_verified?: boolean;
          onboarding_step?: string;
          identity_attempts?: number;
          identity_manual_review?: boolean;
          risk_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          phone?: string | null;
          full_name?: string | null;
          role?: string;
          status?: string;
          id_verified?: boolean;
          phone_verified?: boolean;
          onboarding_step?: string;
          identity_attempts?: number;
          identity_manual_review?: boolean;
          risk_score?: number;
        };
        Relationships: [];
      };
      auth_phone_rate_limits: {
        Row: {
          phone: string;
          verify_attempts: number;
          resend_attempts: number;
          window_started_at: string;
          cooldown_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          phone: string;
          verify_attempts?: number;
          resend_attempts?: number;
          window_started_at?: string;
          cooldown_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          verify_attempts?: number;
          resend_attempts?: number;
          window_started_at?: string;
          cooldown_until?: string | null;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          seller_id: string;
          status: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          status?: string;
          price: number;
          created_at?: string;
        };
        Update: {
          status?: string;
          price?: number;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount_cents: number;
          stripe_payment_intent: string;
          status: string;
          related_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          amount_cents: number;
          stripe_payment_intent: string;
          status?: string;
          related_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: string;
          amount_cents?: number;
          stripe_payment_intent?: string;
          status?: string;
          related_id?: string | null;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          source: string;
          processed_at: string;
        };
        Insert: {
          id: string;
          source?: string;
          processed_at?: string;
        };
        Update: {
          source?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export const listingTable = "listings" as const;
export const paymentsTable = "payments" as const;
export const profilesTable = "profiles" as const;
export const webhookEventsTable = "webhook_events" as const;

export {
  createSupabaseClient,
  type SupabaseAuthStorage,
} from "./create-client";

export type {
  PaymentInsert,
  PaymentRow,
  PaymentUpdate,
  PhoneRateLimitRow,
  PhoneRateLimitUpdate,
  ProfileRow,
  ProfileUpdate,
  WebhookEventRow,
} from "./tables";
