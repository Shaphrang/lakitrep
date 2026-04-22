export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      admin_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected" | "no_show";
      payment_status: "unpaid" | "paid_on_arrival" | "partially_paid" | "waived";
      inquiry_status: "new" | "contacted" | "closed" | "spam";
      event_inquiry_status: "new" | "contacted" | "quoted" | "confirmed" | "cancelled" | "closed";
      cottage_status: "active" | "inactive" | "maintenance";
    };
    CompositeTypes: Record<string, never>;
  };
};
