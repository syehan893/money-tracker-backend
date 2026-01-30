-- Finance OS Database Triggers and Functions
-- Handles automatic balance updates and data integrity

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_accounts
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_income_types
    BEFORE UPDATE ON income_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_incomes
    BEFORE UPDATE ON incomes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_expense_types
    BEFORE UPDATE ON expense_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_expenses
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_transfers
    BEFORE UPDATE ON transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_subscriptions
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PROFILE CREATION TRIGGER
-- Automatically create profile when user signs up
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- INCOME BALANCE UPDATE TRIGGERS
-- ============================================

-- Function to handle income insert
CREATE OR REPLACE FUNCTION handle_income_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Add income amount to account balance
    UPDATE accounts
    SET balance = balance + NEW.amount
    WHERE id = NEW.account_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle income update
CREATE OR REPLACE FUNCTION handle_income_update()
RETURNS TRIGGER AS $$
DECLARE
    amount_diff DECIMAL(15, 2);
BEGIN
    -- If account changed, move balance between accounts
    IF OLD.account_id != NEW.account_id THEN
        -- Remove from old account
        UPDATE accounts
        SET balance = balance - OLD.amount
        WHERE id = OLD.account_id;

        -- Add to new account
        UPDATE accounts
        SET balance = balance + NEW.amount
        WHERE id = NEW.account_id;
    -- If only amount changed
    ELSIF OLD.amount != NEW.amount THEN
        amount_diff := NEW.amount - OLD.amount;
        UPDATE accounts
        SET balance = balance + amount_diff
        WHERE id = NEW.account_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle income delete
CREATE OR REPLACE FUNCTION handle_income_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Subtract income amount from account balance
    UPDATE accounts
    SET balance = balance - OLD.amount
    WHERE id = OLD.account_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply income triggers
CREATE TRIGGER on_income_insert
    AFTER INSERT ON incomes
    FOR EACH ROW
    EXECUTE FUNCTION handle_income_insert();

CREATE TRIGGER on_income_update
    AFTER UPDATE ON incomes
    FOR EACH ROW
    EXECUTE FUNCTION handle_income_update();

CREATE TRIGGER on_income_delete
    AFTER DELETE ON incomes
    FOR EACH ROW
    EXECUTE FUNCTION handle_income_delete();

-- ============================================
-- EXPENSE BALANCE UPDATE TRIGGERS
-- ============================================

-- Function to validate expense doesn't exceed balance
CREATE OR REPLACE FUNCTION validate_expense_balance()
RETURNS TRIGGER AS $$
DECLARE
    current_balance DECIMAL(15, 2);
    required_balance DECIMAL(15, 2);
BEGIN
    -- Get current account balance
    SELECT balance INTO current_balance
    FROM accounts
    WHERE id = NEW.account_id;

    -- For INSERT, check if balance is sufficient
    IF TG_OP = 'INSERT' THEN
        IF current_balance < NEW.amount THEN
            RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', NEW.amount, current_balance;
        END IF;
    -- For UPDATE, check if balance change is valid
    ELSIF TG_OP = 'UPDATE' THEN
        -- If account changed
        IF OLD.account_id != NEW.account_id THEN
            IF current_balance < NEW.amount THEN
                RAISE EXCEPTION 'Insufficient balance in new account. Required: %, Available: %', NEW.amount, current_balance;
            END IF;
        -- If amount increased
        ELSIF NEW.amount > OLD.amount THEN
            required_balance := NEW.amount - OLD.amount;
            IF current_balance < required_balance THEN
                RAISE EXCEPTION 'Insufficient balance for increased amount. Additional required: %, Available: %', required_balance, current_balance;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle expense insert
CREATE OR REPLACE FUNCTION handle_expense_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Subtract expense amount from account balance
    UPDATE accounts
    SET balance = balance - NEW.amount
    WHERE id = NEW.account_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle expense update
CREATE OR REPLACE FUNCTION handle_expense_update()
RETURNS TRIGGER AS $$
DECLARE
    amount_diff DECIMAL(15, 2);
