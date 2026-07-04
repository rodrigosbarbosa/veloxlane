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
          vin: string;
          make: string;
          model: string;
          year: number;
          mileage: number;
          price: number;
          description: string | null;
          status: string;
          autocheck_data: Json | null;
          /** @deprecated legacy column — superseded by autocheck_data (migration 013). */
          carfax_data: Json | null;
          escrow_fee_mode: string | null;
          location: string;
          state: string;
          photos_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          vin: string;
          make: string;
          model: string;
          year: number;
          mileage?: number;
          price?: number;
          description?: string | null;
          status?: string;
          autocheck_data?: Json | null;
          escrow_fee_mode?: string | null;
          location: string;
          state: string;
          photos_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          vin?: string;
          make?: string;
          model?: string;
          year?: number;
          mileage?: number;
          price?: number;
          description?: string | null;
          status?: string;
          autocheck_data?: Json | null;
          escrow_fee_mode?: string | null;
          location?: string;
          state?: string;
          photos_count?: number;
          published_at?: string | null;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string | null;
          processed_path: string | null;
          plate_detected: boolean;
          plate_bbox: Json | null;
          plate_cover_status: string;
          angle_slot: number | null;
          ai_quality_score: number | null;
          approved: boolean;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path?: string | null;
          processed_path?: string | null;
          plate_detected?: boolean;
          plate_bbox?: Json | null;
          plate_cover_status?: string;
          angle_slot?: number | null;
          ai_quality_score?: number | null;
          approved?: boolean;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          storage_path?: string | null;
          processed_path?: string | null;
          plate_detected?: boolean;
          plate_bbox?: Json | null;
          plate_cover_status?: string;
          angle_slot?: number | null;
          ai_quality_score?: number | null;
          approved?: boolean;
          source?: string;
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
      vin_lookups: {
        Row: {
          vin: string;
          autocheck_data: Json | null;
          autocheck_fetched_at: string | null;
          /** @deprecated legacy columns — superseded by autocheck_* (migration 013). */
          carfax_data: Json | null;
          carfax_fetched_at: string | null;
          marketcheck_data: Json | null;
          marketcheck_fetched_at: string | null;
          nhtsa_recalls: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          vin: string;
          autocheck_data?: Json | null;
          autocheck_fetched_at?: string | null;
          marketcheck_data?: Json | null;
          marketcheck_fetched_at?: string | null;
          nhtsa_recalls?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          autocheck_data?: Json | null;
          autocheck_fetched_at?: string | null;
          marketcheck_data?: Json | null;
          marketcheck_fetched_at?: string | null;
          nhtsa_recalls?: Json | null;
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
export const photosTable = "photos" as const;
export const paymentsTable = "payments" as const;
export const profilesTable = "profiles" as const;
export const webhookEventsTable = "webhook_events" as const;

export {
  createSupabaseClient,
  type SupabaseAuthStorage,
} from "./create-client";

export type {
  PaymentInsert,
  PhotoInsert,
  PhotoRow,
  PhotoUpdate,
  PaymentRow,
  PaymentUpdate,
  PhoneRateLimitRow,
  PhoneRateLimitUpdate,
  ProfileRow,
  ProfileUpdate,
  WebhookEventRow,
} from "./tables";
