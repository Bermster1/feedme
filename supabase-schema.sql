-- Create feedings table
CREATE TABLE feedings (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  ounces DECIMAL(4,2) NOT NULL,
  notes TEXT,
  gap TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE feedings ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (you can restrict this later with authentication)
CREATE POLICY "Allow all operations for feedings" ON feedings FOR ALL USING (true);

-- Create index for better performance
CREATE INDEX idx_feedings_date ON feedings(date);
CREATE INDEX idx_feedings_created_at ON feedings(created_at);

-- Optional: Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedings_updated_at BEFORE UPDATE ON feedings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();