-- Allow public viewing of profiles for demo mode while maintaining security for operations
DROP POLICY IF EXISTS "Users can view their own profile or super admins can view all" ON public.profiles;

-- Create new policy that allows public viewing (for demo) but restricts operations
CREATE POLICY "Profiles are viewable by everyone for demo purposes" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Keep the update policy restrictive
CREATE POLICY "Users can update their own profile or super admins can update all" 
ON public.profiles 
FOR UPDATE 
USING ((auth.uid() = user_id) OR is_admin_user(auth.uid()));

-- Keep the insert policy restrictive  
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);