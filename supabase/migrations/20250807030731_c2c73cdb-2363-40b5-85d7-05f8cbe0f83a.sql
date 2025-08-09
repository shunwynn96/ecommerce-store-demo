-- Create 5 demo user accounts with simple passwords
-- These will be inserted directly into the auth.users table with the profiles

-- First, let's create the demo users with simple passwords
-- Note: In Supabase, we need to use the auth.users table for actual authentication

-- Insert demo users into auth.users table and corresponding profiles
DO $$
DECLARE
    demo_user_1_id uuid := gen_random_uuid();
    demo_user_2_id uuid := gen_random_uuid();
    demo_user_3_id uuid := gen_random_uuid();
    demo_user_4_id uuid := gen_random_uuid();
    demo_user_5_id uuid := gen_random_uuid();
BEGIN
    -- Insert into auth.users (this creates the authentication records)
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change_confirm_status,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES 
    (demo_user_1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo1@example.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '', '', '', 0, '{"provider":"email","providers":["email"]}', '{}'),
    (demo_user_2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo2@example.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '', '', '', 0, '{"provider":"email","providers":["email"]}', '{}'),
    (demo_user_3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo3@example.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '', '', '', 0, '{"provider":"email","providers":["email"]}', '{}'),
    (demo_user_4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo4@example.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '', '', '', 0, '{"provider":"email","providers":["email"]}', '{}'),
    (demo_user_5_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo5@example.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '', '', '', 0, '{"provider":"email","providers":["email"]}', '{}');

    -- Insert corresponding profiles
    INSERT INTO public.profiles (user_id, email, role) VALUES
    (demo_user_1_id, 'demo1@example.com', 'user'),
    (demo_user_2_id, 'demo2@example.com', 'user'),
    (demo_user_3_id, 'demo3@example.com', 'user'),
    (demo_user_4_id, 'demo4@example.com', 'user'),
    (demo_user_5_id, 'demo5@example.com', 'user');
END $$;