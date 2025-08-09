-- Update the user's role to admin so they can manage products
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = '7011d12c-c547-44e1-8663-d78f9e440aa7';