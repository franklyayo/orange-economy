import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllProfiles, updateUserRole } from '../lib/supabase';
import RoleBadge from './RoleBadge';

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data } = await getAllProfiles();
    if (data) setProfiles(data);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'creative' | 'normal') => {
    const { error } = await updateUserRole(userId, newRole);
    if (!error) loadProfiles(); // refresh list
  };

  if (loading) return <p className="text-center py-12">Loading users...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-orange-600">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and roles • {profiles.length} total users</p>
        </div>
        <Button onClick={loadProfiles} variant="outline">Refresh</Button>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>{profile.username?.[0] || '?'}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">@{profile.username}</span>
                  <RoleBadge role={profile.role} />
                </div>
                <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>

              <div className="w-40">
                <Select
                  value={profile.role}
                  onValueChange={(value) => handleRoleChange(profile.id, value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
