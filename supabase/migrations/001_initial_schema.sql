-- Finance OS Database Schema
-- Initial migration: Create all tables with proper types, indexes, and constraints

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
CREATE TYPE account_type AS ENUM ('saving', 'spending', 'wallet', 'investment', 'business');
CREATE TYPE billing_cycle AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with additional user data
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for email lookups
CREATE INDEX idx_profiles_email ON profiles(email);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';

-- ============================================
-- ACCOUNTS TABLE
-- User financial accounts (saving, spending, etc.)
-- ============================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    account_type account_type NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Ensure balance is non-negative
    CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_user_type ON accounts(user_id, account_type);
CREATE INDEX idx_accounts_active ON accounts(user_id, is_active);

COMMENT ON TABLE accounts IS 'User financial accounts for managing money';

-- ============================================
-- INCOME TYPES TABLE
-- Categories for income sources with optional targets
-- ============================================
CREATE TABLE income_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15, 2),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Target amount must be positive if set
    CONSTRAINT positive_target CHECK (target_amount IS NULL OR target_amount > 0),
    -- Unique name per user
    CONSTRAINT unique_income_type_name UNIQUE (user_id, name)
);

-- Index for user lookups
CREATE INDEX idx_income_types_user_id ON income_types(user_id);

COMMENT ON TABLE income_types IS 'Income categories with optional monthly targets';

-- ============================================
-- INCOMES TABLE
-- Individual income transactions
-- ============================================
CREATE TABLE incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    income_type_id UUID NOT NULL REFERENCES income_types(id) ON DELETE RESTRICT,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Amount must be positive
    CONSTRAINT positive_income_amount CHECK (amount > 0)
);

-- Indexes for common queries
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_incomes_account_id ON incomes(account_id);
CREATE INDEX idx_incomes_type_id ON incomes(income_type_id);
CREATE INDEX idx_incomes_date ON incomes(date);
CREATE INDEX idx_incomes_user_date ON incomes(user_id, date);

COMMENT ON TABLE incomes IS 'Income transactions linked to accounts and types';

-- ============================================
-- EXPENSE TYPES TABLE
-- Categories for expenses with optional budgets
-- ============================================
CREATE TABLE expense_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    budget_amount DECIMAL(15, 2),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Budget amount must be positive if set
    CONSTRAINT positive_budget CHECK (budget_amount IS NULL OR budget_amount > 0),
    -- Unique name per user
    CONSTRAINT unique_expense_type_name UNIQUE (user_id, name)
);

-- Index for user lookups
CREATE INDEX idx_expense_types_user_id ON expense_types(user_id);

COMMENT ON TABLE expense_types IS 'Expense categories with optional monthly budgets';

-- ============================================
-- EXPENSES TABLE
-- Individual expense transactions
-- ============================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    expense_type_id UUID NOT NULL REFERENCES expense_types(id) ON DELETE RESTRICT,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Amount must be positive
    CONSTRAINT positive_expense_amount CHECK (amount > 0)
);

-- Indexes for common queries
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_account_id ON expenses(account_id);
CREATE INDEX idx_expenses_type_id ON expenses(expense_type_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);

COMMENT ON TABLE expenses IS 'Expense transactions linked to accounts and types';

-- ============================================
-- TRANSFERS TABLE
-- Inter-account transfers
-- ============================================
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    from_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    to_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Amount must be positive
    CONSTRAINT positive_transfer_amount CHECK (amount > 0),
    -- Cannot transfer to same account
    CONSTRAINT different_accounts CHECK (from_account_id != to_account_id)
);

-- Indexes for common queries
CREATE INDEX idx_transfers_user_id ON transfers(user_id);
CREATE INDEX idx_transfers_from_account ON transfers(from_account_id);
CREATE INDEX idx_transfers_to_account ON transfers(to_account_id);
CREATE INDEX idx_transfers_date ON transfers(date);
CREATE INDEX idx_transfers_user_date ON transfers(user_id, date);

COMMENT ON TABLE transfers IS 'Transfers between user accounts';

-- ============================================
-- SUBSCRIPTIONS TABLE
-- Recurring subscriptions
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    billing_cycle billing_cycle NOT NULL,
    next_billing_date DATE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Amount must be positive
    CONSTRAINT positive_subscription_amount CHECK (amount > 0)
);

-- Indexes for common queries
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_account_id ON subscriptions(account_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(user_id, is_active);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date);

COMMENT ON TABLE subscriptions IS 'Recurring subscriptions with billing schedules';
