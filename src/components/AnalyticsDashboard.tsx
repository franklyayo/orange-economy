import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import { getPlatformStats, getRecentActivity } from '../lib/supabase';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    const statsData = await getPlatformStats();
    const activityData = await getRecentActivity(8);

    setStats(statsData);
    if (activityData.data) setRecentActivity(activityData.data);
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return <p className="text-center py-12">Loading analytics...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-orange-600">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform performance and activity overview</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline">Refresh Data</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Total Users</CardTitle>
            <Users className="w-8 h-8 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Total Topics</CardTitle>
            <MessageSquare className="w-8 h-8 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalTopics}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Total Replies</CardTitle>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalReplies}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Engagement</CardTitle>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {stats?.totalTopics ? Math.round((stats.totalReplies / stats.totalTopics) * 10) / 10 : 0}
            </p>
            <p className="text-sm text-muted-foreground">avg replies per topic</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Most Active Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats?.categoryStats?.map((cat: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <span className="capitalize font-medium">{cat.category}</span>
                <span className="font-bold text-orange-600">{cat.count} topics</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((topic) => (
              <div key={topic.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">{topic.title}</p>
                  <p className="text-sm text-muted-foreground">
                    by @{topic.profiles?.username || 'user'} • {new Date(topic.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-full capitalize">
                  {topic.category}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
