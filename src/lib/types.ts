export type UserRole = 'customer' | 'seller' | 'admin';
export type ProductStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'confirmed' | 'printing' | 'shipped' | 'delivered' | 'cancelled';
export type TshirtColor = 'white' | 'black';
export type TshirtSide = 'front' | 'back';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
  store_banner?: string;
  store_name?: string;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  tshirt_color: TshirtColor;
  design_front_url?: string;
  design_back_url?: string;
  preview_front_url?: string;
  preview_back_url?: string;
  base_price: number;
  selling_price: number;
  profit: number;
  status: ProductStatus;
  category: string;
  tags: string[];
  sizes: string[];
  created_at: string;
  updated_at: string;
  seller?: User;
}

export interface CartItem {
  product_id: string;
  product: Product;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: ShippingAddress;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  customer?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  size: string;
  quantity: number;
  unit_price: number;
  design_front_url?: string;
  design_back_url?: string;
  product?: Product;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface DesignState {
  tshirtColor: TshirtColor;
  activeSide: TshirtSide;
  frontDesign: string | null;
  backDesign: string | null;
  frontObjects: object[];
  backObjects: object[];
}
