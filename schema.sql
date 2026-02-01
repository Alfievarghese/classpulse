-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(4) UNIQUE NOT NULL,
  subject VARCHAR(100) NOT NULL,
  teacher_name VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  votes_bad INTEGER DEFAULT 0,
  votes_understanding INTEGER DEFAULT 0,
  votes_good INTEGER DEFAULT 0,
  created_by_student BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  session_token VARCHAR(100) NOT NULL,
  vote_type VARCHAR(20) NOT NULL, -- 'bad', 'understanding', 'good'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, session_token)
);

-- Indexes
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_sessions_active ON sessions(active);
CREATE INDEX idx_topics_session_id ON topics(session_id);
CREATE INDEX idx_votes_topic_id ON votes(topic_id);
CREATE INDEX idx_votes_session_token ON votes(session_token);

-- Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active sessions" ON sessions FOR SELECT USING (active = true);
CREATE POLICY "Anyone can create sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON sessions FOR UPDATE USING (true);

CREATE POLICY "Anyone can read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Anyone can insert topics" ON topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update topics" ON topics FOR UPDATE USING (true);

CREATE POLICY "Anyone can read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert votes" ON votes FOR INSERT WITH CHECK (true);
