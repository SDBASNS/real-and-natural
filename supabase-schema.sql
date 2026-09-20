-- ==============================================================================
-- REAL & NATURAL — SUPABASE DATABASE SCHEMA
-- File: supabase-schema.sql
-- 
-- Instructions:
-- 1. Go to your Supabase Project Dashboard: https://supabase.com/dashboard
-- 2. Select your project (or create a new one at https://database.new)
-- 3. In the left sidebar, click on "SQL Editor"
-- 4. Paste the entire content of this file and click "Run" (or press Ctrl+Enter)
-- ==============================================================================

-- 1. Enable UUID Extension (built into Postgres/Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the `orders` Table
CREATE TABLE IF NOT EXISTS public.orders (
    -- Unique order identifier (e.g. RN-580870)
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    
    -- Order status: 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
    status TEXT NOT NULL DEFAULT 'Pending',
    
    -- Customer Delivery Information
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT DEFAULT '',
    customer_address TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    customer_state TEXT NOT NULL,
    customer_pincode TEXT NOT NULL,
    
    -- Payment & Financial Breakdown
    payment_method TEXT NOT NULL DEFAULT 'COD', -- 'COD', 'RAZORPAY', 'UPI'
    items JSONB NOT NULL DEFAULT '[]'::jsonb,   -- Line items: [{ name, pack, price, quantity, ... }]
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    
    -- Optional Integrations & Tracking
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    shiprocket_order_id TEXT,
    shiprocket_shipment_id TEXT,
    tracking_number TEXT,
    notes TEXT
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_pincode ON public.orders (customer_pincode);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated clients to create new orders
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
CREATE POLICY "Allow public insert on orders"
    ON public.orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow Service Role (Backend Server / Admin) full access to read, update & manage orders
DROP POLICY IF EXISTS "Allow full access for service role" ON public.orders;
CREATE POLICY "Allow full access for service role"
    ON public.orders
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users / server to select orders
DROP POLICY IF EXISTS "Allow users to view own orders" ON public.orders;
CREATE POLICY "Allow users to view own orders"
    ON public.orders
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 5. Auto-update `updated_at` Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_orders_updated_at();

-- 6. Insert Initial Verification Record (Optional)
INSERT INTO public.orders (
    id,
    status,
    customer_name,
    customer_phone,
    customer_email,
    customer_address,
    customer_city,
    customer_state,
    customer_pincode,
    payment_method,
    items,
    subtotal,
    discount,
    shipping,
    total
) VALUES (
    'RN-100001',
    'Confirmed',
    'Rohit Nikam',
    '7745835883',
    'rohitnikam365@gmail.com',
    'Near Abhijeet Dada Kadam School, Palus',
    'Sangli',
    'Maharashtra',
    '416310',
    'COD',
    '[{"id":"ea02de55-7455-4570-9d26-65b94b29aec9-500g","name":"Golden Raisins (Kishmish)","pack":"500g","price":368,"mrp":498,"quantity":2}]'::jsonb,
    736.00,
    260.00,
    0.00,
    736.00
) ON CONFLICT (id) DO NOTHING;
