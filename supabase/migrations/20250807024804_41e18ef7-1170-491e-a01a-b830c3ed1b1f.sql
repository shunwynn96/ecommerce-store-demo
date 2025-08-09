-- Drop the existing update policy that prevents super admins from updating other users' profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new update policy that allows users to update their own profile OR super admins to update any profile
CREATE POLICY "Users can update their own profile or super admins can update any" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR 
  is_admin_user(auth.uid())
);