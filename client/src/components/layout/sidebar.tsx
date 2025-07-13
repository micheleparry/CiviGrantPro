import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, Search, Edit, Bot, TrendingUp, FolderOpen, 
  Lightbulb, Trophy, Target, Brain
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, current: true },
  { name: "Find Grants", href: "/grants", icon: Search, current: false },
  { name: "Applications", href: "/applications", icon: Edit, current: false },
  { name: "Smart Narrative Builder", href: "/ai-assistant", icon: Bot, current: false },
  { name: "Funding AlignIQ Blueprint", href: "/ai-intelligence", icon: Brain, current: false },
  { name: "Progress", href: "/progress", icon: TrendingUp, current: false },
  { name: "Documents", href: "/documents", icon: FolderOpen, current: false },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r-4 border-vibrant-blue">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-vibrant rounded-xl flex items-center justify-center">
            <Lightbulb className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">CiviGrantAI</h1>
            <p className="text-xs text-slate-500">Grant Success Made Simple</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-vibrant-blue text-white"
                    : "hover:bg-slate-100 text-slate-700"
                )}
              >
                <Icon 
                  size={20} 
                  className={cn(
                    isActive 
                      ? "text-white" 
                      : item.name === "Find Grants" 
                        ? "text-energetic-green" 
                        : item.name === "Applications" 
                          ? "text-warm-orange"
                          : item.name === "AI Assistant"
                            ? "text-deep-blue"
                            : item.name === "AI Intelligence"
                              ? "text-vibrant-purple"
                              : item.name === "Progress"
                                ? "text-forest-green"
                                : item.name === "Documents"
                                  ? "text-deep-orange"
                                  : "text-slate-500"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 px-4">
          <div className="gradient-vibrant rounded-lg p-4 text-white">
            <h3 className="font-semibold text-sm flex items-center">
              <Trophy className="mr-2" size={16} />
              You're doing great!
            </h3>
            <p className="text-xs mt-1 opacity-90">2 applications submitted this month</p>
          </div>
        </div>
      </nav>
    </div>
  );
}
