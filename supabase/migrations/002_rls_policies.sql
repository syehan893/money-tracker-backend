-- Finance OS Row Level Security Policies
-- Ensures users can only access their own data

-- ============================================
-- PROFILES RLS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- ACCOUNTS RLS
-- ============================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own accounts
CREATE POLICY "accounts_select_own" ON accounts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own accounts
CREATE POLICY "accounts_insert_own" ON accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own accounts
CREATE POLICY "accounts_update_own" ON accounts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own accounts
CREATE POLICY "accounts_delete_own" ON accounts
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- INCOME TYPES RLS
-- ============================================
ALTER TABLE income_types ENABLE ROW LEVEL SECURITY;

-- Users can view their own income types
CREATE POLICY "income_types_select_own" ON income_types
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own income types
CREATE POLICY "income_types_insert_own" ON income_types
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own income types
CREATE POLICY "income_types_update_own" ON income_types
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own income types
CREATE POLICY "income_types_delete_own" ON income_types
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- INCOMES RLS
-- ============================================
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

-- Users can view their own incomes
CREATE POLICY "incomes_select_own" ON incomes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own incomes
CREATE POLICY "incomes_insert_own" ON incomes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own incomes
CREATE POLICY "incomes_update_own" ON incomes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own incomes
CREATE POLICY "incomes_delete_own" ON incomes
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- EXPENSE TYPES RLS
-- ============================================
ALTER TABLE expense_types ENABLE ROW LEVEL SECURITY;

-- Users can view their own expense types
CREATE POLICY "expense_types_select_own" ON expense_types
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own expense types
CREATE POLICY "expense_types_insert_own" ON expense_types
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own expense types
CREATE POLICY "expense_types_update_own" ON expense_types
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own expense types
CREATE POLICY "expense_types_delete_own" ON expense_types
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- EXPENSES RLS
-- ============================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Users can view their own expenses
CREATE POLICY "expenses_select_own" ON expenses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own expenses
CREATE POLICY "expenses_insert_own" ON expenses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own expenses
CREATE POLICY "expenses_update_own" ON expenses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own expenses
CREATE POLICY "expenses_delete_own" ON expenses
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRANSFERS RLS
-- ============================================
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Users can view their own transfers
CREATE POLICY "transfers_select_own" ON transfers
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own transfers
CREATE POLICY "transfers_insert_own" ON transfers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transfers (no update allowed)
CREATE POLICY "transfers_delete_own" ON transfers
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- SUBSCRIPTIONS RLS
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "subscriptions_select_own" ON subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "subscriptions_insert_own" ON subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "subscriptions_update_own" ON subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "subscriptions_delete_own" ON subscriptions
    FOR DELETE
    USING (auth.uid() = user_id);
