import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle } from 'lucide-react';
import { sendMessage, getConversations, getMessagesWithUser, markMessagesAsRead } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

useEffect(() => {
  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      await loadConversations(user.id);

      // Check for URL param to start new chat
      const urlParams = new URLSearchParams(window.location.search);
      const targetUserId = urlParams.get('user');
      if (targetUserId) {
        // Create a temporary user object for new chat
        const targetUser = { id: targetUserId, username: 'User' };
        selectConversation(targetUser);
      }
    }
    setLoading(false);
  };
  init();
}, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async (userId: string) => {
    const { data } = await getConversations(userId);
    setConversations(data || []);
  };

  const loadMessages = async (otherUserId: string) => {
    const { data } = await getMessagesWithUser(otherUserId);
    setMessages(data || []);
    await markMessagesAsRead(otherUserId);
    loadConversations(currentUserId!); // refresh unread counts
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUserId) return;

    await sendMessage(selectedUser.id, newMessage.trim());
    setNewMessage('');
    loadMessages(selectedUser.id);
  };

  const selectConversation = (user: any) => {
    setSelectedUser(user);
    loadMessages(user.id);
  };

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`messages:${currentUserId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}` 
        },
        () => {
          if (selectedUser) loadMessages(selectedUser.id);
          loadConversations(currentUserId);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, selectedUser]);

  if (loading) return <p className="text-center py-12">Loading messages...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 h-[calc(100vh-140px)] flex gap-6">
      {/* Inbox Sidebar */}
      <div className="w-80 bg-card border border-border rounded-2xl p-4 flex flex-col">
        <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> Messages
        </h2>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No conversations yet</p>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.sender_id === currentUserId ? conv.receiver : conv.sender;
              const isUnread = !conv.is_read && conv.receiver_id === currentUserId;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(otherUser)}
                  className={`flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors ${
                    selectedUser?.id === otherUser.id ? 'bg-muted' : ''
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={otherUser?.avatar_url} />
                    <AvatarFallback>{otherUser?.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="font-medium truncate">@{otherUser?.username}</p>
                      {isUnread && <div className="w-2 h-2 bg-orange-600 rounded-full mt-1.5" />}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedUser.avatar_url} />
                <AvatarFallback>{selectedUser.username?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">@{selectedUser.username}</p>
                <p className="text-xs text-green-600">● Online</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      msg.sender_id === currentUserId 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-muted'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-orange-600 px-6">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation from the left to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
