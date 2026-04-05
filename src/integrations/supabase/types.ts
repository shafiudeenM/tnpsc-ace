export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string
          difficulty: string
          explanation: string
          explanation_ta: string
          id: string
          is_pyq: boolean
          options: Json
          question_ta: string
          question_text: string
          source: string | null
          sub_topic: string
          subject: string
          tags: Json
          updated_at: string
          year: number | null
        }
        Insert: {
          correct_answer: number
          created_at?: string
          difficulty?: string
          explanation?: string
          explanation_ta?: string
          id?: string
          is_pyq?: boolean
          options?: Json
          question_ta?: string
          question_text: string
          source?: string | null
          sub_topic?: string
          subject: string
          tags?: Json
          updated_at?: string
          year?: number | null
        }
        Update: {
          correct_answer?: number
          created_at?: string
          difficulty?: string
          explanation?: string
          explanation_ta?: string
          id?: string
          is_pyq?: boolean
          options?: Json
          question_ta?: string
          question_text?: string
          source?: string | null
          sub_topic?: string
          subject?: string
          tags?: Json
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          created_at: string
          flagged: boolean
          id: string
          is_correct: boolean
          mistake_type: string | null
          question_id: string
          quiz_attempt_id: string
          reviewed_before_submit: boolean
          selected_answer: number | null
          time_taken_seconds: number
          user_id: string
          user_reported_reason: string | null
        }
        Insert: {
          created_at?: string
          flagged?: boolean
          id?: string
          is_correct?: boolean
          mistake_type?: string | null
          question_id: string
          quiz_attempt_id: string
          reviewed_before_submit?: boolean
          selected_answer?: number | null
          time_taken_seconds?: number
          user_id: string
          user_reported_reason?: string | null
        }
        Update: {
          created_at?: string
          flagged?: boolean
          id?: string
          is_correct?: boolean
          mistake_type?: string | null
          question_id?: string
          quiz_attempt_id?: string
          reviewed_before_submit?: boolean
          selected_answer?: number | null
          time_taken_seconds?: number
          user_id?: string
          user_reported_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_quiz_attempt_id_fkey"
            columns: ["quiz_attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          accuracy: number | null
          avg_time_per_question: number | null
          completed_at: string | null
          correct_answers: number
          created_at: string
          duration_seconds: number | null
          id: string
          quiz_type: string
          skipped_answers: number
          started_at: string
          subject: string | null
          total_questions: number
          user_id: string
          wrong_answers: number
        }
        Insert: {
          accuracy?: number | null
          avg_time_per_question?: number | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          quiz_type?: string
          skipped_answers?: number
          started_at?: string
          subject?: string | null
          total_questions?: number
          user_id: string
          wrong_answers?: number
        }
        Update: {
          accuracy?: number | null
          avg_time_per_question?: number | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          quiz_type?: string
          skipped_answers?: number
          started_at?: string
          subject?: string | null
          total_questions?: number
          user_id?: string
          wrong_answers?: number
        }
        Relationships: []
      }
      spaced_repetition_log: {
        Row: {
          created_at: string
          id: string
          new_ease_factor: number
          new_interval: number
          new_repetitions: number
          next_review_date: string
          previous_ease_factor: number | null
          previous_interval: number | null
          previous_repetitions: number | null
          question_id: string
          response_quality: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_ease_factor: number
          new_interval: number
          new_repetitions: number
          next_review_date: string
          previous_ease_factor?: number | null
          previous_interval?: number | null
          previous_repetitions?: number | null
          question_id: string
          response_quality: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_ease_factor?: number
          new_interval?: number
          new_repetitions?: number
          next_review_date?: string
          previous_ease_factor?: number | null
          previous_interval?: number | null
          previous_repetitions?: number | null
          question_id?: string
          response_quality?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaced_repetition_log_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_progress: {
        Row: {
          created_at: string
          ease_factor: number
          id: string
          interval: number
          last_reviewed_at: string | null
          next_review_date: string
          question_id: string
          repetitions: number
          times_correct: number
          times_wrong: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval?: number
          last_reviewed_at?: string | null
          next_review_date?: string
          question_id: string
          repetitions?: number
          times_correct?: number
          times_wrong?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease_factor?: number
          id?: string
          interval?: number
          last_reviewed_at?: string | null
          next_review_date?: string
          question_id?: string
          repetitions?: number
          times_correct?: number
          times_wrong?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          avg_time_per_question: number | null
          correct_answers_total: number
          created_at: string
          current_streak: number
          id: string
          last_quiz_accuracy: number | null
          last_quiz_date: string | null
          longest_streak: number
          overall_accuracy: number
          subject_accuracy: Json
          total_questions_solved: number
          total_quizzes_attempted: number
          updated_at: string
          user_id: string
          wrong_answers_total: number
        }
        Insert: {
          avg_time_per_question?: number | null
          correct_answers_total?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_quiz_accuracy?: number | null
          last_quiz_date?: string | null
          longest_streak?: number
          overall_accuracy?: number
          subject_accuracy?: Json
          total_questions_solved?: number
          total_quizzes_attempted?: number
          updated_at?: string
          user_id: string
          wrong_answers_total?: number
        }
        Update: {
          avg_time_per_question?: number | null
          correct_answers_total?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_quiz_accuracy?: number | null
          last_quiz_date?: string | null
          longest_streak?: number
          overall_accuracy?: number
          subject_accuracy?: Json
          total_questions_solved?: number
          total_quizzes_attempted?: number
          updated_at?: string
          user_id?: string
          wrong_answers_total?: number
        }
        Relationships: []
      }
      user_weak_areas: {
        Row: {
          accuracy_percentage: number | null
          correct_count: number
          created_at: string
          easy_accuracy: number | null
          hard_accuracy: number | null
          id: string
          medium_accuracy: number | null
          mistake_count: number
          needs_improvement: boolean
          sub_topic: string | null
          subject: string
          total_attempts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          correct_count?: number
          created_at?: string
          easy_accuracy?: number | null
          hard_accuracy?: number | null
          id?: string
          medium_accuracy?: number | null
          mistake_count?: number
          needs_improvement?: boolean
          sub_topic?: string | null
          subject: string
          total_attempts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          correct_count?: number
          created_at?: string
          easy_accuracy?: number | null
          hard_accuracy?: number | null
          id?: string
          medium_accuracy?: number | null
          mistake_count?: number
          needs_improvement?: boolean
          sub_topic?: string | null
          subject?: string
          total_attempts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
