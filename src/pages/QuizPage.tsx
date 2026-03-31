import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CircleCheck as CheckCircle2, Circle as XCircle, RotateCcw, Timer, ChartBar as BarChart3, Lightbulb, ChevronRight, ArrowLeft, Flag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase, Question } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { QuizEngineService, QuizConfig } from "@/services/quizEngine";
import { MistakeTrackingService } from "@/services/mistakeTracking";
import { SpacedRepetitionService } from "@/services/spacedRepetition";

interface QuizQuestion extends Question {
  timeTaken?: number;
  selected?: number | null;
  isFlagged?: boolean;
}

export default function QuizPage() {
  const { user } = useAuth();
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [timer, setTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [quizType, setQuizType] = useState<"daily" | "subject" | "spaced_repetition">(
    "daily"
  );
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [mistakeReason, setMistakeReason] = useState("");
  const [mistakeType, setMistakeType] = useState<"careless" | "concept" | "time_pressure">(
    "concept"
  );

  // Timer effect
  useEffect(() => {
    if (!quizStarted || !questions.length) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
      setQuestionTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizStarted, questions.length]);

  // Load questions
  const loadQuiz = useCallback(async () => {
    if (!user) {
      toast.error("Please login to start quiz");
      return;
    }

    setLoading(true);
    try {
      let config: QuizConfig = {
        type: quizType,
        questionCount: 10,
        subject: selectedSubject || undefined,
      };

      const session = await QuizEngineService.createQuizSession(user.id, config);

      if (session.questions.length === 0) {
        toast.error("No questions available for this selection");
        setLoading(false);
        return;
      }

      setQuestions(session.questions);
      setQuizStarted(true);
      setTimer(0);
      setQuestionTimer(0);
      setScore({ correct: 0, wrong: 0, skipped: 0 });
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [user, quizType, selectedSubject]);

  const handleSelect = async (idx: number) => {
    if (selected !== null) return;

    setSelected(idx);
    setShowExplanation(true);

    const q = questions[currentQ];
    const isCorrect = idx === q.correct_answer;

    if (isCorrect) {
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    }

    // Store answer in state
    const updatedQuestions = [...questions];
    updatedQuestions[currentQ] = {
      ...q,
      selected: idx,
      timeTaken: questionTimer,
    };
    setQuestions(updatedQuestions);
  };

  const skipQuestion = () => {
    if (selected === null) {
      setScore((s) => ({ ...s, skipped: s.skipped + 1 }));
    }
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowExplanation(false);
      setQuestionTimer(0);
      setMistakeReason("");
    } else {
      finishQuiz();
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQ)) {
      newFlagged.delete(currentQ);
    } else {
      newFlagged.add(currentQ);
    }
    setFlagged(newFlagged);
  };

  const reportMistake = async () => {
    if (!user || selected === null) return;

    const q = questions[currentQ];

    try {
      await MistakeTrackingService.recordMistake(
        user.id,
        q.id,
        q.subject,
        mistakeType,
        mistakeReason
      );
      toast.success("Mistake recorded for analysis");
      setMistakeReason("");
    } catch (error) {
      console.error("Error recording mistake:", error);
      toast.error("Failed to record mistake");
    }
  };

  const finishQuiz = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create quiz session and save
      const config: QuizConfig = {
        type: quizType as any,
        subject: selectedSubject || undefined,
      };

      const session = await QuizEngineService.createQuizSession(user.id, config);
      session.questions = questions;
      session.startTime = new Date(timer * 1000);

      // Record all answers
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        session.answers.set(q.id, {
          selectedAnswer: q.selected ?? null,
          timeTaken: q.timeTaken ?? questionTimer,
          flagged: flagged.has(i),
        });
      }

      const quizAttempt = await QuizEngineService.saveQuizAttempt(session);
      await MistakeTrackingService.updateWeakAreas(user.id);

      toast.success("Quiz completed! Check your results.");
      setQuizStarted(false);
      setQuestions([]);
      setCurrentQ(0);
    } catch (error) {
      console.error("Error finishing quiz:", error);
      toast.error("Error saving quiz");
    } finally {
      setLoading(false);
    }
  };

  if (!quizStarted) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Smart Quiz</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered spaced repetition quiz that adapts to your learning
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition">
              <RotateCcw className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Spaced Repetition</p>
              <p className="text-xs text-muted-foreground mt-1">Optimal review timing</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition">
              <BarChart3 className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-sm font-medium">Mistake Tracking</p>
              <p className="text-xs text-muted-foreground mt-1">Error patterns analysis</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition">
              <Lightbulb className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Smart Insights</p>
              <p className="text-xs text-muted-foreground mt-1">Learn your weaknesses</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="quiz-type" className="text-sm font-medium">
                Quiz Type
              </Label>
              <Select value={quizType} onValueChange={(v: any) => setQuizType(v)}>
                <SelectTrigger id="quiz-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Quiz</SelectItem>
                  <SelectItem value="spaced_repetition">Spaced Repetition</SelectItem>
                  <SelectItem value="subject">By Subject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {quizType === "subject" && (
              <div>
                <Label htmlFor="subject" className="text-sm font-medium">
                  Select Subject
                </Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="subject" className="mt-1">
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indian Polity">Indian Polity</SelectItem>
                    <SelectItem value="Tamil Nadu History">Tamil Nadu History</SelectItem>
                    <SelectItem value="General Science">General Science</SelectItem>
                    <SelectItem value="Economy">Economy</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button onClick={loadQuiz} disabled={loading} className="w-full">
            {loading ? "Loading..." : "Start Quiz"}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!questions.length) {
    return <div className="text-center py-8">Loading questions...</div>;
  }

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setQuizStarted(false)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit
        </Button>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {currentQ + 1}/{questions.length}
          </span>
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-4 w-4" /> {score.correct}
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <XCircle className="h-4 w-4" /> {score.wrong}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Timer className="h-4 w-4" /> {String(Math.floor(timer / 60)).padStart(2, "0")}:
            {String(timer % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
          {q.subject}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          {q.difficulty}
        </span>
        {flagged.has(currentQ) && (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Flag className="h-3 w-3" /> Flagged
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
          <h2 className="text-xl font-semibold text-foreground leading-relaxed">{q.question_text}</h2>
          {q.question_ta && (
            <p className="text-sm text-muted-foreground mt-2 italic">{q.question_ta}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {q.options.map((opt: string, idx: number) => {
          let classes =
            "p-4 rounded-lg border-2 border-border flex items-center gap-3 cursor-pointer transition hover:border-primary hover:bg-primary/5";
          if (selected !== null) {
            if (idx === q.correct_answer) classes = classes.replace("border-border", "border-green-500 bg-green-50");
            else if (idx === selected) classes = classes.replace("border-border", "border-red-500 bg-red-50");
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
              <span className="text-foreground text-left flex-1">{opt}</span>
              {selected !== null && idx === q.correct_answer && (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              )}
              {selected === idx && idx !== q.correct_answer && (
                <XCircle className="h-5 w-5 text-red-600 shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Explanation</span>
            </div>
            <p className="text-sm text-blue-800">{q.explanation}</p>
            {q.explanation_ta && (
              <p className="text-sm text-blue-700 mt-2 italic">{q.explanation_ta}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      {selected !== null && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFlag}
              className="gap-1"
            >
              <Flag className="h-4 w-4" />
              {flagged.has(currentQ) ? "Unflag" : "Flag"}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Mistake</DialogTitle>
                  <DialogDescription>
                    Help us understand why you got this wrong
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mistake-type" className="text-sm">
                      Mistake Type
                    </Label>
                    <Select
                      value={mistakeType}
                      onValueChange={(v: any) => setMistakeType(v)}
                    >
                      <SelectTrigger id="mistake-type" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="careless">Careless Mistake</SelectItem>
                        <SelectItem value="concept">Concept Gap</SelectItem>
                        <SelectItem value="time_pressure">Time Pressure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reason" className="text-sm">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="What went wrong?"
                      value={mistakeReason}
                      onChange={(e) => setMistakeReason(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={reportMistake} className="w-full">
                    Save Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Button
            onClick={nextQuestion}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          >
            {currentQ < questions.length - 1 ? "Next Question →" : "View Results"}
          </Button>
        </div>
      )}

      {selected === null && (
        <Button onClick={skipQuestion} variant="outline" className="w-full">
          Skip Question
        </Button>
      )}
    </motion.div>
  );
}
