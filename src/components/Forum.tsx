import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import TopicCard from './TopicCard';
import CreateTopicModal from './CreateTopicModal';
import { getTopics } from '../lib/supabase';

interface ForumProps {
  onTopicSelect?: (topicId: number) => void;
  searchQuery?: string;           // ← From global search bar in App.tsx
}

export default function Forum({ onTopicSelect, searchQuery: globalSearchQuery = '' }: ForumProps) {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Local filters (still available when not using global search)
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'most_replied'>('newest');
  
  const [showCreateModal, setShowCreateModal] = useState(false);

  const categories = ['all', 'music', 'film', 'fashion', 'ip-law', 'business', 'general'];

  const loadTopics = async () => {
    setLoading(true);
    const { data, error } = await getTopics(
      globalSearchQuery, 
      categoryFilter, 
      sortBy, 
      roleFilter
    );
    if (!error && data) setTopics(data);
    setLoading(false);
  };

  // Re-load when global search, filters, or sort changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadTopics();
    }, 300);

    return () => clearTimeout(timeout);
  }, [globalSearchQuery, categoryFilter, roleFilter, sortBy]);

  // Reset local search when global search is active
  useEffect(() => {
    if (globalSearchQuery.trim()) {
      // Optionally hide local search input when global is used
    }
  }, [globalSearchQuery]);

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

      {/* Advanced Filters Bar */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Local Search (only shown when no global search is active) */}
          {!globalSearchQuery.trim() && (
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search topics, content, or creators..."
                value={globalSearchQuery} // This will be empty when global is not used
                onChange={() => {}} // Controlled by parent (App.tsx)
                className="pl-11"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">Using global search from header</p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.slice(1).map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Author Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'newest' | 'most_replied')}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="most_replied">Most Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-center py-12">Searching...</p>
      ) : (
        <div className="grid gap-6">
          {topics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No topics found matching your search.
              </CardContent>
            </Card>
          ) : (
            topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onRefresh={loadTopics}
                onTopicClick={onTopicSelect}
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
