import { motion } from "framer-motion";
import { History, TrendingUp, BarChart3, PieChart, AlertTriangle, Lightbulb } from "lucide-react";

const yearData = [
  { year: "2023", totalQ: 200, polity: 28, history: 32, science: 25, economy: 20, geo: 22, aptitude: 25, gk: 18, tamil: 30 },
  { year: "2022", totalQ: 200, polity: 30, history: 28, science: 27, economy: 22, geo: 20, aptitude: 25, gk: 20, tamil: 28 },
  { year: "2021", totalQ: 200, polity: 25, history: 35, science: 22, economy: 18, geo: 25, aptitude: 30, gk: 15, tamil: 30 },
];

const insights = [
  { icon: TrendingUp, title: "Tamil Nadu History is increasing", desc: "From 28 to 35 questions over 3 years. Focus more on post-independence TN history.", color: "text-primary" },
  { icon: AlertTriangle, title: "Economy questions getting harder", desc: "More application-based questions on recent budget and economic reforms.", color: "text-destructive" },
  { icon: PieChart, title: "Science has fixed pattern", desc: "10 Physics, 8 Chemistry, 7 Biology consistently. Focus on NCERT basics.", color: "text-accent" },
  { icon: Lightbulb, title: "Aptitude is high-scoring", desc: "25-30 questions with predictable patterns. Easy marks if practiced well.", color: "text-success" },
];

const topRepeated = [
  { topic: "Fundamental Rights & DPSP", count: 12, years: "2018-2023" },
  { topic: "Chola Dynasty Administration", count: 8, years: "2019-2023" },
  { topic: "Five Year Plans", count: 7, years: "2018-2022" },
  { topic: "Constitutional Amendments", count: 9, years: "2017-2023" },
  { topic: "Indian National Movement - TN", count: 10, years: "2018-2023" },
];

export default function PYQAnalysisPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Previous Year Analysis</h1>
          <p className="text-sm text-muted-foreground">Decode TNPSC patterns • முந்தைய ஆண்டு பகுப்பாய்வு</p>
        </div>
      </div>

      {/* Year breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Year</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">Polity</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">History</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">Science</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">Economy</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">Geo</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">Aptitude</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">GK</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">Tamil</th>
            </tr>
          </thead>
          <tbody>
            {yearData.map((y) => (
              <tr key={y.year} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-3 px-4 font-display font-semibold text-foreground">{y.year}</td>
                <td className="text-center py-3 px-2 text-foreground">{y.polity}</td>
                <td className="text-center py-3 px-2 text-foreground">{y.history}</td>
                <td className="text-center py-3 px-2 text-foreground">{y.science}</td>
                <td className="text-center py-3 px-2 text-foreground">{y.economy}</td>
                <td className="text-center py-3 px-2 text-foreground">{y.geo}</td>
                <td className="text-center py-3 px-2 text-foreground">{y.aptitude}</td>
                <td className="text-center py-3 px-2 text-foreground">{y.gk}</td>
                <td className="text-center py-3 px-2 text-foreground">{y.tamil}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <div key={ins.title} className="stat-card">
              <div className="flex items-center gap-2 mb-2">
                <ins.icon className={`h-5 w-5 ${ins.color}`} />
                <h3 className="text-sm font-semibold text-foreground">{ins.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{ins.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Most repeated */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Most Repeated Topics</h2>
        <div className="space-y-2">
          {topRepeated.map((t, i) => (
            <div key={t.topic} className="stat-card flex items-center gap-4">
              <span className="text-2xl font-display font-bold text-primary/50 w-8">#{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{t.topic}</p>
                <p className="text-xs text-muted-foreground">{t.years}</p>
              </div>
              <span className="text-sm font-mono font-medium text-primary">{t.count}x</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
