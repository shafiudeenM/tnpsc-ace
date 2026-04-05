
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =================== PROFILES ===================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================== QUESTIONS ===================
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_ta TEXT NOT NULL DEFAULT '',
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  explanation_ta TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  sub_topic TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  source TEXT,
  year INTEGER,
  is_pyq BOOLEAN NOT NULL DEFAULT false,
  tags JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view questions" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_questions_subject ON public.questions(subject);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_questions_is_pyq ON public.questions(is_pyq);

-- =================== QUIZ ATTEMPTS ===================
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL DEFAULT 'custom',
  subject TEXT,
  total_questions INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  skipped_answers INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC,
  avg_time_per_question NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);

-- =================== QUIZ ANSWERS ===================
CREATE TABLE public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer INTEGER,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_taken_seconds NUMERIC NOT NULL DEFAULT 0,
  flagged BOOLEAN NOT NULL DEFAULT false,
  reviewed_before_submit BOOLEAN NOT NULL DEFAULT false,
  mistake_type TEXT,
  user_reported_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own answers" ON public.quiz_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own answers" ON public.quiz_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_quiz_answers_attempt ON public.quiz_answers(quiz_attempt_id);
CREATE INDEX idx_quiz_answers_user ON public.quiz_answers(user_id);

-- =================== USER QUESTION PROGRESS (Spaced Repetition) ===================
CREATE TABLE public.user_question_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  repetitions INTEGER NOT NULL DEFAULT 0,
  ease_factor NUMERIC NOT NULL DEFAULT 2.5,
  interval INTEGER NOT NULL DEFAULT 1,
  next_review_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  times_correct INTEGER NOT NULL DEFAULT 0,
  times_wrong INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);
ALTER TABLE public.user_question_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.user_question_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_question_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_question_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON public.user_question_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_progress_user ON public.user_question_progress(user_id);
CREATE INDEX idx_progress_review ON public.user_question_progress(next_review_date);

-- =================== USER STATS ===================
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_quizzes_attempted INTEGER NOT NULL DEFAULT 0,
  total_questions_solved INTEGER NOT NULL DEFAULT 0,
  overall_accuracy NUMERIC NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  avg_time_per_question NUMERIC,
  correct_answers_total INTEGER NOT NULL DEFAULT 0,
  wrong_answers_total INTEGER NOT NULL DEFAULT 0,
  subject_accuracy JSONB NOT NULL DEFAULT '{}',
  last_quiz_date TIMESTAMPTZ,
  last_quiz_accuracy NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =================== USER WEAK AREAS ===================
CREATE TABLE public.user_weak_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  sub_topic TEXT,
  accuracy_percentage NUMERIC,
  mistake_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  easy_accuracy NUMERIC,
  medium_accuracy NUMERIC,
  hard_accuracy NUMERIC,
  needs_improvement BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject, sub_topic)
);
ALTER TABLE public.user_weak_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own weak areas" ON public.user_weak_areas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weak areas" ON public.user_weak_areas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weak areas" ON public.user_weak_areas FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_weak_areas_updated_at BEFORE UPDATE ON public.user_weak_areas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =================== SPACED REPETITION LOG ===================
CREATE TABLE public.spaced_repetition_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  previous_ease_factor NUMERIC,
  previous_interval INTEGER,
  previous_repetitions INTEGER,
  response_quality INTEGER NOT NULL,
  new_ease_factor NUMERIC NOT NULL,
  new_interval INTEGER NOT NULL,
  new_repetitions INTEGER NOT NULL,
  next_review_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spaced_repetition_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own SR log" ON public.spaced_repetition_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own SR log" ON public.spaced_repetition_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sr_log_user ON public.spaced_repetition_log(user_id);
