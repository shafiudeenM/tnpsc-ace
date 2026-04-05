
CREATE TABLE public.mistake_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  mistake_type TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  last_made_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id, mistake_type)
);
ALTER TABLE public.mistake_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mistakes" ON public.mistake_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mistakes" ON public.mistake_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mistakes" ON public.mistake_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_mistake_categories_user ON public.mistake_categories(user_id);
