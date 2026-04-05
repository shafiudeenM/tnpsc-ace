import { supabase } from "@/lib/supabase";
import type { Question, QuizAttempt } from "@/lib/supabase";
import { SpacedRepetitionService } from "./spacedRepetition";

export interface QuizSession {
  id: string;
  userId: string;
  questions: Question[];
  startTime: Date;
  currentQuestionIndex: number;
  answers: Map<string, { selectedAnswer: number | null; timeTaken: number; flagged: boolean }>;
  isCompleted: boolean;
}

export interface QuizConfig {
  type: "daily" | "subject" | "spaced_repetition" | "weak_areas" | "custom";
  subject?: string;
  questionCount?: number;
  includeNewQuestions?: boolean;
  includeReviewQuestions?: boolean;
}

export class QuizEngineService {
  /*
    Create a new quiz session
  */
  static async createQuizSession(userId: string, config: QuizConfig): Promise<QuizSession> {
    let questions: Question[] = [];

    if (config.type === "spaced_repetition") {
      // Get questions due for review
      const questionsForReview =
        await SpacedRepetitionService.getQuestionsForReviewBySubject(
          userId,
          config.subject || "",
          config.questionCount || 10
        );
      questions = questionsForReview
        .map((q: any) => q.questions)
        .filter(Boolean) as Question[];
    } else if (config.type === "subject") {
      // Get questions from specific subject
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("subject", config.subject)
        .limit(config.questionCount || 10);
      questions = (data || []) as Question[];
    } else if (config.type === "daily") {
      // Get mixed questions: spaced repetition + new questions
      const reviewQuestions =
        await SpacedRepetitionService.getQuestionsForReview(userId, 5);
      const newQuestions = await SpacedRepetitionService.getNewQuestions(userId, undefined, 5);

      const reviewQs = reviewQuestions
        .map((q: any) => q.questions)
        .filter(Boolean) as Question[];
      questions = [...reviewQs, ...newQuestions];
    }

    // Randomize question order
    questions = questions.sort(() => Math.random() - 0.5);

    return {
      id: crypto.randomUUID(),
      userId,
      questions,
      startTime: new Date(),
      currentQuestionIndex: 0,
      answers: new Map(),
      isCompleted: false,
    };
  }

  /*
    Record an answer in the quiz session
  */
  static recordAnswer(
    session: QuizSession,
    questionIndex: number,
    selectedAnswer: number | null,
    timeTaken: number,
    flagged: boolean = false
  ): void {
    if (questionIndex < 0 || questionIndex >= session.questions.length) {
      throw new Error("Invalid question index");
    }

    const question = session.questions[questionIndex];
    session.answers.set(question.id, {
      selectedAnswer,
      timeTaken,
      flagged,
    });
  }

  /*
    Save quiz attempt to database
  */
  static async saveQuizAttempt(session: QuizSession): Promise<QuizAttempt> {
    const endTime = new Date();
    const durationSeconds = Math.round(
      (endTime.getTime() - session.startTime.getTime()) / 1000
    );

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let totalTime = 0;

    const answers = session.answers;

    session.questions.forEach((question) => {
      const answer = answers.get(question.id);
      if (!answer) {
        skippedCount++;
      } else {
        totalTime += answer.timeTaken;
        if (answer.selectedAnswer === question.correct_answer) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    const accuracy = (correctCount / session.questions.length) * 100;
    const avgTimePerQuestion = totalTime / session.questions.length;

    // Create quiz attempt
    const { data: quizAttempt, error: quizError } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: session.userId,
        quiz_type: "custom",
        total_questions: session.questions.length,
        started_at: session.startTime.toISOString(),
        completed_at: endTime.toISOString(),
        duration_seconds: durationSeconds,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        skipped_answers: skippedCount,
        accuracy,
        avg_time_per_question: avgTimePerQuestion,
      })
      .select()
      .single();

    if (quizError) throw quizError;

    // Save individual answers
    for (const question of session.questions) {
      const answer = answers.get(question.id);

      if (answer) {
        const isCorrect = answer.selectedAnswer === question.correct_answer;

        // Insert answer record
        const { error: answerError } = await supabase.from("quiz_answers").insert({
          quiz_attempt_id: quizAttempt.id,
          user_id: session.userId,
          question_id: question.id,
          selected_answer: answer.selectedAnswer,
          is_correct: isCorrect,
          time_taken_seconds: answer.timeTaken,
          flagged: answer.flagged,
        });

        if (answerError) throw answerError;

        // Update spaced repetition progress
        try {
          await SpacedRepetitionService.updateQuestionProgress(
            session.userId,
            question.id,
            isCorrect
          );
        } catch (error) {
          console.error("Error updating spaced repetition:", error);
        }
      }
    }

    // Update user stats
    await this.updateUserStats(session.userId, quizAttempt);

    return quizAttempt as QuizAttempt;
  }

  /*
    Update user statistics after quiz
  */
  static async updateUserStats(userId: string, quizAttempt: QuizAttempt): Promise<void> {
    // Get current stats
    const { data: currentStats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    const stats = currentStats || {
      user_id: userId,
      total_quizzes_attempted: 0,
      total_questions_solved: 0,
      overall_accuracy: 0,
      current_streak: 0,
      longest_streak: 0,
      correct_answers_total: 0,
      wrong_answers_total: 0,
      subject_accuracy: {},
      last_quiz_date: null,
      last_quiz_accuracy: null,
    };

    // Update stats
    const newCorrectTotal = (stats.correct_answers_total || 0) + quizAttempt.correct_answers;
    const newWrongTotal = (stats.wrong_answers_total || 0) + quizAttempt.wrong_answers;
    const newTotalQuestions = newCorrectTotal + newWrongTotal;
    const newAccuracy = (newCorrectTotal / newTotalQuestions) * 100;

    // Update streak
    let newStreak = (stats.current_streak || 0) + 1;
    const longestStreak =
      newStreak > (stats.longest_streak || 0) ? newStreak : stats.longest_streak;

    const updateData = {
      user_id: userId,
      total_quizzes_attempted: (stats.total_quizzes_attempted || 0) + 1,
      total_questions_solved: (stats.total_questions_solved || 0) + quizAttempt.total_questions,
      overall_accuracy: Number(newAccuracy.toFixed(2)),
      current_streak: newStreak,
      longest_streak: longestStreak,
      correct_answers_total: newCorrectTotal,
      wrong_answers_total: newWrongTotal,
      avg_time_per_question: quizAttempt.avg_time_per_question,
      last_quiz_date: new Date().toISOString(),
      last_quiz_accuracy: quizAttempt.accuracy,
      subject_accuracy: stats.subject_accuracy || {},
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("user_stats")
      .upsert(updateData, { onConflict: "user_id" });

    if (error) throw error;
  }

  /*
    Get quiz history for user
  */
  static async getQuizHistory(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as QuizAttempt[];
  }

  /*
    Get quiz attempt details with answers
  */
  static async getQuizDetails(quizAttemptId: string) {
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("id", quizAttemptId)
      .single();

    const { data: answers } = await supabase
      .from("quiz_answers")
      .select("*, questions(*)")
      .eq("quiz_attempt_id", quizAttemptId);

    return { attempt, answers };
  }
}
