-- Simplified RLS policies to allow first-time family/baby creation
-- Run this in your Supabase SQL Editor

-- Make family creation simple - any authenticated user can create a family
DROP POLICY IF EXISTS "Users can create families" ON families;

CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Allow family creators to automatically become members
DROP POLICY IF EXISTS "Users can add themselves to families" ON family_members;

CREATE POLICY "Users can add themselves to families" ON family_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow any family member to add babies (simplified)
DROP POLICY IF EXISTS "Users can add babies" ON babies;

CREATE POLICY "Users can add babies" ON babies
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );