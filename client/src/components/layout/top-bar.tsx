import { Bell, User, LogOut, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export default function TopBar() {
  const { user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Fetch notifications
  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadData, refetch: refetchUnreadCount } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest(`/api/notifications/${notificationId}/read`, { method: 'POST' }),
    onSuccess: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  // Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/notifications/mark-all-read', { method: 'POST' }),
    onSuccess: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  const handleLogout = async () => {
    // Clear React Query cache first
    queryClient.clear();
    // Add a small delay to ensure cache is cleared
    await new Promise(resolve => setTimeout(resolve, 100));
    // Navigate to logout endpoint
    window.location.href = "/api/logout";
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const unreadCount = unreadData?.count || 0;
  const userDisplayName = user?.firstName || user?.email?.split('@')[0] || "User";
  const userInitials = user?.firstName?.slice(0, 1) + (user?.lastName?.slice(0, 1) || '') || user?.email?.slice(0, 2).toUpperCase() || "U";

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
            <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-slate-500 hover:text-vibrant-blue"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="secondary"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-warm-orange text-white text-xs p-0 flex items-center justify-center"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-3 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleMarkAllRead}
                      className="text-vibrant-blue hover:text-vibrant-blue/80"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center p-4 text-slate-500">
                      <Bell size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification: Notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50 border-l-4 border-vibrant-blue' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              {notification.type === 'success' && <Check size={14} className="text-green-500" />}
                              {notification.type === 'warning' && <X size={14} className="text-yellow-500" />}
                              {notification.type === 'error' && <X size={14} className="text-red-500" />}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-vibrant-blue rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
