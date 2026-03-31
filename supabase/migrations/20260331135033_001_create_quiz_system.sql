/*
  # Complete Quiz System with Spaced Repetition, Mistake Tracking & Analytics
  
  1. New Tables
    - `questions` - All TNPSC questions with metadata
    - `user_question_progress` - Tracks spaced repetition interval for each question
    - `quiz_attempts` - Records of quiz sessions with timing and performance
    - `quiz_answers` - Individual answer records with timing and analysis
    - `mistake_categories` - Categorization of mistakes (careless, concept, time-pressure)
    - `user_weak_areas` - Computed weak areas based on mistake patterns
    - `user_stats` - Aggregated user statistics (updated after each quiz)
    - `spaced_repetition_log` - Historical log for SM-2 algorithm
  
  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Questions readable by all authenticated users
    
  3. Features
    - Spaced Repetition: SM-2 algorithm with interval scheduling
    - Mistake Tracking: Categorized mistakes with analysis
    - Time Tracking: Question timing, quiz duration, speed metrics
    - Analytics: Accuracy by subject, weak areas, learning curves
    - Performance Metrics: Questions per minute, improvement tracking
*/

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_ta text,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text,
  explanation_ta text,
  subject text NOT NULL,
  sub_topic text,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  source text,
  year integer,
  is_pyq boolean DEFAULT false,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user_question_progress table (tracks spaced repetition)
CREATE TABLE IF NOT EXISTS user_question_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- SM-2 Algorithm fields
  repetitions integer DEFAULT 0,
  ease_factor numeric DEFAULT 2.5,
  interval integer DEFAULT 1,
  next_review_date timestamptz DEFAULT now(),
  
  -- Tracking
  times_correct integer DEFAULT 0,
  times_wrong integer DEFAULT 0,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, question_id)
);

-- Create quiz_attempts table (session records)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Quiz metadata
  quiz_type text NOT NULL CHECK (quiz_type IN ('daily', 'subject', 'spaced_repetition', 'weak_areas', 'custom')),
  subject text,
  total_questions integer NOT NULL,
  
  -- Timing
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds integer,
  
  -- Performance
  correct_answers integer DEFAULT 0,
  wrong_answers integer DEFAULT 0,
  skipped_answers integer DEFAULT 0,
  accuracy numeric,
  
  -- Additional metrics
  avg_time_per_question numeric,
  
  created_at timestamptz DEFAULT now()
);

-- Create quiz_answers table (individual answer records)
CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Answer
  selected_answer integer,
  is_correct boolean,
  
  -- Timing analysis
  time_taken_seconds numeric NOT NULL,
  flagged boolean DEFAULT false,
  reviewed_before_submit boolean DEFAULT false,
  
  -- Mistake categorization
  mistake_type text CHECK (mistake_type IN ('careless', 'concept', 'time_pressure', 'none', null)),
  user_reported_reason text,
  
  created_at timestamptz DEFAULT now()
);

-- Create mistake_categories table
CREATE TABLE IF NOT EXISTS mistake_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Mistake analysis
  mistake_type text NOT NULL CHECK (mistake_type IN ('careless', 'concept', 'time_pressure')),
  frequency integer DEFAULT 1,
  subject text,
  
  last_made_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, question_id, mistake_type)
);

-- Create user_weak_areas table
CREATE TABLE IF NOT EXISTS user_weak_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  sub_topic text,
  
  -- Metrics
  accuracy_percentage numeric,
  mistake_count integer,
  correct_count integer,
  total_attempts integer,
  
  -- Difficulty distribution
  easy_accuracy numeric,
  medium_accuracy numeric,
  hard_accuracy numeric,
  
  needs_improvement boolean DEFAULT false,
  last_updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, subject, sub_topic)
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Overall stats
  total_quizzes_attempted integer DEFAULT 0,
  total_questions_solved integer DEFAULT 0,
  overall_accuracy numeric DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  
  -- Performance metrics
  avg_time_per_question numeric,
  correct_answers_total integer DEFAULT 0,
  wrong_answers_total integer DEFAULT 0,
  
  -- Subject-wise accuracy
  subject_accuracy jsonb DEFAULT '{}'::jsonb,
  
  -- Last activity
  last_quiz_date timestamptz,
  last_quiz_accuracy numeric,
  
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create spaced_repetition_log table for historical tracking
CREATE TABLE IF NOT EXISTS spaced_repetition_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- SM-2 parameters before update
  previous_ease_factor numeric,
  previous_interval integer,
  previous_repetitions integer,
  
  -- Quality of response (0-5, where 5 is perfect)
  response_quality integer NOT NULL CHECK (response_quality >= 0 AND response_quality <= 5),
  
  -- SM-2 parameters after update
  new_ease_factor numeric,
  new_interval integer,
  new_repetitions integer,
  next_review_date timestamptz,
  
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weak_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Questions: All authenticated users can read
CREATE POLICY "Authenticated users can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- user_question_progress: Users can only access their own
CREATE POLICY "Users can view own question progress"
  ON user_question_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own question progress"
  ON user_question_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own question progress"
  ON user_question_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- quiz_attempts: Users can only access their own
CREATE POLICY "Users can view own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts"
  ON quiz_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- quiz_answers: Users can only access their own
CREATE POLICY "Users can view own quiz answers"
  ON quiz_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz answers"
  ON quiz_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz answers"
  ON quiz_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- mistake_categories: Users can only access their own
CREATE POLICY "Users can view own mistake categories"
  ON mistake_categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create mistake categories"
  ON mistake_categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mistake categories"
  ON mistake_categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_weak_areas: Users can only access their own
CREATE POLICY "Users can view own weak areas"
  ON user_weak_areas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create weak areas"
  ON user_weak_areas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weak areas"
  ON user_weak_areas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_stats: Users can only access their own
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- spaced_repetition_log: Users can only access their own
CREATE POLICY "Users can view own SR log"
  ON spaced_repetition_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create SR log entries"
  ON spaced_repetition_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_question_progress_user_id ON user_question_progress(user_id);
CREATE INDEX idx_user_question_progress_next_review ON user_question_progress(next_review_date);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_created_at ON quiz_attempts(created_at);
CREATE INDEX idx_quiz_answers_quiz_attempt_id ON quiz_answers(quiz_attempt_id);
CREATE INDEX idx_quiz_answers_user_id ON quiz_answers(user_id);
CREATE INDEX idx_mistake_categories_user_id ON mistake_categories(user_id);
CREATE INDEX idx_user_weak_areas_user_id ON user_weak_areas(user_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
