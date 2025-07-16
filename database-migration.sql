-- Feed Me Database Migration
-- Run these commands in your Supabase SQL editor

-- 1. Create families table
CREATE TABLE IF NOT EXISTS families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create family_members table (many-to-many between users and families)
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- 3. Create babies table
CREATE TABLE IF NOT EXISTS babies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create sleep_sessions table
CREATE TABLE IF NOT EXISTS sleep_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL CHECK (type IN ('nap', 'nighttime')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create diaper_changes table
CREATE TABLE IF NOT EXISTS diaper_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pee', 'poo', 'both')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Update existing feedings table to add baby_id and user_id
ALTER TABLE feedings 
ADD COLUMN IF NOT EXISTS baby_id UUID REFERENCES babies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_babies_family_id ON babies(family_id);
CREATE INDEX IF NOT EXISTS idx_feedings_baby_id ON feedings(baby_id);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_baby_id ON sleep_sessions(baby_id);
CREATE INDEX IF NOT EXISTS idx_diaper_changes_baby_id ON diaper_changes(baby_id);

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaper_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedings ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies

-- Families: Users can only see families they belong to
CREATE POLICY "Users can view their families" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family members can update families" ON families
  FOR UPDATE USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Family Members: Users can see family memberships for families they belong to
CREATE POLICY "Users can view family members" ON family_members
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add family members" ON family_members
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove family members" ON family_members
  FOR DELETE USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Babies: Users can see babies from families they belong to
CREATE POLICY "Users can view family babies" ON babies
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add babies" ON babies
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update babies" ON babies
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Feedings: Users can see feedings for babies from their families
CREATE POLICY "Users can view family feedings" ON feedings
  FOR SELECT USING (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add feedings" ON feedings
  FOR INSERT WITH CHECK (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update feedings" ON feedings
  FOR UPDATE USING (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete feedings" ON feedings
  FOR DELETE USING (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

-- Sleep Sessions: Same pattern as feedings
CREATE POLICY "Users can view family sleep sessions" ON sleep_sessions
  FOR SELECT USING (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add sleep sessions" ON sleep_sessions
  FOR INSERT WITH CHECK (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sleep sessions" ON sleep_sessions
  FOR UPDATE USING (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sleep sessions" ON sleep_sessions
  FOR DELETE USING (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

-- Diaper Changes: Same pattern as feedings
CREATE POLICY "Users can view family diaper changes" ON diaper_changes
  FOR SELECT USING (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add diaper changes" ON diaper_changes
  FOR INSERT WITH CHECK (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update diaper changes" ON diaper_changes
  FOR UPDATE USING (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete diaper changes" ON diaper_changes
  FOR DELETE USING (
    baby_id IN (
      SELECT b.id FROM babies b
      JOIN family_members fm ON b.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

-- 10. Grant permissions to authenticated users
GRANT ALL ON families TO authenticated;
GRANT ALL ON family_members TO authenticated;
GRANT ALL ON babies TO authenticated;
GRANT ALL ON sleep_sessions TO authenticated;
GRANT ALL ON diaper_changes TO authenticated;
GRANT ALL ON feedings TO authenticated;