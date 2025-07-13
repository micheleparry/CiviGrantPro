import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function TopBar() {
  return (
    <header className="bg-white shadow-sm border-b-2 border-energetic-green">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            Welcome back, Sarah! 
            <span className="ml-2 text-2xl">🌟</span>
          </h2>
          <p className="text-slate-600 mt-1">Ready to secure your next grant? Let's make it happen!</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-slate-500 hover:text-vibrant-blue"
            >
              <Bell size={20} />
              <Badge 
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-warm-orange text-white text-xs p-0 flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
          </div>
          <Avatar className="w-10 h-10">
            <AvatarImage src="" alt="Sarah Johnson" />
            <AvatarFallback className="gradient-warm text-white font-semibold">
              SJ
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
