-- Add is_featured column to products table
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
