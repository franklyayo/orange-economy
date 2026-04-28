import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, Search } from 'lucide-react';
import TopicCard from './TopicCard';
import CreateTopicModal from './CreateTopicModal';
//import { getTopics } from '@/lib/supabase';
import { getTopics } from '../lib/supabase';

interface ForumProps {
  onTopicSelect?: (topicId: number) => void;
}

export default function Forum({ onTopicSelect }: ForumProps = {}) {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const categories = ['all', 'music', 'film', 'fashion', 'ip-law', 'business', 'general'];

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    const { data, error } = await getTopics();
    if (!error && data) setTopics(data);
    setLoading(false);
  };

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = topic.title.toLowerCase().includes(search.toLowerCase()) ||
                          topic.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || topic.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-orange-600">Orange Forum</h1>
          <p className="text-muted-foreground mt-2">Discuss, collaborate, and grow the Orange Economy</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          New Topic
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={filter === cat ? 'default' : 'secondary'}
              className="cursor-pointer capitalize"
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12">Loading conversations...</p>
      ) : (
        <div className="grid gap-6">
          {filteredTopics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No topics found. Be the first to start a discussion!
              </CardContent>
            </Card>
          ) : (
            filteredTopics.map((topic) => (
              <TopicCard 
                key={topic.id} 
                topic={topic} 
                onRefresh={loadTopics}
                onTopicClick={onTopicSelect}   // ← This connects to the modal in App.tsx
              />
            ))
          )}
        </div>
      )}

      <CreateTopicModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTopicCreated={loadTopics}
      />
    </div>
  );
}
