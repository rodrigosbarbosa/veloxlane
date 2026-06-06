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
          role: string;
          id_verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          id_verified?: boolean;
          created_at?: string;
        };
        Update: {
          email?: string;
          role?: string;
          id_verified?: boolean;
        };
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
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export const listingTable = "listings" as const;
export const profilesTable = "profiles" as const;
