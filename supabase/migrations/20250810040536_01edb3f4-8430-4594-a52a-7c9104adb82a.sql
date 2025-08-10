-- Drop all existing policies on profiles table to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile or super admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or super admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or super admins can update a" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create new policy that allows public viewing for demo purposes
CREATE POLICY "Allow public viewing for demo mode" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Create restrictive update policy
CREATE POLICY "Restrict updates to authenticated users" 
ON public.profiles 
FOR UPDATE 
USING ((auth.uid() = user_id) OR is_admin_user(auth.uid()));

-- Create restrictive insert policy  
CREATE POLICY "Restrict inserts to authenticated users" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);