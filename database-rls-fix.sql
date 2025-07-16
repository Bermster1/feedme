-- Fix RLS policies to allow first-time family creation
-- Run this in your Supabase SQL Editor

-- Fix families table policies to allow users to create their first family
DROP POLICY IF EXISTS "Users can create families" ON families;

CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (
    created_by = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM family_members 
      WHERE family_id = families.id
    )
  );

-- Fix family_members policies to allow self-addition to families they create
DROP POLICY IF EXISTS "Users can add themselves to families" ON family_members;

CREATE POLICY "Users can add themselves to families" ON family_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      family_id IN (
        SELECT id FROM families WHERE created_by = auth.uid()
      ) OR
      family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Fix babies table policies to allow creation by family creators
DROP POLICY IF EXISTS "Users can add babies" ON babies;

CREATE POLICY "Users can add babies" ON babies
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    ) OR
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );