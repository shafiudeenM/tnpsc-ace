import { motion } from "framer-motion";
import { ClipboardCheck, Clock, Users, BarChart3, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockTests = [
  {
    title: "TNPSC Group 1 Prelims - Full Mock 1",
    titleTa: "குரூப் 1 முதல்நிலை - முழு தேர்வு 1",
    questions: 200,
    duration: "3 hours",
    participants: 1240,
    avgScore: 132,
    status: "available",
    difficulty: "Hard",
  },
  {
    title: "TNPSC Group 2 Prelims - Full Mock 1",
    titleTa: "குரூப் 2 முதல்நிலை - முழு தேர்வு 1",
    questions: 200,
    duration: "3 hours",
    participants: 3420,
    avgScore: 145,
    status: "available",
    difficulty: "Medium",
  },
  {
    title: "TNPSC Group 4 - Full Mock 1",
    titleTa: "குரூப் 4 - முழு தேர்வு 1",
    questions: 200,
    duration: "3 hours",
    participants: 5680,
    avgScore: 156,
    status: "available",
    difficulty: "Medium",
  },
  {
    title: "TNPSC Group 1 Prelims - Full Mock 2",
    titleTa: "குரூப் 1 முதல்நிலை - முழு தேர்வு 2",
    questions: 200,
    duration: "3 hours",
    participants: 890,
    avgScore: 128,
    status: "locked",
    difficulty: "Hard",
  },
  {
    title: "Subject-wise: Indian Polity",
    titleTa: "பாடவாரி: இந்திய அரசியல்",
    questions: 50,
    duration: "45 min",
    participants: 2100,
    avgScore: 35,
    status: "available",
    difficulty: "Medium",
  },
  {
    title: "Subject-wise: Tamil Nadu History",
    titleTa: "பாடவாரி: தமிழ்நாடு வரலாறு",
    questions: 50,
    duration: "45 min",
    participants: 1890,
    avgScore: 32,
    status: "available",
    difficulty: "Hard",
  },
];

export default function MockTestsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
          <ClipboardCheck className="h-5 w-5 text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Mock Tests</h1>
          <p className="text-sm text-muted-foreground">Full exam simulation with real patterns • மாதிரி தேர்வுகள்</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card text-center">
          <p className="text-2xl font-display font-bold text-primary">12</p>
          <p className="text-xs text-muted-foreground">Tests Available</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-display font-bold text-accent">3</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-display font-bold text-success">145</p>
          <p className="text-xs text-muted-foreground">Avg Score/200</p>
        </div>
      </div>

      {/* Tests */}
      <div className="space-y-3">
        {mockTests.map((test) => (
          <div key={test.title} className="feature-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground">{test.title}</h3>
                  {test.status === "locked" && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground">{test.titleTa}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ClipboardCheck className="h-3 w-3" /> {test.questions} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {test.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {test.participants.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" /> Avg: {test.avgScore}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    test.difficulty === "Hard" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  }`}>
                    {test.difficulty}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className={test.status === "available" ? "bg-gradient-gold text-primary-foreground gap-1" : ""}
                variant={test.status === "locked" ? "outline" : "default"}
                disabled={test.status === "locked"}
              >
                <Play className="h-3.5 w-3.5" />
                {test.status === "available" ? "Start" : "Locked"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
