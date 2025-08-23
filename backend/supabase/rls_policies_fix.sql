-- Fix for profile creation during signup
-- Run this in Supabase SQL Editor to fix the RLS policy issue

-- Drop the existing insert policy for profiles
DROP POLICY IF EXISTS "insert own profile" ON profiles;

-- Create a new policy that allows profile creation during signup
-- This allows inserting a profile when the user_id matches the authenticated user
CREATE POLICY "allow profile creation" ON profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

-- Alternative: If the above doesn't work, temporarily disable RLS for profiles table
-- and re-enable after testing (NOT recommended for production)
-- 
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- 
-- After testing, re-enable with:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 