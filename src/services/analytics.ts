import { supabase, UserStats } from "@/lib/supabase";

export interface PerformanceMetrics {
  accuracy: number;
  speed: number; // questions per minute
  consistency: number; // std deviation of scores (lower = more consistent)
  improvement: number; // percentage improvement over time
  questionsCovered: number;
}

export interface SubjectPerformance {
  subject: string;
  accuracy: number;
  questionsAttempted: number;
  correctAnswers: number;
  wrongAnswers: number;
  avgTimePerQuestion: number;
  trend: "improving" | "declining" | "stable";
}

export interface SpeedAnalysis {
  avgTimePerQuestion: number;
  fastestQuestion: number; // seconds
  slowestQuestion: number; // seconds
  questionsUnder30Seconds: number;
  questionsOver2Minutes: number;
  qpm: number; // questions per minute
}

export interface AccuracyTrend {
  date: string;
  accuracy: number;
  questionsAttempted: number;
}

export interface LearningInsight {
  type:
    | "improvement"
    | "declining"
    | "streak"
    | "weakness"
    | "strength"
    | "speed_issue"
    | "concept_gap";
  title: string;
  description: string;
  actionItems: string[];
  priority: "low" | "medium" | "high";
}

export class AnalyticsService {
  /*
    Get overall performance metrics
  */
  static async getPerformanceMetrics(userId: string): Promise<PerformanceMetrics> {
    // Get user stats
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get quiz attempts for trend analysis
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("accuracy, duration_seconds, total_questions")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    const accuracy = stats?.overall_accuracy || 0;

    // Calculate speed (questions per minute)
    let speed = 0;
    if (stats?.avg_time_per_question && stats.avg_time_per_question > 0) {
      speed = 60 / (stats.avg_time_per_question || 1); // minutes to seconds
    }

    // Calculate consistency
    let consistency = 0;
    if (attempts && attempts.length > 1) {
      const accuracies = attempts.map((a) => a.accuracy || 0);
      const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      const variance =
        accuracies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / accuracies.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(0, 100 - stdDev); // Higher is more consistent
    }

    // Calculate improvement
    let improvement = 0;
    if (attempts && attempts.length >= 2) {
      const recentAccuracies = attempts.slice(-5).map((a) => a.accuracy || 0);
      const olderAccuracies = attempts.slice(0, Math.max(1, attempts.length - 5));
      const recentAvg = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
      const olderAvg = olderAccuracies.length
        ? olderAccuracies.reduce(
            (a, b) => a + (b.accuracy || 0),
            0
          ) / olderAccuracies.length
        : recentAvg;
      improvement = ((recentAvg - olderAvg) / olderAvg) * 100;
    }

    return {
      accuracy: Number(accuracy.toFixed(2)),
      speed: Number(speed.toFixed(2)),
      consistency: Number(consistency.toFixed(2)),
      improvement: Number(improvement.toFixed(2)),
      questionsCovered: stats?.total_questions_solved || 0,
    };
  }

