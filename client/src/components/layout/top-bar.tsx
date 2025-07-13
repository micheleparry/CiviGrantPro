import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export default function TopBar() {
  const { user } = useAuth();
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const userDisplayName = user?.email?.split('@')[0] || "User";
  const userInitials = user?.email?.split('@')[0]?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="bg-white shadow-sm border-b-2 border-energetic-green">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            Welcome back, {userDisplayName}! 
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" alt={user?.email || "User"} />
                  <AvatarFallback className="gradient-warm text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{userDisplayName}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
