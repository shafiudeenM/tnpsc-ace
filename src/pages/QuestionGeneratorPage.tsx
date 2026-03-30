import { motion } from "framer-motion";
import { FileQuestion, Wand2, Settings2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const subjects = ["Indian Polity", "Tamil Nadu History", "General Science", "Economy", "Geography", "Current Affairs"];
const difficulties = ["Easy", "Medium", "Hard", "Mixed"];

export default function QuestionGeneratorPage() {
  const [selectedSubject, setSelectedSubject] = useState("Indian Polity");
  const [selectedDiff, setSelectedDiff] = useState("Mixed");
  const [count, setCount] = useState(10);
  const [generated, setGenerated] = useState(false);

  const sampleGenerated = [
    { q: "Which part of the Indian Constitution deals with Fundamental Rights?", opts: ["Part II", "Part III", "Part IV", "Part V"], ans: 1 },
    { q: "The concept of 'Basic Structure' was established in which case?", opts: ["Golaknath Case", "Kesavananda Bharati Case", "Minerva Mills Case", "Maneka Gandhi Case"], ans: 1 },
    { q: "Article 32 is related to?", opts: ["Right to Freedom", "Right to Equality", "Constitutional Remedies", "Right to Education"], ans: 2 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileQuestion className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Question Generator</h1>
          <p className="text-sm text-muted-foreground">Generate TNPSC-style questions • TNPSC பாணி கேள்விகள்</p>
        </div>
      </div>

      {/* Config */}
      <div className="stat-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Configuration</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Subject</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedSubject === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDiff(d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedDiff === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Number of Questions: {count}</label>
            <input
              type="range"
              min={5}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <Button onClick={() => setGenerated(true)} className="w-full mt-4 bg-gradient-gold text-primary-foreground gap-2">
          <Wand2 className="h-4 w-4" /> Generate Questions
        </Button>
      </div>

      {/* Generated */}
      {generated && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">Generated Questions</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
          <div className="space-y-4">
            {sampleGenerated.map((q, i) => (
              <div key={i} className="stat-card">
                <p className="text-sm font-medium text-foreground mb-3">
                  {i + 1}. {q.q}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {q.opts.map((opt, j) => (
                    <div
                      key={j}
                      className={`text-xs px-3 py-2 rounded-lg border ${
                        j === q.ans ? "border-success/30 bg-success/5 text-success" : "border-border text-muted-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + j)}. {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