BEGIN
    -- If account changed, move balance between accounts
    IF OLD.account_id != NEW.account_id THEN
        -- Add back to old account
        UPDATE accounts
        SET balance = balance + OLD.amount
        WHERE id = OLD.account_id;

        -- Subtract from new account
        UPDATE accounts
        SET balance = balance - NEW.amount
        WHERE id = NEW.account_id;
    -- If only amount changed
    ELSIF OLD.amount != NEW.amount THEN
        amount_diff := OLD.amount - NEW.amount;
        UPDATE accounts
        SET balance = balance + amount_diff
        WHERE id = NEW.account_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle expense delete
CREATE OR REPLACE FUNCTION handle_expense_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Add expense amount back to account balance
    UPDATE accounts
    SET balance = balance + OLD.amount
    WHERE id = OLD.account_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply expense triggers
CREATE TRIGGER on_expense_validate
    BEFORE INSERT OR UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION validate_expense_balance();

CREATE TRIGGER on_expense_insert
    AFTER INSERT ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION handle_expense_insert();

CREATE TRIGGER on_expense_update
    AFTER UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION handle_expense_update();

CREATE TRIGGER on_expense_delete
    AFTER DELETE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION handle_expense_delete();

-- ============================================
-- TRANSFER BALANCE UPDATE TRIGGERS
-- ============================================

-- Function to validate transfer doesn't exceed balance
CREATE OR REPLACE FUNCTION validate_transfer_balance()
RETURNS TRIGGER AS $$
DECLARE
    from_balance DECIMAL(15, 2);
BEGIN
    -- Get source account balance
    SELECT balance INTO from_balance
    FROM accounts
    WHERE id = NEW.from_account_id;

    IF from_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient balance for transfer. Required: %, Available: %', NEW.amount, from_balance;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle transfer insert
CREATE OR REPLACE FUNCTION handle_transfer_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Subtract from source account
    UPDATE accounts
    SET balance = balance - NEW.amount
    WHERE id = NEW.from_account_id;

    -- Add to destination account
    UPDATE accounts
    SET balance = balance + NEW.amount
    WHERE id = NEW.to_account_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle transfer delete (reverse the transfer)
CREATE OR REPLACE FUNCTION handle_transfer_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Add back to source account
    UPDATE accounts
    SET balance = balance + OLD.amount
    WHERE id = OLD.from_account_id;

    -- Subtract from destination account
    UPDATE accounts
    SET balance = balance - OLD.amount
    WHERE id = OLD.to_account_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply transfer triggers
CREATE TRIGGER on_transfer_validate
    BEFORE INSERT ON transfers
    FOR EACH ROW
    EXECUTE FUNCTION validate_transfer_balance();

CREATE TRIGGER on_transfer_insert
    AFTER INSERT ON transfers
    FOR EACH ROW
    EXECUTE FUNCTION handle_transfer_insert();

CREATE TRIGGER on_transfer_delete
    AFTER DELETE ON transfers
    FOR EACH ROW
    EXECUTE FUNCTION handle_transfer_delete();

-- ============================================
-- HELPER FUNCTIONS FOR DASHBOARD QUERIES
-- ============================================

-- Function to get monthly income total for a user
CREATE OR REPLACE FUNCTION get_monthly_income(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    total DECIMAL(15, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total
    FROM incomes
    WHERE user_id = p_user_id
      AND EXTRACT(YEAR FROM date) = p_year
      AND EXTRACT(MONTH FROM date) = p_month;

    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly expense total for a user
CREATE OR REPLACE FUNCTION get_monthly_expense(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    total DECIMAL(15, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total
    FROM expenses
    WHERE user_id = p_user_id
      AND EXTRACT(YEAR FROM date) = p_year
      AND EXTRACT(MONTH FROM date) = p_month;

    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total balance across all accounts
CREATE OR REPLACE FUNCTION get_total_balance(p_user_id UUID)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    total DECIMAL(15, 2);
BEGIN
    SELECT COALESCE(SUM(balance), 0) INTO total
    FROM accounts
    WHERE user_id = p_user_id
      AND is_active = true;

    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
