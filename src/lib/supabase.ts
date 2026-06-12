import { createClient } from '@supabase/supabase-js';

// Aap ko yeh values apne Supabase project se dalni hongi
// Step:
// 1. https://supabase.com pe ja kar FREE account banaen
// 2. New Project banaen
// 3. Settings > API mein jaen
// 4. Project URL aur anon/public key yeh replace karein

const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co'; // Apna URL yahan rakhein
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY'; // Apna anon key yahan rakhein

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConfigured = () => {
  return !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY');
};

// ===== SQL TABLES =====
// Neeche di hui SQL code ko Supabase SQL Editor mein chalana hai:
/*

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (login ke liye)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('manager', 'editor')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock items table
CREATE TABLE stock_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type_id TEXT NOT NULL,
  color_code TEXT NOT NULL,
  size_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  purchase_price NUMERIC(10,2) DEFAULT 0,
  sale_price NUMERIC(10,2) DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(type_id, color_code, size_name)
);

-- Transactions table (stock in/out/sale)
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('in', 'out', 'sale')),
  quantity INTEGER NOT NULL,
  note TEXT,
  customer_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS) - abhi ke liye open hai, baad mein secure kar sakte ho
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Simple policies (har user sab kuch kar sakta hai - abhi ke liye)
CREATE POLICY "Allow all" ON users FOR ALL USING (true);
CREATE POLICY "Allow all" ON stock_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all" ON invoices FOR ALL USING (true);

-- Default users insert karo
INSERT INTO users (username, password, name, role) VALUES
('manager', 'manager123', 'Manager', 'manager'),
('editor', 'editor123', 'Editor', 'editor');

*/
