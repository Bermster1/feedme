-- Fix for infinite recursion in family_members policies
-- Run this in your Supabase SQL Editor

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Users can add family members" ON family_members;
DROP POLICY IF EXISTS "Users can remove family members" ON family_members;

-- Recreate family_members policies without recursion
CREATE POLICY "Users can view family members" ON family_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add themselves to families" ON family_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove themselves from families" ON family_members
  FOR DELETE USING (user_id = auth.uid());

-- Also fix any circular references in other policies
DROP POLICY IF EXISTS "Users can view their families" ON families;
DROP POLICY IF EXISTS "Family members can update families" ON families;

CREATE POLICY "Users can view their families" ON families
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM family_members 
      WHERE family_id = families.id
    )
  );

CREATE POLICY "Family members can update families" ON families
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM family_members 
      WHERE family_id = families.id
    )
  );