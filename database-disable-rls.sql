-- Temporarily disable RLS to allow initial setup
-- Run this in your Supabase SQL Editor

-- Disable RLS on tables temporarily
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE babies DISABLE ROW LEVEL SECURITY;

-- We'll re-enable with better policies after setup works