-- PrintPod Database Schema for Supabase

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  bio TEXT,
  store_banner TEXT,
  store_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tshirt_color TEXT DEFAULT 'white' CHECK (tshirt_color IN ('white', 'black')),
  design_front_url TEXT,
  design_back_url TEXT,
  preview_front_url TEXT,
  preview_back_url TEXT,
  base_price DECIMAL(10,3) NOT NULL DEFAULT 42.000,
  selling_price DECIMAL(10,3) NOT NULL,
  profit DECIMAL(10,3) GENERATED ALWAYS AS (selling_price - base_price) STORED,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{S,M,L,XL}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES users(id),
  total_amount DECIMAL(10,3) NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address1 TEXT NOT NULL,
  shipping_address2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'US',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,3) NOT NULL,
  design_front_url TEXT,
  design_back_url TEXT
);

-- Indexes
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Storage bucket for designs (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('previews', 'previews', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);
