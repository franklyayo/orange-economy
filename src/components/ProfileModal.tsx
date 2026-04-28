import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RoleBadge from './RoleBadge';
import { getProfile, updateProfile, updateUserRole, getUserRole } from '../lib/supabase';
import { supabase } from '../lib/supabase';   // ← Important: add this import

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export default function ProfileModal({ open, onClose, userId }: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadProfile();
      checkAdminStatus();
    }
  }, [open, userId]);

  const loadProfile = async () => {
    const { data, error } = await getProfile(userId);
    if (data) setProfile(data);
    if (error) console.error("Profile load error:", error);
  };

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = await getUserRole(user.id);
      console.log("Current user role:", role);   // ← Helpful for debugging
      setIsAdmin(role === 'admin');
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    await updateProfile(profile);
    setLoading(false);
    onClose();
  };

  const handleRoleChange = async (newRole: 'admin' | 'creative' | 'normal') => {
    if (!profile) return;
    setLoading(true);
    const { error } = await updateUserRole(profile.id, newRole);
    if (!error) {
      setProfile({ ...profile, role: newRole });
    } else {
      console.error("Role update failed:", error);
    }
    setLoading(false);
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Edit Profile
            <RoleBadge role={profile.role || 'normal'} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-3xl">{profile.username?.[0] || '?'}</AvatarFallback>
            </Avatar>
          </div>

          <div>
            <Label>Username</Label>
            <Input value={profile.username || ''} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
          </div>

          <div>
            <Label>Full Name</Label>
            <Input value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <Input value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={profile.website || ''} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
            </div>
          </div>

          {/* Role Selector - Only visible to Admins */}
          {isAdmin && (
            <div>
              <Label>Change User Role (Admin Only)</Label>
              <Select value={profile.role || 'normal'} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal User</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleSave} disabled={loading} className="w-full bg-orange-600">
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
