-- Add policy to allow super admins to view all profiles
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'super_admin'
  )
);