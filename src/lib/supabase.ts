import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Question = {
  id: string;
  question_text: string;
  question_ta: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  explanation_ta: string;
  subject: string;
  sub_topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  source?: string;
  year?: number;
  is_pyq: boolean;
  tags: string[];
};

export type UserQuestionProgress = {
  id: string;
  user_id: string;
  question_id: string;
  repetitions: number;
  ease_factor: number;
  interval: number;
  next_review_date: string;
  times_correct: number;
  times_wrong: number;
  last_reviewed_at: string | null;
};

export type QuizAttempt = {
  id: string;
  user_id: string;
  quiz_type: "daily" | "subject" | "spaced_repetition" | "weak_areas" | "custom";
  subject?: string;
  total_questions: number;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  correct_answers: number;
  wrong_answers: number;
  skipped_answers: number;
  accuracy?: number;
  avg_time_per_question?: number;
};

export type QuizAnswer = {
  id: string;
  quiz_attempt_id: string;
  user_id: string;
  question_id: string;
  selected_answer?: number;
  is_correct: boolean;
  time_taken_seconds: number;
  flagged: boolean;
  reviewed_before_submit: boolean;
  mistake_type?: "careless" | "concept" | "time_pressure";
  user_reported_reason?: string;
};

export type UserStats = {
  id: string;
  user_id: string;
  total_quizzes_attempted: number;
  total_questions_solved: number;
  overall_accuracy: number;
  current_streak: number;
  longest_streak: number;
  avg_time_per_question?: number;
  correct_answers_total: number;
  wrong_answers_total: number;
  subject_accuracy: Record<string, number>;
  last_quiz_date?: string;
  last_quiz_accuracy?: number;
};

export type UserWeakArea = {
  id: string;
  user_id: string;
  subject: string;
  sub_topic?: string;
  accuracy_percentage?: number;
  mistake_count: number;
  correct_count: number;
  total_attempts: number;
  easy_accuracy?: number;
  medium_accuracy?: number;
  hard_accuracy?: number;
  needs_improvement: boolean;
};
