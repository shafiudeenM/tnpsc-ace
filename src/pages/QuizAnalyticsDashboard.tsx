import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Brain, TrendingUp, Zap, Target, Clock, CircleAlert as AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnalyticsService } from "@/services/analytics";
import { SpacedRepetitionService } from "@/services/spacedRepetition";
import { useAuth } from "@/hooks/useAuth";

export default function QuizAnalyticsDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [speed, setSpeed] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;

      try {
        const [metricsData, subjectsData, speedData, trendData, insightsData, progressData] =
          await Promise.all([
            AnalyticsService.getPerformanceMetrics(user.id),
            AnalyticsService.getSubjectPerformance(user.id),
            AnalyticsService.getSpeedAnalysis(user.id),
            AnalyticsService.getAccuracyTrend(user.id, 30),
            AnalyticsService.generateInsights(user.id),
            SpacedRepetitionService.getProgressStats(user.id),
          ]);

        setMetrics(metricsData);
        setSubjects(subjectsData);
        setSpeed(speedData);
        setTrend(trendData);
        setInsights(insightsData);
        setProgressStats(progressData);
      } catch (error) {
        console.error("Error loading analytics:", error);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!metrics) {
    return <div className="text-center py-8">No data available yet. Start a quiz!</div>;
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                <p className="text-3xl font-bold mt-1">{metrics.accuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Questions/Minute</p>
                <p className="text-3xl font-bold mt-1">{metrics.speed.toFixed(1)}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consistency</p>
                <p className="text-3xl font-bold mt-1">{metrics.consistency.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className="text-3xl font-bold mt-1">{metrics.improvement > 0 ? "+" : ""}
                  {metrics.improvement.toFixed(1)}%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spaced Repetition Progress */}
      {progressStats && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <p className="text-2xl font-bold text-blue-600">{progressStats.newQuestions}</p>
                <p className="text-sm text-muted-foreground mt-1">New</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <p className="text-2xl font-bold text-yellow-600">{progressStats.learningQuestions}</p>
                <p className="text-sm text-muted-foreground mt-1">Learning</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <p className="text-2xl font-bold text-green-600">{progressStats.masteredQuestions}</p>
                <p className="text-sm text-muted-foreground mt-1">Mastered</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <p className="text-2xl font-bold text-purple-600">{progressStats.questionsToReview}</p>
                <p className="text-sm text-muted-foreground mt-1">Due for Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Accuracy Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Trend (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#3b82f6"
                    name="Accuracy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">No trend data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Speed Analysis */}
      {speed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Speed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Average Time</p>
                <p className="text-2xl font-bold mt-1">{speed.avgTimePerQuestion.toFixed(1)}s</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Fastest</p>
                <p className="text-2xl font-bold mt-1">{speed.fastestQuestion.toFixed(1)}s</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Slowest</p>
                <p className="text-2xl font-bold mt-1">{speed.slowestQuestion.toFixed(1)}s</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Questions/Min</p>
                <p className="text-2xl font-bold mt-1">{speed.qpm.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg border border-border hover:bg-accent/5 transition"
              >
                <div className="flex items-start gap-3">
                  {insight.priority === "high" ? (
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <Brain className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    <ul className="mt-2 space-y-1">
                      {insight.actionItems.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
