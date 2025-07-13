import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Grants from "@/pages/grants";
import Applications from "@/pages/applications";
import AiAssistant from "@/pages/ai-assistant";
import AiIntelligence from "@/pages/ai-intelligence";
import Progress from "@/pages/progress";
import Documents from "@/pages/documents";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/grants" component={Grants} />
      <Route path="/applications" component={Applications} />
      <Route path="/ai-assistant" component={AiAssistant} />
      <Route path="/ai-intelligence" component={AiIntelligence} />
      <Route path="/progress" component={Progress} />
      <Route path="/documents" component={Documents} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen flex bg-slate-50">
          <Sidebar />
          <div className="flex-1 overflow-hidden">
            <TopBar />
            <main className="p-6 overflow-y-auto h-full">
              <Router />
            </main>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
