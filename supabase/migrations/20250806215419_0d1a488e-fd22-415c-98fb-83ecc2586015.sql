-- Drop all existing policies that reference the role column first
DROP POLICY IF EXISTS "Admins can view all cart items for product management" ON public.cart_items;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;

-- Create enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the profiles table column by column
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN role TYPE public.app_role USING 
  CASE 
    WHEN role = 'admin' THEN 'admin'::public.app_role
    WHEN role = 'super_admin' THEN 'super_admin'::public.app_role
    ELSE 'user'::public.app_role
  END;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user'::public.app_role;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE((SELECT role IN ('admin', 'super_admin') FROM public.profiles WHERE user_id = user_uuid), false);
$$;

-- Recreate the policies using the security definer function
CREATE POLICY "Admins can view all cart items for product management" 
ON public.cart_items 
FOR SELECT 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
USING (public.is_admin_user(auth.uid()));

-- Update the handle_new_user function to assign super_admin to first user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing profiles to determine if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- If this is the first user (count is 0), make them super_admin, otherwise user
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    CASE WHEN user_count = 0 THEN 'super_admin'::public.app_role ELSE 'user'::public.app_role END
  );
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing users: make first created user super_admin, others user
WITH numbered_profiles AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.profiles
)
UPDATE public.profiles 
SET role = CASE 
  WHEN numbered_profiles.rn = 1 THEN 'super_admin'::public.app_role 
  ELSE 'user'::public.app_role 
END
FROM numbered_profiles 
WHERE public.profiles.id = numbered_profiles.id;