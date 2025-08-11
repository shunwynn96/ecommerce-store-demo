-- Add more products to electronics category
INSERT INTO public.products (name, description, price, image_url, category, stock, images) VALUES
('Wireless Charging Pad', 'Fast 15W wireless charger compatible with all Qi-enabled devices', 39.99, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop', 'electronics', 35, '["https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1609592937345-9a84583b14ca?w=500&h=500&fit=crop"]'),

('4K Webcam', 'Ultra HD webcam with auto-focus and built-in microphone for streaming', 129.99, 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=500&h=500&fit=crop', 'electronics', 20, '["https://images.unsplash.com/photo-1597733336794-12d05021d510?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop"]'),

('Portable Power Bank', '20000mAh high-capacity power bank with fast charging and LED display', 49.99, 'https://images.unsplash.com/photo-1609592167213-511e7e16a3cb?w=500&h=500&fit=crop', 'electronics', 45, '["https://images.unsplash.com/photo-1609592167213-511e7e16a3cb?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1635336969302-2e0c3c2b36e4?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1567694867460-2b062b78de98?w=500&h=500&fit=crop"]'),

-- Add more products to accessories category
('Mechanical Keyboard', 'RGB backlit mechanical gaming keyboard with blue switches', 149.99, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=500&fit=crop', 'accessories', 18, '["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop"]'),

('Gaming Mouse', 'Precision gaming mouse with 16000 DPI and customizable RGB lighting', 79.99, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop', 'accessories', 32, '["https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1563297007-0686b7003af7?w=500&h=500&fit=crop"]'),

('Phone Stand', 'Adjustable aluminum phone and tablet stand with 360° rotation', 24.99, 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500&h=500&fit=crop', 'accessories', 60, '["https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1606766256031-9fb80a74e6d4?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=500&h=500&fit=crop"]'),

-- Add more products to laptops category
('Ultrabook 13"', 'Lightweight 13-inch ultrabook with Intel i7 processor and 16GB RAM', 1299.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop', 'laptops', 8, '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?w=500&h=500&fit=crop"]'),

('Gaming Laptop', 'High-performance gaming laptop with RTX 4060 and 144Hz display', 1899.99, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop', 'laptops', 5, '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop"]'),

('Laptop Bag', 'Premium leather laptop messenger bag with padded compartments', 89.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop', 'laptops', 25, '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1615906036292-b999ba34dfbf?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1566479179817-0a1dab0d39bd?w=500&h=500&fit=crop"]');

-- Update existing products with additional images
UPDATE public.products SET images = '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1545127398-14699f92334b?w=500&h=500&fit=crop"]' WHERE name = 'Wireless Headphones';

UPDATE public.products SET images = '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=500&h=500&fit=crop"]' WHERE name = 'Bluetooth Speaker';

UPDATE public.products SET images = '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500&h=500&fit=crop"]' WHERE name = 'Smart Watch';

UPDATE public.products SET images = '["https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop"]' WHERE name = 'USB-C Hub';

UPDATE public.products SET images = '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=500&h=500&fit=crop", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop"]' WHERE name = 'Laptop Stand';