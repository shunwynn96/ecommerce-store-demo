-- Add additional images to existing products
UPDATE products 
SET images = '[
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&h=500&fit=crop"
]'::jsonb
WHERE name = 'Smart Watch';

UPDATE products 
SET images = '[
  "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=500&h=500&fit=crop"
]'::jsonb
WHERE name = 'Laptop Stand';

UPDATE products 
SET images = '[
  "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&h=500&fit=crop"
]'::jsonb
WHERE name = 'Bluetooth Speaker';

UPDATE products 
SET images = '[
  "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=500&h=500&fit=crop"
]'::jsonb
WHERE name = 'USB-C Hub';

UPDATE products 
SET images = '[
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop"
]'::jsonb
WHERE name = 'Wireless Headphones';