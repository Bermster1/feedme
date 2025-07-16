-- Final targeted fix for RLS issue
-- The problem is likely that created_by needs to match auth.uid() exactly

-- First, let's make the family creation policy more explicit
DROP POLICY IF EXISTS "Users can create families" ON families;

CREATE POLICY "Users can create families" ON families
  FOR INSERT 
  WITH CHECK (created_by = auth.uid()::text OR created_by::uuid = auth.uid());

-- Also ensure the family_members policy works for self-addition
DROP POLICY IF EXISTS "Users can add themselves to families" ON family_members;

CREATE POLICY "Users can add themselves to families" ON family_members
  FOR INSERT 
  WITH CHECK (user_id = auth.uid()::text OR user_id::uuid = auth.uid());