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
  { name: "AlignIQ Blueprint", href: "/ai-intelligence", icon: Brain, current: false },
  { name: "Progress", href: "/progress", icon: TrendingUp, current: false },
  { name: "Documents", href: "/documents", icon: FolderOpen, current: false },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white shadow-lg border-r-4 border-vibrant-blue">
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
                            : item.name === "Smart Narrative Builder"
                              ? "text-deep-blue"
                              : item.name === "AlignIQ Blueprint"
                                ? "text-bright-purple"
                                : item.name === "Progress"
                                  ? "text-forest-green"
                                  : item.name === "Documents"
                                    ? "text-deep-orange"
                                    : "text-slate-500"
                    )}
                  />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="mt-auto p-4 border-t border-slate-200">
          <div className="bg-gradient-to-r from-vibrant-blue to-bright-purple p-4 rounded-lg">
            <Trophy className="text-white mb-2" size={24} />
            <h3 className="text-white font-semibold text-sm">You're doing great!</h3>
            <p className="text-white/90 text-xs">2 applications submitted this month</p>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg text-xs transition-colors",
                  isActive
                    ? "text-vibrant-blue"
                    : "text-slate-600"
                )}
              >
                <Icon size={20} />
                <span className="mt-1">
                  {item.name === "Smart Narrative Builder" ? "Narrative" : 
                   item.name === "AlignIQ Blueprint" ? "Blueprint" : 
                   item.name === "Find Grants" ? "Grants" :
                   item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}