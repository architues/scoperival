-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  last_hash TEXT,
  last_checked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_url CHECK (url ~ '^https?://.+')
);

-- Create changes table
CREATE TABLE IF NOT EXISTS changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  old_hash TEXT NOT NULL,
  new_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS competitors_user_id_idx ON competitors(user_id);
CREATE INDEX IF NOT EXISTS changes_competitor_id_idx ON changes(competitor_id);

-- Enable RLS
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE changes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own competitors"
  ON competitors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own competitors"
  ON competitors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitors"
  ON competitors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitors"
  ON competitors FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view changes for their competitors"
  ON changes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM competitors
    WHERE competitors.id = changes.competitor_id
    AND competitors.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert changes for their competitors"
  ON changes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM competitors
    WHERE competitors.id = changes.competitor_id
    AND competitors.user_id = auth.uid()
  )); 