import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationsModal from './NotificationsModal';
import { getUnreadCount } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface Props {
  userId: string;
}

export default function NotificationBell({ userId }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const loadUnreadCount = async () => {
    const { count } = await getUnreadCount(userId);
    setUnreadCount(count || 0);
  };

  useEffect(() => {
    if (!userId) return;
    loadUnreadCount();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${userId}` 
        },
        loadUnreadCount
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-[10px]"
        onClick={() => setShowModal(true)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationsModal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        userId={userId}
        onRead={loadUnreadCount}
      />
    </>
  );
}
