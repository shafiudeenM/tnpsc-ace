import { supabase, UserQuestionProgress } from "@/lib/supabase";

/*
  SM-2 Spaced Repetition Algorithm Implementation

  The algorithm uses the following parameters:
  - Ease Factor (EF): Determines how quickly or slowly the interval grows (default 2.5)
  - Interval (I): Number of days until next review (default 1)
  - Repetitions (n): Total times the question has been reviewed

  Quality of response scale (0-5):
  - 0: Complete blackout, wrong answer
  - 1: Very blurry, severe hesitation
  - 2: Serious difficulty, need to think hard
  - 3: Difficulty, but could remember with some effort
  - 4: Correct answer, but with serious difficulty
  - 5: Perfect response
*/

const SM2_DEFAULT_EASE_FACTOR = 2.5;
const SM2_MIN_EASE_FACTOR = 1.3;

export interface SM2Parameters {
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: Date;
}

export class SpacedRepetitionService {
  /*
    Calculate SM-2 parameters based on response quality
    Returns new SM-2 parameters for the question
  */
  static calculateSM2(
    currentProgress: UserQuestionProgress | null,
    responseQuality: number // 0-5 scale
  ): SM2Parameters {
    // Default values for first attempt
    let repetitions = currentProgress?.repetitions || 0;
    let easeFactor = currentProgress?.ease_factor || SM2_DEFAULT_EASE_FACTOR;
    let interval = currentProgress?.interval || 1;

    // Ensure response quality is in valid range
    const quality = Math.max(0, Math.min(5, responseQuality));

    // SM-2 Algorithm
    if (quality < 3) {
      // Incorrect answer - reset
      repetitions = 0;
      interval = 1;
    } else {
      // Correct answer - increment
      repetitions += 1;

      // Calculate interval based on repetition count
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(SM2_MIN_EASE_FACTOR, easeFactor); // Min 1.3

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      ease_factor: Number(easeFactor.toFixed(2)),
      interval,
      repetitions,
      next_review_date: nextReviewDate,
    };
  }

  /*
    Get all questions due for review (spaced repetition)
    Returns questions where next_review_date <= today
  */
  static async getQuestionsForReview(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from("user_question_progress")
      .select(
        `
        *,
        questions:question_id(*)
      `
      )
      .eq("user_id", userId)
      .lte("next_review_date", new Date().toISOString())
      .order("next_review_date", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /*
    Get questions due for review by subject
  */
  static async getQuestionsForReviewBySubject(
    userId: string,
    subject: string,
    limit: number = 10
  ) {
    const { data, error } = await supabase
      .from("user_question_progress")
      .select(
        `
        *,
        questions:question_id(*)
      `
      )
      .eq("user_id", userId)
      .lte("next_review_date", new Date().toISOString())
      .eq("questions.subject", subject)
      .order("next_review_date", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /*
    Get all questions the user hasn't seen yet
  */
  static async getNewQuestions(userId: string, subject?: string, limit: number = 10) {
    let query = supabase.from("questions").select("*");

    if (subject) {
      query = query.eq("subject", subject);
    }

    const { data: allQuestions, error: questionsError } = await query;
    if (questionsError) throw questionsError;

    // Get questions the user has already attempted
    const { data: seenQuestions, error: seenError } = await supabase
      .from("user_question_progress")
      .select("question_id")
      .eq("user_id", userId);

    if (seenError) throw seenError;

    const seenIds = new Set(seenQuestions?.map((q) => q.question_id) || []);
    const newQuestions = allQuestions?.filter((q) => !seenIds.has(q.id)).slice(0, limit);

    return newQuestions || [];
  }

  /*
    Initialize progress for a new question
  */
  static async initializeQuestionProgress(userId: string, questionId: string) {
    const { data, error } = await supabase
      .from("user_question_progress")
      .upsert(
        {
          user_id: userId,
          question_id: questionId,
          repetitions: 0,
          ease_factor: SM2_DEFAULT_EASE_FACTOR,
          interval: 1,
          next_review_date: new Date().toISOString(),
          times_correct: 0,
          times_wrong: 0,
        },
        { onConflict: "user_id,question_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /*
    Update question progress after quiz answer
  */
  static async updateQuestionProgress(
    userId: string,
    questionId: string,
    isCorrect: boolean
  ) {
    // Get current progress
    const { data: currentProgress, error: fetchError } = await supabase
      .from("user_question_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    // Initialize if not exists
    const progress = currentProgress || (await this.initializeQuestionProgress(userId, questionId));

    // Calculate SM-2 parameters based on answer quality
    const responseQuality = isCorrect ? 5 : 0;
    const newParams = this.calculateSM2(progress, responseQuality);

    // Update progress
    const { error: updateError } = await supabase
      .from("user_question_progress")
      .update({
        repetitions: newParams.repetitions,
        ease_factor: newParams.ease_factor,
        interval: newParams.interval,
        next_review_date: newParams.next_review_date.toISOString(),
        times_correct: isCorrect ? (progress.times_correct || 0) + 1 : progress.times_correct,
        times_wrong: !isCorrect ? (progress.times_wrong || 0) + 1 : progress.times_wrong,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("question_id", questionId);

    if (updateError) throw updateError;

    // Log the update for historical tracking
    await supabase.from("spaced_repetition_log").insert({
      user_id: userId,
      question_id: questionId,
      previous_ease_factor: progress.ease_factor,
      previous_interval: progress.interval,
      previous_repetitions: progress.repetitions,
      response_quality: responseQuality,
      new_ease_factor: newParams.ease_factor,
      new_interval: newParams.interval,
      new_repetitions: newParams.repetitions,
      next_review_date: newParams.next_review_date.toISOString(),
    });
  }

  /*
    Get statistics for spaced repetition learning
  */
  static async getProgressStats(userId: string) {
    const { data, error } = await supabase
      .from("user_question_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    const stats = {
      totalQuestions: data?.length || 0,
      questionsToReview: data?.filter((q) => new Date(q.next_review_date) <= new Date()).length || 0,
      masteredQuestions: data?.filter((q) => q.repetitions >= 5).length || 0,
      learningQuestions: data?.filter((q) => q.repetitions > 0 && q.repetitions < 5).length || 0,
      newQuestions: data?.filter((q) => q.repetitions === 0).length || 0,
      averageEaseFactor: data?.length
        ? (data.reduce((sum, q) => sum + q.ease_factor, 0) / data.length).toFixed(2)
        : 0,
    };

    return stats;
  }
}
