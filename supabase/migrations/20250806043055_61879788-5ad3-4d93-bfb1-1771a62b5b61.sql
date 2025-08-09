-- Add support for multiple product images
-- Keep existing image_url as the main image for backward compatibility
-- Add images array field for additional images
ALTER TABLE public.products 
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;