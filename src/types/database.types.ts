/**
 * Database types matching Supabase schema
 * These types are used for type-safe database operations
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AccountType = 'saving' | 'spending' | 'wallet' | 'investment' | 'business';

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_type: AccountType;
          balance: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          account_type: AccountType;
          balance?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_type?: AccountType;
          balance?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      income_types: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          target_amount: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          target_amount?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          target_amount?: number | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      incomes: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          income_type_id: string;
          amount: number;
          description: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          income_type_id: string;
          amount: number;
          description?: string | null;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          income_type_id?: string;
          amount?: number;
          description?: string | null;
          date?: string;
          updated_at?: string;
        };
      };
      expense_types: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          budget_amount: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          budget_amount?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          budget_amount?: number | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          expense_type_id: string;
          amount: number;
          description: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          expense_type_id: string;
          amount: number;
          description?: string | null;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          expense_type_id?: string;
          amount?: number;
          description?: string | null;
          date?: string;
          updated_at?: string;
        };
      };
      transfers: {
        Row: {
          id: string;
          user_id: string;
          from_account_id: string;
          to_account_id: string;
          amount: number;
          description: string | null;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          from_account_id: string;
          to_account_id: string;
          amount: number;
          description?: string | null;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          from_account_id?: string;
          to_account_id?: string;
          amount?: number;
          description?: string | null;
          date?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          name: string;
          amount: number;
          billing_cycle: BillingCycle;
          next_billing_date: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          name: string;
          amount: number;
          billing_cycle: BillingCycle;
          next_billing_date: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          name?: string;
          amount?: number;
          billing_cycle?: BillingCycle;
          next_billing_date?: string;
          description?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      account_type: AccountType;
      billing_cycle: BillingCycle;
    };
  };
}

// Convenience types for table rows
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Account = Database['public']['Tables']['accounts']['Row'];
export type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
export type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

export type IncomeType = Database['public']['Tables']['income_types']['Row'];
export type IncomeTypeInsert = Database['public']['Tables']['income_types']['Insert'];
export type IncomeTypeUpdate = Database['public']['Tables']['income_types']['Update'];

export type Income = Database['public']['Tables']['incomes']['Row'];
export type IncomeInsert = Database['public']['Tables']['incomes']['Insert'];
export type IncomeUpdate = Database['public']['Tables']['incomes']['Update'];

export type ExpenseType = Database['public']['Tables']['expense_types']['Row'];
export type ExpenseTypeInsert = Database['public']['Tables']['expense_types']['Insert'];
export type ExpenseTypeUpdate = Database['public']['Tables']['expense_types']['Update'];

export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export type Transfer = Database['public']['Tables']['transfers']['Row'];
export type TransferInsert = Database['public']['Tables']['transfers']['Insert'];
export type TransferUpdate = Database['public']['Tables']['transfers']['Update'];

export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

// Extended types with relations
export interface IncomeWithRelations extends Income {
  account?: Account;
  income_type?: IncomeType;
}

export interface ExpenseWithRelations extends Expense {
  account?: Account;
  expense_type?: ExpenseType;
}

export interface TransferWithRelations extends Transfer {
  from_account?: Account;
  to_account?: Account;
}

export interface SubscriptionWithRelations extends Subscription {
  account?: Account;
}