  /*
    Get subject-wise performance breakdown
  */
  static async getSubjectPerformance(userId: string): Promise<SubjectPerformance[]> {
    const { data: answers } = await supabase
      .from("quiz_answers")
      .select(
        `
        is_correct,
        time_taken_seconds,
        questions(subject)
      `
      )
      .eq("user_id", userId);

    if (!answers || answers.length === 0) {
      return [];
    }

    // Group by subject
    const subjectStats: Record<
      string,
      {
        subject: string;
        correct: number;
        wrong: number;
        totalTime: number;
        questionCount: number;
      }
    > = {};

    answers.forEach((answer: any) => {
      const subject = answer.questions.subject;

      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          subject,
          correct: 0,
          wrong: 0,
          totalTime: 0,
          questionCount: 0,
        };
      }

      if (answer.is_correct) {
        subjectStats[subject].correct++;
      } else {
        subjectStats[subject].wrong++;
      }

      subjectStats[subject].totalTime += answer.time_taken_seconds;
      subjectStats[subject].questionCount++;
    });

    // Calculate metrics and determine trends
    const performance: SubjectPerformance[] = Object.values(subjectStats).map((stats) => {
      const totalQuestions = stats.correct + stats.wrong;
      const accuracy = (stats.correct / totalQuestions) * 100;
      const avgTime = stats.totalTime / stats.questionCount;

      // Determine trend (would require historical data for accuracy)
      let trend: "improving" | "declining" | "stable" = "stable";
      // TODO: Compare with previous period's accuracy

      return {
        subject: stats.subject,
        accuracy: Number(accuracy.toFixed(2)),
        questionsAttempted: totalQuestions,
        correctAnswers: stats.correct,
        wrongAnswers: stats.wrong,
        avgTimePerQuestion: Number(avgTime.toFixed(2)),
        trend,
      };
    });

    return performance.sort((a, b) => a.accuracy - b.accuracy);
  }

  /*
    Get speed analysis
  */
  static async getSpeedAnalysis(userId: string): Promise<SpeedAnalysis> {
    const { data: answers } = await supabase
      .from("quiz_answers")
      .select("time_taken_seconds")
      .eq("user_id", userId);

    if (!answers || answers.length === 0) {
      return {
        avgTimePerQuestion: 0,
        fastestQuestion: 0,
        slowestQuestion: 0,
        questionsUnder30Seconds: 0,
        questionsOver2Minutes: 0,
        qpm: 0,
      };
    }

    const times = answers.map((a) => a.time_taken_seconds);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const fastestQuestion = Math.min(...times);
    const slowestQuestion = Math.max(...times);

    const questionsUnder30Seconds = times.filter((t) => t < 30).length;
    const questionsOver2Minutes = times.filter((t) => t > 120).length;
    const qpm = 60 / avgTime; // questions per minute

    return {
      avgTimePerQuestion: Number(avgTime.toFixed(2)),
      fastestQuestion: Number(fastestQuestion.toFixed(2)),
      slowestQuestion: Number(slowestQuestion.toFixed(2)),
      questionsUnder30Seconds,
      questionsOver2Minutes,
      qpm: Number(qpm.toFixed(2)),
    };
  }

  /*
    Get accuracy trend over time
  */
  static async getAccuracyTrend(userId: string, days: number = 30): Promise<AccuracyTrend[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("accuracy, completed_at, total_questions")
      .eq("user_id", userId)
      .gte("completed_at", fromDate.toISOString())
      .order("completed_at", { ascending: true });

    if (!attempts) {
      return [];
    }

    // Group by date
    const trendMap: Record<string, { accuracy: number; count: number; total: number }> = {};

    attempts.forEach((attempt: any) => {
      const date = new Date(attempt.completed_at).toLocaleDateString();

      if (!trendMap[date]) {
        trendMap[date] = { accuracy: 0, count: 0, total: 0 };
      }

      trendMap[date].accuracy += attempt.accuracy || 0;
      trendMap[date].count++;
      trendMap[date].total += attempt.total_questions;
    });

    return Object.entries(trendMap).map(([date, stats]) => ({
      date,
      accuracy: Number((stats.accuracy / stats.count).toFixed(2)),
      questionsAttempted: stats.total,
    }));
  }

  /*
    Generate intelligent learning insights
  */
  static async generateInsights(userId: string): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Get metrics
    const metrics = await this.getPerformanceMetrics(userId);
    const subjects = await this.getSubjectPerformance(userId);
    const speed = await this.getSpeedAnalysis(userId);
    const trend = await this.getAccuracyTrend(userId, 7);

    // Insight 1: Overall improvement
    if (metrics.improvement > 10) {
      insights.push({
        type: "improvement",
        title: "You're improving rapidly!",
        description: `Your accuracy has improved by ${Math.round(metrics.improvement)}% over the last week. Keep up this momentum!`,
        actionItems: [
          "Continue practicing daily",
          "Focus on weak areas identified",
          "Maintain consistent study schedule",
        ],
        priority: "low",
      });
    } else if (metrics.improvement < -10) {
      insights.push({
        type: "declining",
        title: "Your performance is declining",
        description: `Your accuracy has decreased by ${Math.round(Math.abs(metrics.improvement))}%. Consider reviewing fundamentals.`,
        actionItems: [
          "Review concept-based questions",
          "Take breaks if stressed",
          "Revise syllabus notes",
        ],
        priority: "high",
      });
    }

    // Insight 2: Weak subjects
    const weakSubjects = subjects.filter((s) => s.accuracy < 50);
    if (weakSubjects.length > 0) {
      insights.push({
        type: "weakness",
        title: `Critical weakness in ${weakSubjects[0].subject}`,
        description: `Your accuracy in ${weakSubjects[0].subject} is only ${weakSubjects[0].accuracy}%. This needs immediate attention.`,
        actionItems: [
          `Focus on ${weakSubjects[0].subject} questions`,
          "Review concept videos",
          "Practice 20+ questions daily in this subject",
        ],
        priority: "high",
      });
    }

    // Insight 3: Speed issues
    if (speed.avgTimePerQuestion > 180) {
      insights.push({
        type: "speed_issue",
        title: "Your speed needs improvement",
        description: `You're averaging ${speed.avgTimePerQuestion}s per question. TNPSC exams require faster speed.`,
        actionItems: [
          "Practice with timer for speed",
          "Skip difficult questions first",
          "Work on mental calculation speed",
        ],
        priority: "medium",
      });
    }

    // Insight 4: Streak milestone
    const { data: stats } = await supabase
      .from("user_stats")
      .select("current_streak")
      .eq("user_id", userId)
      .single();

    if (stats?.current_streak && stats.current_streak % 7 === 0) {
      insights.push({
        type: "streak",
        title: `Amazing! ${stats.current_streak} day streak!`,
        description: "Your consistency is impressive. This dedication will pay off!",
        actionItems: ["Keep the streak going!", "Share your progress", "Stay motivated"],
        priority: "low",
      });
    }

    return insights;
  }

  /*
    Get personalized study recommendations
  */
  static async getRecommendations(userId: string): Promise<string[]> {
    const recommendations: string[] = [];

    const metrics = await this.getPerformanceMetrics(userId);
    const subjects = await this.getSubjectPerformance(userId);
    const { data: weakAreas } = await supabase
      .from("user_weak_areas")
      .select("*")
      .eq("user_id", userId)
      .eq("needs_improvement", true)
      .limit(3);

    // Speed-based recommendations
    if (metrics.speed < 0.5) {
      recommendations.push("📊 Improve question solving speed - aim for 1-2 questions per minute");
    }

    // Accuracy-based recommendations
    if (metrics.accuracy < 50) {
      recommendations.push("📚 Review core concepts - focus on fundamental understanding");
    } else if (metrics.accuracy < 65) {
      recommendations.push("🎯 Target 65%+ accuracy - practice more questions in weak areas");
    } else if (metrics.accuracy < 80) {
      recommendations.push("⚡ Push towards 80%+ - refine your strategy and speed");
    }

    // Subject-based recommendations
    const worstSubject = subjects[0];
    if (worstSubject && worstSubject.accuracy < 60) {
      recommendations.push(
        `🔴 Priority: Improve ${worstSubject.subject} (currently ${worstSubject.accuracy}%)`
      );
    }

    // Weak area recommendations
    if (weakAreas && weakAreas.length > 0) {
      weakAreas.forEach((area: any) => {
        recommendations.push(
          `📍 Focus on ${area.sub_topic || area.subject} - your weakest area`
        );
      });
    }

    // Consistency recommendations
    if (metrics.consistency < 50) {
      recommendations.push("⚙️ Improve consistency - your performance varies a lot between quizzes");
    }

    return recommendations;
  }
}
