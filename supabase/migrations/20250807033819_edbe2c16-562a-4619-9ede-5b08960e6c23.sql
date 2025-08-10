-- Add category column to products table
ALTER TABLE public.products 
ADD COLUMN category TEXT NOT NULL DEFAULT 'general';

-- Add some sample categories to existing products if any
UPDATE public.products 
SET category = CASE 
  WHEN LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%macbook%' OR LOWER(name) LIKE '%computer%' THEN 'laptops'
  WHEN LOWER(name) LIKE '%mouse%' OR LOWER(name) LIKE '%keyboard%' OR LOWER(name) LIKE '%headphone%' OR LOWER(name) LIKE '%cable%' THEN 'accessories'
  WHEN LOWER(name) LIKE '%phone%' OR LOWER(name) LIKE '%iphone%' OR LOWER(name) LIKE '%samsung%' THEN 'smartphones'
  WHEN LOWER(name) LIKE '%tablet%' OR LOWER(name) LIKE '%ipad%' THEN 'tablets'
  ELSE 'electronics'
END;