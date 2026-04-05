import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import QuizPage from "./pages/QuizPage";
import QuizAnalyticsDashboard from "./pages/QuizAnalyticsDashboard";
import AIAssistantPage from "./pages/AIAssistantPage";
import SyllabusPage from "./pages/SyllabusPage";
import QuestionGeneratorPage from "./pages/QuestionGeneratorPage";
import PYQAnalysisPage from "./pages/PYQAnalysisPage";
import CurrentAffairsPage from "./pages/CurrentAffairsPage";
import MockTestsPage from "./pages/MockTestsPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
    <Route path="/quiz" element={<ProtectedRoute><DashboardLayout><QuizPage /></DashboardLayout></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><QuizAnalyticsDashboard /></DashboardLayout></ProtectedRoute>} />
    <Route path="/ai-assistant" element={<ProtectedRoute><DashboardLayout><AIAssistantPage /></DashboardLayout></ProtectedRoute>} />
    <Route path="/syllabus" element={<ProtectedRoute><DashboardLayout><SyllabusPage /></DashboardLayout></ProtectedRoute>} />
    <Route path="/question-generator" element={<ProtectedRoute><DashboardLayout><QuestionGeneratorPage /></DashboardLayout></ProtectedRoute>} />
    <Route path="/pyq-analysis" element={<ProtectedRoute><DashboardLayout><PYQAnalysisPage /></DashboardLayout></ProtectedRoute>} />
    <Route path="/current-affairs" element={<ProtectedRoute><DashboardLayout><CurrentAffairsPage /></DashboardLayout></ProtectedRoute>} />
    <Route path="/mock-tests" element={<ProtectedRoute><DashboardLayout><MockTestsPage /></DashboardLayout></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
