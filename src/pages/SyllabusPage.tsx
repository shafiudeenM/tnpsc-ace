import { motion } from "framer-motion";
import { BookOpen, ChevronRight, ChevronDown, FileText, ExternalLink } from "lucide-react";
import { useState } from "react";

const syllabusData = [
  {
    group: "General Studies",
    subjects: [
      {
        name: "Indian Polity & Constitution",
        topics: [
          { topic: "Fundamental Rights (Articles 12-35)", book: "Indian Polity by M. Laxmikanth", pages: "Ch 7, pp 7.1–7.32", sources: 3 },
          { topic: "Directive Principles (Articles 36-51)", book: "Indian Polity by M. Laxmikanth", pages: "Ch 8, pp 8.1–8.15", sources: 2 },
          { topic: "Union Government - President", book: "Indian Polity by M. Laxmikanth", pages: "Ch 17, pp 17.1–17.20", sources: 4 },
          { topic: "State Government - Governor", book: "Indian Polity by M. Laxmikanth", pages: "Ch 27, pp 27.1–27.14", sources: 3 },
        ],
      },
      {
        name: "Tamil Nadu History & Culture",
        topics: [
          { topic: "Sangam Age & Literature", book: "Tamil Nadu History - SCERT", pages: "Ch 3, pp 45–68", sources: 5 },
          { topic: "Pallava Dynasty", book: "Tamil Nadu History - SCERT", pages: "Ch 5, pp 89–112", sources: 3 },
          { topic: "Chola Administration", book: "Tamil Nadu History - SCERT", pages: "Ch 6, pp 113–140", sources: 4 },
          { topic: "Freedom Movement in Tamil Nadu", book: "Tamil Nadu History - SCERT", pages: "Ch 12, pp 245–278", sources: 6 },
        ],
      },
      {
        name: "Geography",
        topics: [
          { topic: "Physical Geography of India", book: "NCERT Class 11 Geography", pages: "Ch 2-4, pp 12–45", sources: 2 },
          { topic: "Tamil Nadu Geography", book: "Tamil Nadu Geography - SCERT", pages: "Ch 1-3, pp 1–35", sources: 3 },
          { topic: "Climate & Monsoons", book: "NCERT Class 11 Geography", pages: "Ch 4, pp 46–62", sources: 2 },
        ],
      },
    ],
  },
  {
    group: "General Science",
    subjects: [
      {
        name: "Physics",
        topics: [
          { topic: "Laws of Motion", book: "NCERT Class 11 Physics", pages: "Ch 5, pp 88–110", sources: 2 },
          { topic: "Heat & Thermodynamics", book: "NCERT Class 11 Physics", pages: "Ch 11-12, pp 258–300", sources: 3 },
        ],
      },
      {
        name: "Chemistry",
        topics: [
          { topic: "Periodic Table", book: "NCERT Class 11 Chemistry", pages: "Ch 3, pp 78–102", sources: 2 },
          { topic: "Acids, Bases & Salts", book: "NCERT Class 10 Science", pages: "Ch 2, pp 18–32", sources: 2 },
        ],
      },
    ],
  },
];

export default function SyllabusPage() {
  const [expandedGroup, setExpandedGroup] = useState<string | null>("General Studies");
  const [expandedSubject, setExpandedSubject] = useState<string | null>("Indian Polity & Constitution");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-info" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Syllabus Map</h1>
          <p className="text-sm text-muted-foreground">Find exactly which book, which page has your content • பாடத்திட்ட வரைபடம்</p>
        </div>
      </div>

      <div className="space-y-4">
        {syllabusData.map((group) => (
          <div key={group.group} className="rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setExpandedGroup(expandedGroup === group.group ? null : group.group)}
              className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors"
            >
              <h2 className="font-display font-semibold text-foreground">{group.group}</h2>
              {expandedGroup === group.group ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {expandedGroup === group.group && (
              <div className="border-t border-border">
                {group.subjects.map((subject) => (
                  <div key={subject.name}>
                    <button
                      onClick={() => setExpandedSubject(expandedSubject === subject.name ? null : subject.name)}
                      className="w-full flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{subject.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{subject.topics.length} topics</span>
                        {expandedSubject === subject.name ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {expandedSubject === subject.name && (
                      <div className="px-6 pb-4 space-y-2">
                        {subject.topics.map((topic) => (
                          <div key={topic.topic} className="stat-card !p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">{topic.topic}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span className="text-xs text-primary font-medium">{topic.book}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 ml-5">{topic.pages}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                                  {topic.sources} sources
                                </span>
                                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
