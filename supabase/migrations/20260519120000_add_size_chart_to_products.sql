-- Add size_chart column to products table
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS size_chart TEXT;
