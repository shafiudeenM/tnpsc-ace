import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CircleCheck as CheckCircle2, Circle as XCircle, TrendingUp, Clock, Zap, RefreshCw, ChevronRight, CircleAlert as AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { QuizEngineService } from "@/services/quizEngine";
import { AnalyticsService } from "@/services/analytics";
import { useAuth } from "@/hooks/useAuth";

interface QuizResult {
  accuracy: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
  avgTimePerQuestion: number;
  subject?: string;
}

export default function QuizResultsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [result, setResult] = useState<QuizResult | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!user || !quizId) return;

      try {
        const { attempt, answers } = await QuizEngineService.getQuizDetails(quizId);

        setResult({
          accuracy: attempt.accuracy,
          correctAnswers: attempt.correct_answers,
          totalQuestions: attempt.total_questions,
          durationSeconds: attempt.duration_seconds,
          avgTimePerQuestion: attempt.avg_time_per_question,
          subject: attempt.subject,
        });

        const generatedInsights = await AnalyticsService.generateInsights(user.id);
        setInsights(generatedInsights);
      } catch (error) {
        console.error("Error loading results:", error);
        toast.error("Failed to load quiz results");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user, quizId]);

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  if (!result) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p>Quiz results not found</p>
      </div>
    );
  }

  const minutes = Math.floor(result.durationSeconds / 60);
  const seconds = result.durationSeconds % 60;
  const performanceGrade =
    result.accuracy >= 80 ? "A+" : result.accuracy >= 70 ? "A" : result.accuracy >= 60 ? "B" : "C";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-4xl mx-auto">
        {/* Score Card */}
        <Card className="mb-8 border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{performanceGrade}</div>
              <h1 className="text-2xl font-bold">Quiz Completed!</h1>
              <p className="opacity-90 mt-2">Great effort! See your detailed breakdown below.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{result.accuracy}%</div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {result.correctAnswers}
                </div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {result.totalQuestions - result.correctAnswers}
                </div>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Avg Time / Question</span>
                </div>
                <p className="text-2xl font-bold">{result.avgTimePerQuestion.toFixed(1)}s</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Speed</span>
                </div>
                <p className="text-2xl font-bold">
                  {(60 / result.avgTimePerQuestion).toFixed(2)} Q/min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Feedback */}
        {result.accuracy < 50 && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6 flex gap-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900">Keep Practicing</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Your current accuracy needs improvement. Focus on concept-based learning and
                  practice more questions in weak areas.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {result.accuracy >= 80 && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="pt-6 flex gap-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900">Excellent Performance!</h3>
                <p className="text-sm text-green-800 mt-1">
                  You're performing well! Keep maintaining this consistency and work on edge cases
                  to achieve 90%+ accuracy.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights Section */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Learning Insights</h2>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border border-border hover:bg-accent/5 transition"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        insight.priority === "high" ? "bg-red-500" : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      <ul className="mt-2 space-y-1">
                        {insight.actionItems.slice(0, 2).map((item: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <ChevronRight className="h-3 w-3" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/quiz")} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Take Another Quiz
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            View Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
