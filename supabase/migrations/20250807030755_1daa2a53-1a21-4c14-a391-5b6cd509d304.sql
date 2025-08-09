-- Insert 5 demo user profiles (only if they don't exist)
INSERT INTO public.profiles (user_id, email, role) 
SELECT gen_random_uuid(), email, 'user'::app_role
FROM (VALUES 
    ('demo1@example.com'),
    ('demo2@example.com'), 
    ('demo3@example.com'),
    ('demo4@example.com'),
    ('demo5@example.com')
) AS demo_emails(email)
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.email = demo_emails.email
);