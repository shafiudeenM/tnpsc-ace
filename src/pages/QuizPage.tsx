import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, XCircle, RotateCcw, Timer, BarChart3, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const sampleQuestions = [
  {
    id: 1,
    question: "Which Article of the Indian Constitution deals with the Right to Equality?",
    questionTa: "இந்திய அரசியலமைப்பின் எந்த பிரிவு சமத்துவ உரிமையை பற்றி பேசுகிறது?",
    options: ["Article 12", "Article 14", "Article 19", "Article 21"],
    correct: 1,
    explanation: "Article 14 guarantees equality before law and equal protection of laws within the territory of India.",
    subject: "Indian Polity",
    difficulty: "Medium",
    spaceRepetitionDue: true,
  },
  {
    id: 2,
    question: "The Pallava dynasty was founded by?",
    questionTa: "பல்லவ வம்சத்தை நிறுவியவர் யார்?",
    options: ["Simhavishnu", "Mahendravarman I", "Narasimhavarman I", "Nandivarman II"],
    correct: 0,
    explanation: "Simhavishnu is considered the founder of the Pallava dynasty, establishing their rule in the Tondaimandalam region.",
    subject: "Tamil Nadu History",
    difficulty: "Hard",
    spaceRepetitionDue: false,
  },
  {
    id: 3,
    question: "What is the chemical formula of Ozone?",
    questionTa: "ஓசோனின் வேதியியல் சூத்திரம் என்ன?",
    options: ["O", "O₂", "O₃", "O₄"],
    correct: 2,
    explanation: "Ozone has the chemical formula O₃, consisting of three oxygen atoms.",
    subject: "General Science",
    difficulty: "Easy",
    spaceRepetitionDue: true,
  },
];

export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [quizStarted, setQuizStarted] = useState(false);

  const q = sampleQuestions[currentQ];
  const progress = ((currentQ + 1) / sampleQuestions.length) * 100;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    if (idx === q.correct) {
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const nextQuestion = () => {
    if (currentQ < sampleQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  if (!quizStarted) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Smart Quiz</h1>
          <p className="text-muted-foreground mt-2">AI-powered spaced repetition quiz that adapts to your learning</p>
          <p className="text-sm text-primary mt-1">உங்கள் கற்றலுக்கு ஏற்ற புத்திசாலி வினாடி வினா</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card text-center">
            <RotateCcw className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Spaced Repetition</p>
            <p className="text-xs text-muted-foreground mt-1">Questions return at optimal intervals</p>
          </div>
          <div className="stat-card text-center">
            <BarChart3 className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Mistake Tracking</p>
            <p className="text-xs text-muted-foreground mt-1">Analyze your error patterns</p>
          </div>
          <div className="stat-card text-center">
            <Lightbulb className="h-5 w-5 text-warning mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Smart Insights</p>
            <p className="text-xs text-muted-foreground mt-1">Know why you lose marks</p>
          </div>
        </div>

        <div className="space-y-3">
          {["All Subjects", "Indian Polity", "Tamil Nadu History", "General Science", "Economy", "Geography"].map((subject) => (
            <button
              key={subject}
              onClick={() => setQuizStarted(true)}
              className="feature-card w-full text-left flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{subject}</p>
                <p className="text-xs text-muted-foreground">
                  {subject === "All Subjects" ? "12 questions due for review" : `${Math.floor(Math.random() * 8 + 2)} due`}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {currentQ + 1}/{sampleQuestions.length}
          </span>
          <Progress value={progress} className="w-32 h-2" />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 className="h-4 w-4" /> {score.correct}
          </span>
          <span className="flex items-center gap-1 text-destructive">
            <XCircle className="h-4 w-4" /> {score.wrong}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Timer className="h-4 w-4" /> 02:34
          </span>
        </div>
      </div>

      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          {q.subject}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {q.difficulty}
        </span>
        {q.spaceRepetitionDue && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Review Due
          </span>
        )}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="mb-6"
        >
          <h2 className="text-xl font-display font-semibold text-foreground leading-relaxed">{q.question}</h2>
          <p className="text-sm text-muted-foreground mt-2">{q.questionTa}</p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {q.options.map((opt, idx) => {
          let classes = "feature-card py-4 flex items-center gap-3";
          if (selected !== null) {
            if (idx === q.correct) classes += " !border-success/50 bg-success/5";
            else if (idx === selected) classes += " !border-destructive/50 bg-destructive/5";
          }
          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(idx)}
              className={classes}
              disabled={selected !== null}
            >
              <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-mono font-medium text-muted-foreground shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-foreground text-left">{opt}</span>
              {selected !== null && idx === q.correct && (
                <CheckCircle2 className="h-5 w-5 text-success ml-auto shrink-0" />
              )}
              {selected === idx && idx !== q.correct && (
                <XCircle className="h-5 w-5 text-destructive ml-auto shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Explanation</span>
          </div>
          <p className="text-sm text-muted-foreground">{q.explanation}</p>
        </motion.div>
      )}

      {/* Next */}
      {selected !== null && (
        <Button onClick={nextQuestion} className="w-full bg-gradient-gold text-primary-foreground font-medium">
          {currentQ < sampleQuestions.length - 1 ? "Next Question →" : "View Results"}
        </Button>
      )}
    </motion.div>
  );
}
