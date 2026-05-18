-- Drop existing foreign key constraints if they exist
ALTER TABLE public.order_items 
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.offline_sales 
  DROP CONSTRAINT IF EXISTS offline_sales_product_id_fkey;

-- Recreate foreign key constraints with ON DELETE SET NULL
ALTER TABLE public.order_items 
  ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES public.products(id) 
    ON DELETE SET NULL;

ALTER TABLE public.offline_sales 
  ADD CONSTRAINT offline_sales_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES public.products(id) 
    ON DELETE SET NULL;
