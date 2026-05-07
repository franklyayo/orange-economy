import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import RoleBadge from './RoleBadge';
import { getTopicWithPosts, createPost, deletePost, getUserRole } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface Props {
  topicId: number | null;
  open: boolean;
  onClose: () => void;
  onTopicDeleted?: () => void;   // Refresh forum list after delete
}

export default function TopicDetail({ topicId, open, onClose, onTopicDeleted }: Props) {
  const [topic, setTopic] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!topicId || !open) return;
    loadTopicAndCheckRole();
  }, [topicId, open]);

  const loadTopicAndCheckRole = async () => {
    const { data } = await getTopicWithPosts(topicId!);
    if (data) {
      setTopic(data);
      setPosts(data.forum_posts || []);
    }

    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = await getUserRole(user.id);
      setIsAdmin(role === 'admin');
    }
  };

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    await createPost(topicId!, newComment);
    setNewComment('');
    setLoading(false);
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Delete this reply?")) return;
    const { error } = await deletePost(postId);
    if (!error) loadTopicAndCheckRole(); // Refresh
  };

  const handleDeleteTopic = async () => {
    if (!confirm("Delete entire topic?")) return;
    // We'll add deleteTopic function soon
    const { error } = await supabase.from('forum_topics').delete().eq('id', topicId);
    if (!error) {
      onTopicDeleted?.();
      onClose();
    }
  };

  if (!topic) return null;

  const topicAuthor = topic.profiles || {};
  const topicDisplayName = topicAuthor.username
    ? `@${topicAuthor.username}`
    : topicAuthor.full_name?.split(' ')[0] || 'user';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
   
   <DialogHeader>
  <div className="flex justify-between items-start">
    <div>
      <DialogTitle className="text-2xl">{topic.title}</DialogTitle>
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        {topicDisplayName} <RoleBadge role={topicAuthor.role} />
        • {new Date(topic.created_at).toLocaleDateString()}
      </p>
    </div>

    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (topicAuthor.id) {
          window.location.href = `/messages?user=${topicAuthor.id}`;
        }
      }}
    >
      Message @{topicAuthor.username}
    </Button>

    {isAdmin && (
      <Button variant="destructive" size="sm" onClick={handleDeleteTopic}>
        <Trash2 className="w-4 h-4" />
      </Button>
    )}
  </div>
</DialogHeader>
        <div className="flex-1 overflow-y-auto py-6 space-y-8">
          {/* Original post */}
          <div className="bg-muted/50 p-6 rounded-xl">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>

          {/* Replies */}
          <div className="space-y-6">
            {posts.map((post) => {
              const author = post.profiles || {};
              const displayName = author.username
                ? `@${author.username}`
                : author.full_name?.split(' ')[0] || 'user';

              return (
                <div key={post.id} className="flex gap-4 group">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={author.avatar_url} />
                    <AvatarFallback>{author.username?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{displayName}</span>
                      <RoleBadge role={author.role} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{post.content}</p>
                  </div>

                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 text-red-500"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comment box */}
        <div className="border-t pt-4 mt-auto">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a reply..."
            rows={4}
          />
          <Button 
            onClick={handlePost} 
            disabled={loading || !newComment.trim()} 
            className="mt-3 w-full bg-orange-600"
          >
            {loading ? 'Posting...' : 'Post Reply'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
