import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import RoleBadge from './RoleBadge';   // ← This line must be here

interface TopicCardProps {
  topic: any;
  onRefresh: () => void;
  onTopicClick?: (id: number) => void;
}

export default function TopicCard({ topic, onRefresh, onTopicClick }: TopicCardProps) {
  const author = topic.profiles || { 
    username: 'Anonymous', 
    avatar_url: '', 
    role: 'normal' 
  };

  const displayName = author.username
    ? `@${author.username}`
    : author.full_name
      ? author.full_name.split(' ')[0]
      : 'user';

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onTopicClick?.(topic.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={author.avatar_url} />
            <AvatarFallback>{author.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-medium text-orange-600">{displayName}</p>
                <RoleBadge role={author.role} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-1">{topic.title}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{topic.content}</p>
        <div className="flex items-center gap-4 mt-6">
          <Badge variant="outline" className="capitalize">{topic.category}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span>{topic.forum_posts?.length || 0} replies</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
