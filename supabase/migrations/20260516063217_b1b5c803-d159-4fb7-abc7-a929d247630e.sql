
-- Offline sales table
CREATE TABLE public.offline_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category TEXT,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  customer_name TEXT,
  phone TEXT,
  notes TEXT,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.offline_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read offline sales" ON public.offline_sales
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert offline sales" ON public.offline_sales
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update offline sales" ON public.offline_sales
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete offline sales" ON public.offline_sales
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Site settings (social media etc.)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by everyone" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins insert settings" ON public.site_settings
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update settings" ON public.site_settings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete settings" ON public.site_settings
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Seed empty social keys
INSERT INTO public.site_settings (key, value) VALUES
  ('social_facebook', ''),
  ('social_whatsapp', ''),
  ('social_instagram', ''),
  ('social_tiktok', ''),
  ('social_youtube', ''),
  ('support_phone', '')
ON CONFLICT (key) DO NOTHING;
