-- Update some products to have low stock (10 or less)
UPDATE products 
SET stock = 8 
WHERE name = 'Wireless Charging Pad';

UPDATE products 
SET stock = 5 
WHERE name = '4K Webcam';

UPDATE products 
SET stock = 3 
WHERE name = 'Smart Watch';

UPDATE products 
SET stock = 10 
WHERE name = 'Wireless Headphones';

UPDATE products 
SET stock = 2 
WHERE name = 'Mechanical Keyboard';