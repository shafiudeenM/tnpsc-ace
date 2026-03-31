import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, Clock, BookOpen, Zap, Trophy, ArrowRight, ChartBar as BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnalyticsService } from "@/services/analytics";
import { MistakeTrackingService } from "@/services/mistakeTracking";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "Smart Quiz",
    subtitle: "Spaced repetition quiz",
    desc: "AI-powered adaptive quiz that tracks your mistakes and strengthens weak areas",
    icon: Brain,
    route: "/quiz",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    title: "AI Assistant",
    subtitle: "TNPSC AI Tutor",
    desc: "Ask any doubt — get answers from verified TNPSC sources and materials",
    icon: Zap,
    route: "/ai-assistant",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    title: "Syllabus Map",
    subtitle: "Book & page mapping",
    desc: "Find exactly which book, which page has your syllabus content",
    icon: BookOpen,
    route: "/syllabus",
    gradient: "from-info/20 to-info/5",
  },
  {
    title: "Mock Tests",
    subtitle: "Full exam simulation",
    desc: "Practice with real TNPSC exam structure, timing, and pattern",
    icon: Trophy,
    route: "/mock-tests",
    gradient: "from-success/20 to-success/5",
  },
  {
    title: "Quiz Analytics",
    subtitle: "Performance insights",
    desc: "Detailed breakdown of your strengths, weaknesses, and learning patterns",
    icon: BarChart3,
    route: "/analytics",
    gradient: "from-purple-500/20 to-purple-500/5",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [weakAreas, setWeakAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const metrics = await AnalyticsService.getPerformanceMetrics(user.id);
        const weakAreasData = await MistakeTrackingService.getPriorityWeakAreas(user.id, 4);

        setStats([
          {
            label: "Questions Practiced",
            value: metrics.questionsCovered.toString(),
            change: "Total solved",
            icon: Brain,
            color: "text-primary",
          },
          {
            label: "Accuracy Rate",
            value: `${metrics.accuracy.toFixed(1)}%`,
            change: `Consistency: ${metrics.consistency.toFixed(0)}%`,
            icon: Target,
            color: "text-accent",
          },
          {
            label: "Learning Speed",
            value: `${metrics.speed.toFixed(1)}/min`,
            change: "Questions per minute",
            icon: Zap,
            color: "text-success",
          },
          {
            label: "Improvement",
            value: `${metrics.improvement > 0 ? "+" : ""}${metrics.improvement.toFixed(1)}%`,
            change: "This week",
            icon: TrendingUp,
            color: "text-info",
          },
        ]);

        setWeakAreas(
          weakAreasData.map((area) => ({
            topic: area.sub_topic ? `${area.subject} - ${area.sub_topic}` : area.subject,
            accuracy: Math.round(area.accuracy_percentage || 0),
            total: area.total_attempts,
          }))
        );
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back! <span className="text-gradient-gold">வணக்கம்!</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Your TNPSC preparation dashboard — let's crack it today 💪
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.change}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <div
              key={action.title}
              onClick={() => navigate(action.route)}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition cursor-pointer group"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}
              >
                <action.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">{action.title}</h3>
                  <p className="text-xs text-primary mt-0.5">{action.subtitle}</p>
                  <p className="text-sm text-muted-foreground mt-2">{action.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Areas to Improve{" "}
            <span className="text-muted-foreground text-sm font-normal">
              — Focus here to boost your score
            </span>
          </h2>
          <div className="space-y-3">
            {weakAreas.map((area) => (
              <div key={area.topic} className="p-4 rounded-lg border border-border bg-card flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{area.topic}</p>
                  <p className="text-xs text-muted-foreground">{area.total} questions attempted</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${area.accuracy}%`,
                        background:
                          area.accuracy < 50
                            ? "hsl(0 72% 51%)"
                            : area.accuracy < 65
                              ? "hsl(38 92% 50%)"
                              : "hsl(142 71% 45%)",
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono font-medium text-foreground w-12 text-right">
                    {area.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div variants={item} className="text-center py-8">
        <h3 className="text-lg font-semibold mb-3">Ready to level up?</h3>
        <Button onClick={() => navigate("/quiz")} size="lg">
          Start Smart Quiz Now
        </Button>
      </motion.div>
    </motion.div>
  );
}
