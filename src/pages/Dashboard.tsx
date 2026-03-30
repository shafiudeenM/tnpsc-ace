import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, Clock, BookOpen, Zap, Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Questions Practiced", value: "1,247", change: "+86 today", icon: Brain, color: "text-primary" },
  { label: "Accuracy Rate", value: "73.2%", change: "+2.1% this week", icon: Target, color: "text-accent" },
  { label: "Study Streak", value: "7 Days", change: "Personal best!", icon: TrendingUp, color: "text-success" },
  { label: "Hours Studied", value: "42.5h", change: "This month", icon: Clock, color: "text-info" },
];

const quickActions = [
  { title: "Smart Quiz", subtitle: "Spaced repetition quiz", desc: "AI-powered adaptive quiz that tracks your mistakes and strengthens weak areas", icon: Brain, route: "/quiz", gradient: "from-primary/20 to-primary/5" },
  { title: "AI Assistant", subtitle: "TNPSC AI Tutor", desc: "Ask any doubt — get answers from verified TNPSC sources and materials", icon: Zap, route: "/ai-assistant", gradient: "from-accent/20 to-accent/5" },
  { title: "Syllabus Map", subtitle: "Book & page mapping", desc: "Find exactly which book, which page has your syllabus content", icon: BookOpen, route: "/syllabus", gradient: "from-info/20 to-info/5" },
  { title: "Mock Tests", subtitle: "Full exam simulation", desc: "Practice with real TNPSC exam structure, timing, and pattern", icon: Trophy, route: "/mock-tests", gradient: "from-success/20 to-success/5" },
];

const weakAreas = [
  { topic: "Indian Polity - Fundamental Rights", accuracy: 45, total: 40 },
  { topic: "Tamil Nadu History - Chola Dynasty", accuracy: 52, total: 25 },
  { topic: "General Science - Physics", accuracy: 58, total: 35 },
  { topic: "Economy - Five Year Plans", accuracy: 61, total: 20 },
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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back! <span className="text-gradient-gold">வணக்கம்!</span>
        </h1>
        <p className="text-muted-foreground mt-1">Your TNPSC preparation dashboard — let's crack it today 💪</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
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
              className="feature-card group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}>
                <action.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex items-start justify-between">
                <div>
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
      <motion.div variants={item}>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          Areas to Improve <span className="text-muted-foreground text-sm font-normal">— Focus here to boost your score</span>
        </h2>
        <div className="space-y-3">
          {weakAreas.map((area) => (
            <div key={area.topic} className="stat-card flex items-center gap-4">
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
                      background: area.accuracy < 50
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
    </motion.div>
  );
}
