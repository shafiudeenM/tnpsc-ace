import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import QuizPage from "./pages/QuizPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import SyllabusPage from "./pages/SyllabusPage";
import QuestionGeneratorPage from "./pages/QuestionGeneratorPage";
import PYQAnalysisPage from "./pages/PYQAnalysisPage";
import CurrentAffairsPage from "./pages/CurrentAffairsPage";
import MockTestsPage from "./pages/MockTestsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/quiz" element={<DashboardLayout><QuizPage /></DashboardLayout>} />
          <Route path="/ai-assistant" element={<DashboardLayout><AIAssistantPage /></DashboardLayout>} />
          <Route path="/syllabus" element={<DashboardLayout><SyllabusPage /></DashboardLayout>} />
          <Route path="/question-generator" element={<DashboardLayout><QuestionGeneratorPage /></DashboardLayout>} />
          <Route path="/pyq-analysis" element={<DashboardLayout><PYQAnalysisPage /></DashboardLayout>} />
          <Route path="/current-affairs" element={<DashboardLayout><CurrentAffairsPage /></DashboardLayout>} />
          <Route path="/mock-tests" element={<DashboardLayout><MockTestsPage /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
