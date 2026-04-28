import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTopic } from '../lib/supabase';   // ← use relative path like others

interface Props {
  open: boolean;
  onClose: () => void;
  onTopicCreated: () => void;
}

export default function CreateTopicModal({ open, onClose, onTopicCreated }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    const { error } = await createTopic({ title, content, category });
    
    if (!error) {
      onTopicCreated();
      onClose();
      setTitle('');
      setContent('');
    } else {
      console.error("Failed to create topic:", error);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Start a new discussion</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Title</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What's on your mind?" 
              required 
            />
          </div>

          <div>
            <Label>Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-input bg-background rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="general">General</option>
              <option value="music">Music</option>
              <option value="film">Film & Video</option>
              <option value="fashion">Fashion</option>
              <option value="ip-law">IP & Legal</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}                    // ← Much bigger now
              className="min-h-[260px] resize-y"
              placeholder="Share your thoughts, ask questions, or propose collaborations..."
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-700" 
            disabled={loading}
          >
            {loading ? 'Posting Topic...' : 'Post Topic'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
