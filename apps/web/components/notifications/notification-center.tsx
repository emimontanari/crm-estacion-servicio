"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import { Bell, Check, X } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverTrigger, ScrollArea, Badge } from "@workspace/ui";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const notifications = useQuery(api.notifications.list, {
    limit: 20,
  });

  const markAsRead = useMutation(api.notifications.markAsRead);

  const unreadCount = notifications?.filter(n => !n.readAt).length || 0;

  const handleMarkAsRead = async (notificationId: any) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return "📧";
      case "sms":
        return "📱";
      case "push":
        return "🔔";
      default:
        return "📬";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "scheduled":
        return "bg-blue-500";
      case "sending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} nuevas</Badge>
          )}
        </div>
        <ScrollArea className="h-96">
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.readAt ? "bg-muted/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getChannelIcon(notification.channel)}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {notification.subject && (
                            <p className="font-medium text-sm line-clamp-1">
                              {notification.subject}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.body}
                          </p>
                        </div>
                        {!notification.readAt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => handleMarkAsRead(notification._id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(notification.status)}`} />
                        <span className="capitalize">{notification.status}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(notification.createdAt, {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications && notifications.length > 0 && (
          <div className="border-t p-2">
            <Button variant="ghost" className="w-full" size="sm">
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
