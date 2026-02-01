-- ClassPulse: 3-Level Voting System Migration
-- Run this in Supabase SQL Editor

-- Step 1: Add vote_type column to votes table
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS vote_type TEXT CHECK (vote_type IN ('bad', 'understanding', 'good'));

-- Step 2: Migrate existing votes to 'good' type
UPDATE votes 
SET vote_type = 'good' 
WHERE vote_type IS NULL;

-- Step 3: Add new vote count columns to topics
ALTER TABLE topics
ADD COLUMN IF NOT EXISTS votes_bad INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_understanding INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_good INTEGER DEFAULT 0;

-- Step 4: Migrate existing votes data
-- Move old 'votes' count to 'votes_good'
UPDATE topics 
SET votes_good = votes 
WHERE votes > 0 AND votes_good = 0;

-- Step 5: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_votes_type ON votes(vote_type);

-- Verify the changes
SELECT * FROM topics LIMIT 5;
SELECT * FROM votes LIMIT 5;
