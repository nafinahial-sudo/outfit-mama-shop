
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Admins read roles" ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Order status enum
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','shipped','delivered','cancelled');
CREATE TYPE public.payment_method AS ENUM ('cod','online');

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  price numeric(10,2) NOT NULL,
  discount_price numeric(10,2),
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  district text NOT NULL,
  payment_method payment_method NOT NULL,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- Order items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  size text,
  color text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(),'admin'));

-- updated_at trigger fn
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images','product-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update product images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete product images" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
