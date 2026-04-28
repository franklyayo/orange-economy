import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  onRead?: () => void;
}

export default function NotificationsModal({ open, onClose, userId, onRead }: Props) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      loadNotifications();
    }
  }, [open, userId]);

 const loadNotifications = async () => {
  setLoading(true);
  const { data, error } = await getNotifications(userId, 20);
  
  if (error) {
    console.error("Failed to load notifications:", error);
  } else {
    console.log("Loaded notifications:", data);
    setNotifications(data || []);
  }
  
  setLoading(false);
};

  const handleMarkAsRead = async (id: number) => {
    await markNotificationAsRead(id);
    loadNotifications();
    onRead?.();
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId);
    loadNotifications();
    onRead?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Notifications</DialogTitle>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${notif.is_read ? 'bg-muted/50' : 'bg-card border-orange-500/30'}`}
                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
              >
                <div className="flex gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={notif.actor?.avatar_url} />
                    <AvatarFallback>{notif.actor?.username?.[0] || 'U'}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">@{notif.actor?.username || 'Someone'}</span>{' '}
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {notif.link && (
                  <div className="mt-3 text-xs text-orange-600 hover:underline cursor-pointer" 
                       onClick={() => window.location.href = notif.link}>
                    View discussion →
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
