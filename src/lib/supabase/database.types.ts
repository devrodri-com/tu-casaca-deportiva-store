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
      products: {
        Row: {
          id: string;
          slug: string;
          title: string;
          audience: "adult" | "kids";
          product_type: "football_jersey" | "nba_jersey" | "jacket";
          entity_slug: string;
          entity_name: string;
          entity_kind: "club" | "national_team" | "franchise";
          era: "current" | "retro";
          supports_customization: boolean;
          customization_surcharge: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          audience: "adult" | "kids";
          product_type: "football_jersey" | "nba_jersey" | "jacket";
          entity_slug: string;
          entity_name: string;
          entity_kind: "club" | "national_team" | "franchise";
          era: "current" | "retro";
          supports_customization?: boolean;
          customization_surcharge?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          unit_base_price: string;
          express_stock: number;
          allow_made_to_order: boolean;
          made_to_order_min_days: number | null;
          made_to_order_max_days: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          unit_base_price: string;
          express_stock?: number;
          allow_made_to_order?: boolean;
          made_to_order_min_days?: number | null;
          made_to_order_max_days?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          public_reference: string;
          total: string;
          customer_full_name: string;
          customer_phone: string;
          customer_email: string | null;
          payment_status: "awaiting_payment" | "pending" | "paid" | "failed";
          mercado_pago_preference_id: string | null;
          mercado_pago_payment_id: string | null;
          mercado_pago_status: string | null;
          paid_at: string | null;
          stock_discounted_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          public_reference: string;
          total: string;
          customer_full_name: string;
          customer_phone: string;
          customer_email?: string | null;
          payment_status?: "awaiting_payment" | "pending" | "paid" | "failed";
          mercado_pago_preference_id?: string | null;
          mercado_pago_payment_id?: string | null;
          mercado_pago_status?: string | null;
          paid_at?: string | null;
          stock_discounted_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          title_snapshot: string;
          size_snapshot: string;
          fulfillment_snapshot: "express" | "made_to_order" | "unavailable";
          promised_min_days: number | null;
          promised_max_days: number | null;
          unit_price_snapshot: string;
          quantity: number;
          customization_snapshot: Json | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          title_snapshot: string;
          size_snapshot: string;
          fulfillment_snapshot: "express" | "made_to_order" | "unavailable";
          promised_min_days?: number | null;
          promised_max_days?: number | null;
          unit_price_snapshot: string;
          quantity?: number;
          customization_snapshot?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
