import { motion } from "framer-motion";
import { Newspaper, Calendar, ChevronRight, BookOpen, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const currentAffairs = [
  {
    date: "March 28, 2026",
    articles: [
      { title: "Union Budget 2026-27 Key Highlights", category: "Economy", importance: "high", mcqCount: 5 },
      { title: "New Education Policy Implementation in Tamil Nadu", category: "Education", importance: "high", mcqCount: 3 },
      { title: "India-Japan Defence Partnership Agreement", category: "International Relations", importance: "medium", mcqCount: 2 },
    ],
  },
  {
    date: "March 27, 2026",
    articles: [
      { title: "ISRO Successfully Launches Gaganyaan Test Flight", category: "Science & Tech", importance: "high", mcqCount: 4 },
      { title: "Tamil Nadu Tops Skill Development Index 2026", category: "Tamil Nadu", importance: "high", mcqCount: 3 },
      { title: "Supreme Court Ruling on Environmental Protection", category: "Polity", importance: "medium", mcqCount: 2 },
    ],
  },
  {
    date: "March 26, 2026",
    articles: [
      { title: "RBI Monetary Policy Review - Rate Cut", category: "Economy", importance: "medium", mcqCount: 3 },
      { title: "New Archaeological Discovery in Keeladi", category: "Tamil Nadu", importance: "high", mcqCount: 2 },
    ],
  },
];

export default function CurrentAffairsPage() {
  const [selectedDate, setSelectedDate] = useState(currentAffairs[0].date);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
          <Newspaper className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Current Affairs</h1>
          <p className="text-sm text-muted-foreground">Daily TNPSC-relevant news with MCQs • நடப்பு நிகழ்வுகள்</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {currentAffairs.map((day) => (
          <div key={day.date}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-display font-semibold text-foreground">{day.date}</h2>
            </div>
            <div className="space-y-3 ml-6 border-l-2 border-border pl-4">
              {day.articles.map((article) => (
                <div key={article.title} className="feature-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          article.importance === "high"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {article.importance === "high" ? "🔥 High Priority" : "📋 Moderate"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-foreground mt-2">{article.title}</h3>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                      <BookOpen className="h-3 w-3" /> Read
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                      <Zap className="h-3 w-3" /> {article.mcqCount} MCQs
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
