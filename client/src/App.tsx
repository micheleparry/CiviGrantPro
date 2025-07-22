import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Grants from "@/pages/grants";
import Applications from "@/pages/applications";
import AiAssistant from "@/pages/ai-assistant";
import AiIntelligence from "@/pages/ai-intelligence";
import AiRecommendations from "@/pages/ai-recommendations";
import NlpAnalysis from "@/pages/nlp-analysis";
import Progress from "@/pages/progress";
import Documents from "@/pages/documents";
import GrantsSearch from "@/pages/grants-search";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading only during initial authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/grants" component={Grants} />
          <Route path="/grants-search" component={GrantsSearch} />
          <Route path="/ai-recommendations" component={AiRecommendations} />
          <Route path="/nlp-analysis" component={NlpAnalysis} />
          <Route path="/applications" component={Applications} />
          <Route path="/ai-assistant" component={AiAssistant} />
          <Route path="/ai-intelligence" component={AiIntelligence} />
          <Route path="/progress" component={Progress} />
          <Route path="/documents" component={Documents} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Router />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <TopBar />
          <main className="p-6 overflow-y-auto h-full">
            <Router />
          </main>
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden">
        <TopBar />
        <main className="p-4 pb-20 overflow-y-auto">
          <Router />
        </main>
        <Sidebar />
      </div>
    </div>
  );
}

export default App;
