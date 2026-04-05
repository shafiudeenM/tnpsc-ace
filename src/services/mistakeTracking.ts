import { supabase, UserWeakArea } from "@/lib/supabase";

export type MistakeType = "careless" | "concept" | "time_pressure";

export interface MistakePattern {
  mistakeType: MistakeType;
  frequency: number;
  subjects: string[];
  affectedTopics: string[];
}

export interface WeakAreaAnalysis {
  subject: string;
  topic?: string;
  accuracy: number;
  mistakePatterns: MistakePattern[];
  recommendations: string[];
  priorityLevel: "low" | "medium" | "high" | "critical";
}

export class MistakeTrackingService {
  /*
    Categorize a mistake based on response characteristics
  */
  static categorizeMistake(
    timeTaken: number,
    avgTimeForQuestion: number,
    difficulty: string,
    wasReviewedBeforeSubmit: boolean,
    userReportedReason?: string
  ): MistakeType {
    // User explicitly reported reason
    if (userReportedReason) {
      const reason = userReportedReason.toLowerCase();
      if (reason.includes("time") || reason.includes("rushed")) {
        return "time_pressure";
      }
      if (reason.includes("concept") || reason.includes("didn't know")) {
        return "concept";
      }
      if (reason.includes("careless") || reason.includes("silly")) {
        return "careless";
      }
    }

    // Time-based categorization
    const timeRatio = timeTaken / avgTimeForQuestion;

    if (timeRatio < 0.3 && wasReviewedBeforeSubmit === false) {
      return "careless"; // Too fast, likely guessed
    }

    if (timeRatio > 2.5 || (difficulty === "Hard" && timeRatio > 1.8)) {
      return "time_pressure"; // Took too long, time pressure likely
    }

    // Default to concept-based mistake
    return "concept";
  }

