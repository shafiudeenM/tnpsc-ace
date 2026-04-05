
## Phase 1: Database Setup
Create all tables with RLS policies:
- `profiles` - user profiles with avatar, name, preferred language
- `questions` - question bank (bilingual EN/TA)
- `quiz_attempts` - quiz history
- `quiz_answers` - individual answers per attempt
- `user_question_progress` - SM-2 spaced repetition tracking
- `user_stats` - aggregated user statistics
- `user_weak_areas` - weak area tracking
- `spaced_repetition_log` - SR history log

## Phase 2: Authentication
- Login/Signup page with email + password
- Protected routes (redirect to login if not authenticated)
- Profile auto-creation trigger

## Phase 3: Wire Up Services
- Update `supabase` imports across all services to use `@/integrations/supabase/client`
- Remove old `src/lib/supabase.ts`, keep types only
- Connect QuizPage to real QuizEngineService
- Connect Dashboard to real user stats
- Connect Analytics to real quiz history

## Phase 4: Seed Sample Questions
- Insert ~20 sample TNPSC questions (bilingual) across subjects

## Phase 5: AI Assistant (Perplexity)
- Connect Perplexity for TNPSC-focused doubt solving via edge function
