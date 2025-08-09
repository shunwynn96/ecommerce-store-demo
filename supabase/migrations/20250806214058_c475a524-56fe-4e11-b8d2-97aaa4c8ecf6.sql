-- Create an enum for the three role types
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');

-- Remove the default constraint and update the column type
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN role TYPE public.app_role USING role::public.app_role;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user'::public.app_role;

-- Update the handle_new_user function to assign super_admin to first user, user to others
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
    CASE WHEN user_count = 0 THEN 'super_admin'::app_role ELSE 'user'::app_role END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing users: keep the first created user as super_admin, set others to user
WITH numbered_profiles AS (
  SELECT id, user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.profiles
)
UPDATE public.profiles 
SET role = CASE 
  WHEN numbered_profiles.rn = 1 THEN 'super_admin'::app_role 
  ELSE 'user'::app_role 
END
FROM numbered_profiles 
WHERE public.profiles.id = numbered_profiles.id;