  /*
    Record a mistake for analysis
  */
  static async recordMistake(
    userId: string,
    questionId: string,
    subject: string,
    mistakeType: MistakeType,
    userReportedReason?: string
  ): Promise<void> {
    const { error } = await supabase.from("mistake_categories").upsert(
      {
        user_id: userId,
        question_id: questionId,
        subject,
        mistake_type: mistakeType,
        frequency: 1,
        last_made_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,question_id,mistake_type",
        ignoreDuplicates: false,
      }
    );

    if (error && error.code !== "PGRST204") {
      // Update if exists
      await supabase
        .from("mistake_categories")
        .update({
          frequency: supabase.rpc("increment_frequency"),
          last_made_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("question_id", questionId)
        .eq("mistake_type", mistakeType);
    }

    if (userReportedReason) {
      // Store user's explanation for later analysis
      await supabase
        .from("quiz_answers")
        .update({
          user_reported_reason: userReportedReason,
        })
        .eq("user_id", userId);
    }
  }

  /*
    Get all mistakes for a user
  */
  static async getUserMistakes(userId: string) {
    const { data, error } = await supabase
      .from("mistake_categories")
      .select("*")
      .eq("user_id", userId)
      .order("frequency", { ascending: false });

    if (error) throw error;

    // Group by subject and mistake type
    const grouped = data?.reduce(
      (acc: Record<string, any>, mistake: any) => {
        const key = `${mistake.subject}`;
        if (!acc[key]) {
          acc[key] = {
            subject: mistake.subject,
            mistakes: {},
            total: 0,
          };
        }
        const mistakeType = mistake.mistake_type;
        if (!acc[key].mistakes[mistakeType]) {
          acc[key].mistakes[mistakeType] = 0;
        }
        acc[key].mistakes[mistakeType] += mistake.frequency;
        acc[key].total += mistake.frequency;
        return acc;
      },
      {}
    );

    return grouped;
  }

  /*
    Get weak areas analysis
  */
  static async getWeakAreasAnalysis(userId: string): Promise<WeakAreaAnalysis[]> {
    // Get all quiz answers with question details
    const { data: answers } = await supabase
      .from("quiz_answers")
      .select("*, questions(*)")
      .eq("user_id", userId);

    if (!answers || answers.length === 0) {
      return [];
    }

    // Group by subject
    const subjectStats: Record<
      string,
      {
        correct: number;
        total: number;
        mistakes: Record<string, number>;
        topics: Set<string>;
      }
    > = {};

    answers.forEach((answer: any) => {
      const subject = answer.questions.subject;
      const topic = answer.questions.sub_topic;

      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          correct: 0,
          total: 0,
          mistakes: {},
          topics: new Set(),
        };
      }

      subjectStats[subject].total++;
      if (answer.is_correct) {
        subjectStats[subject].correct++;
      } else {
        const mistakeType = answer.mistake_type || "concept";
        subjectStats[subject].mistakes[mistakeType] =
          (subjectStats[subject].mistakes[mistakeType] || 0) + 1;
      }

      if (topic) {
        subjectStats[subject].topics.add(topic);
      }
    });

    // Create analysis
    const analysis: WeakAreaAnalysis[] = Object.entries(subjectStats).map(
      ([subject, stats]) => {
        const accuracy = (stats.correct / stats.total) * 100;

        // Determine priority
        let priority: "low" | "medium" | "high" | "critical" = "low";
        if (accuracy < 40) priority = "critical";
        else if (accuracy < 50) priority = "high";
        else if (accuracy < 65) priority = "medium";

        // Generate recommendations
        const recommendations: string[] = [];

        const mistakeTypes = Object.entries(stats.mistakes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2);

        if (mistakeTypes.some(([type]) => type === "concept")) {
          recommendations.push(
            `Review ${subject} concepts with focused study sessions and reference materials`
          );
        }
        if (mistakeTypes.some(([type]) => type === "time_pressure")) {
          recommendations.push(
            `Practice ${subject} questions with time constraints to improve speed`
          );
        }
        if (mistakeTypes.some(([type]) => type === "careless")) {
          recommendations.push(`Be more careful with ${subject} - check answers before submitting`);
        }

        if (recommendations.length === 0) {
          recommendations.push(`Continue practicing ${subject} to improve accuracy`);
        }

        return {
          subject,
          accuracy: Number(accuracy.toFixed(2)),
          mistakePatterns: mistakeTypes.map(([type, freq]) => ({
            mistakeType: type as MistakeType,
            frequency: freq,
            subjects: [subject],
            affectedTopics: Array.from(stats.topics),
          })),
          recommendations,
          priorityLevel: priority,
        };
      }
    );

    return analysis.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
    });
  }

  /*
    Calculate weak areas statistics
  */
  static async updateWeakAreas(userId: string): Promise<void> {
    const { data: answers } = await supabase
      .from("quiz_answers")
      .select(
        `
        *,
        questions(subject, sub_topic, difficulty)
      `
      )
      .eq("user_id", userId);

    if (!answers) return;

    // Group by subject and topic
    const weakAreasMap: Record<
      string,
      {
        subject: string;
        sub_topic?: string;
        correct: number;
        total: number;
        easyCorrect?: number;
        easyTotal?: number;
        mediumCorrect?: number;
        mediumTotal?: number;
        hardCorrect?: number;
        hardTotal?: number;
        mistakeCount: number;
      }
    > = {};

    answers.forEach((answer: any) => {
      const subject = answer.questions.subject;
      const topic = answer.questions.sub_topic;
      const difficulty = answer.questions.difficulty;
      const key = topic ? `${subject}:${topic}` : subject;

      if (!weakAreasMap[key]) {
        weakAreasMap[key] = {
          subject,
          sub_topic: topic,
          correct: 0,
          total: 0,
          easyCorrect: 0,
          easyTotal: 0,
          mediumCorrect: 0,
          mediumTotal: 0,
          hardCorrect: 0,
          hardTotal: 0,
          mistakeCount: 0,
        };
      }

      const area = weakAreasMap[key];
      area.total++;

      if (answer.is_correct) {
        area.correct++;
      } else {
        area.mistakeCount++;
      }

      // Track by difficulty
      if (difficulty === "Easy") {
        area.easyTotal!++;
        if (answer.is_correct) area.easyCorrect!++;
      } else if (difficulty === "Medium") {
        area.mediumTotal!++;
        if (answer.is_correct) area.mediumCorrect!++;
      } else {
        area.hardTotal!++;
        if (answer.is_correct) area.hardCorrect!++;
      }
    });

    // Upsert weak areas
    for (const area of Object.values(weakAreasMap)) {
      const accuracy = (area.correct / area.total) * 100;
      const easyAccuracy =
        area.easyTotal && area.easyTotal > 0
          ? (area.easyCorrect! / area.easyTotal) * 100
          : undefined;
      const mediumAccuracy =
        area.mediumTotal && area.mediumTotal > 0
          ? (area.mediumCorrect! / area.mediumTotal) * 100
          : undefined;
      const hardAccuracy =
        area.hardTotal && area.hardTotal > 0
          ? (area.hardCorrect! / area.hardTotal) * 100
          : undefined;

      const needsImprovement = accuracy < 65;

      await supabase.from("user_weak_areas").upsert(
        {
          user_id: userId,
          subject: area.subject,
          sub_topic: area.sub_topic,
          accuracy_percentage: Number(accuracy.toFixed(2)),
          mistake_count: area.mistakeCount,
          correct_count: area.correct,
          total_attempts: area.total,
          easy_accuracy: easyAccuracy,
          medium_accuracy: mediumAccuracy,
          hard_accuracy: hardAccuracy,
          needs_improvement: needsImprovement,
          last_updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,subject,sub_topic",
        }
      );
    }
  }

  /*
    Get priority weak areas for focused study
  */
  static async getPriorityWeakAreas(userId: string, limit: number = 5) {
    const { data, error } = await supabase
      .from("user_weak_areas")
      .select("*")
      .eq("user_id", userId)
      .eq("needs_improvement", true)
      .order("accuracy_percentage", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as UserWeakArea[];
  }
}
