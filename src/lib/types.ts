export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  discount_price: number | null;
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  is_active: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "online";

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  district: string;
  payment_method: PaymentMethod;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
};

export type CartItem = {
  productId: string;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number; // effective price (discount or main)
};

export const ADMIN_EMAIL = "outfitmamashop@gmail.com";
