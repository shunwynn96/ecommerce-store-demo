-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Update the existing policy to allow super admins using the security definer function
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policies that use the security definer function to avoid recursion
CREATE POLICY "Users can view their own profile or super admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  is_admin_user(auth.uid())
);