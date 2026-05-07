import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// ===================== PROFILE HELPERS =====================
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateProfile(profile: Partial<any>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', profile.id)
    .select()
    .single();
  return { data, error };
}

// ===================== FORUM HELPERS =====================
export async function createTopic(topic: { title: string; content: string; category?: string }) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('forum_topics')
    .insert({ ...topic, author_id: user.user?.id })
    .select()
    .single();
  return { data, error };
}

// Enhanced getTopics with advanced search and filtering
export async function getTopics(
  searchQuery = '', 
  categoryFilter = 'all', 
  sortBy = 'newest',
  roleFilter = 'all'
) {
  let query = supabase
    .from('forum_topics')
    .select(`
      *,
      profiles!author_id (username, avatar_url, full_name, role),
      forum_posts (id)
    `);

  // Text search in title and content
  if (searchQuery.trim()) {
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
  }

  // Category filter
  if (categoryFilter !== 'all') {
    query = query.eq('category', categoryFilter);
  }

  // Role filter (search by author role)
  if (roleFilter !== 'all') {
    query = query.eq('profiles.role', roleFilter);
  }

  // Sorting
  if (sortBy === 'most_replied') {
    query = query.order('id', { ascending: false }); // fallback, since count is hard
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getTopicWithPosts(topicId: number) {
  const { data, error } = await supabase
    .from('forum_topics')
    .select(`
      *,
      profiles!author_id (*),
      forum_posts (
        *,
        profiles!author_id (username, avatar_url, full_name, role)
      )
    `)
    .eq('id', topicId)
    .single();
  return { data, error };
}


// ===================== NOTIFICATIONS =====================
// ===================== NOTIFICATIONS =====================
export async function createNotification(notification: {
  user_id: string;
  actor_id: string | null;
  type: 'reply';
  title: string;
  message: string;
  link: string;
}) {
  const { data: currentUser } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('notifications')
    .insert({
      ...notification,
      actor_id: currentUser.user?.id || notification.actor_id
    });

  if (error) {
    console.error('❌ Create notification failed:', error);
  } else {
    console.log('✅ Notification created successfully for user:', notification.user_id);
  }

  return { error };   // We don't need the data
}

export async function getNotifications(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      title,
      message,
      link,
      is_read,
      created_at,
      actor_id,
      profiles!actor_id (
        username,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getNotifications error:', error);
  } else {
    console.log('✅ Notifications fetched:', data?.length || 0);
  }

  return { data, error };
}

export async function markNotificationAsRead(notificationId: number) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  return { error };
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);
  return { error };
}

export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return { count, error };
}

//end of notifications block

export async function createPost(topicId: number, content: string) {
  const { data: user } = await supabase.auth.getUser();
 
  if (!user.user?.id) return { data: null, error: { message: "Not authenticated" } };

  // Create the post
  const { data: postData, error: postError } = await supabase
    .from('forum_posts')
    .insert({ topic_id: topicId, content, author_id: user.user.id })
    .select()
    .single();

  if (postError) return { data: null, error: postError };

  // Get topic owner to notify them
  const { data: topic } = await supabase
    .from('forum_topics')
    .select('author_id, title')
    .eq('id', topicId)
    .single();

  // Notify topic owner if it's not their own reply
   // Notify topic owner if it's not their own reply
  if (topic && topic.author_id !== user.user.id) {
    const { error: notifError } = await createNotification({
      user_id: topic.author_id,
      actor_id: user.user.id,
      type: 'reply',
      title: 'New Reply',
      message: `replied to your topic "${topic.title}"`,
      link: `/forum/topic/${topicId}`
    });

    if (notifError) {
      console.error("Failed to create notification:", notifError);
    }
  }

  return { data: postData, error: null };
}
// ===================== ROLE & ADMIN HELPERS =====================
export async function getUserRole(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return data?.role || 'normal';
}

export async function deleteTopic(topicId: number) {
  const { error } = await supabase
    .from('forum_topics')
    .delete()
    .eq('id', topicId);
  return { error };
}

export async function deletePost(postId: number) {
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId);
  return { error };
}

// ===================== ADMIN ROLE MANAGEMENT =====================
export async function updateUserRole(userId: string, newRole: 'admin' | 'creative' | 'normal') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

// ===================== ADMIN DASHBOARD =====================
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, avatar_url, created_at')  // ← removed email
    .order('created_at', { ascending: false });
  if (error) console.error('getAllProfiles error:', error); // helpful for debugging
  return { data, error };
}

// ===================== ANALYTICS HELPERS =====================
export async function getPlatformStats() {
  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Total topics
  const { count: totalTopics } = await supabase
    .from('forum_topics')
    .select('*', { count: 'exact', head: true });

  // Total replies
  const { count: totalReplies } = await supabase
    .from('forum_posts')
    .select('*', { count: 'exact', head: true });

  // Most active categories
  const { data: categoryStats } = await supabase
    .from('forum_topics')
    .select('category')
    .not('category', 'is', null);

  // Count categories manually (simple approach)
  const categoryCount: Record<string, number> = {};
  categoryStats?.forEach((t: any) => {
    const cat = t.category || 'general';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  return {
    totalUsers: totalUsers || 0,
    totalTopics: totalTopics || 0,
    totalReplies: totalReplies || 0,
    categoryStats: Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  };
}

export async function getRecentActivity(limit = 10) {
  const { data, error } = await supabase
    .from('forum_topics')
    .select(`
      id,
      title,
      created_at,
      category,
      profiles!author_id (username)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

// ===================== MARKETPLACE ADVANCED SEARCH =====================
export async function searchListings(
  searchQuery = '',
  categoryFilter = 'all',
  sortBy = 'newest',
  minPrice?: number,
  maxPrice?: number
) {
  let query = supabase
    .from('listings')
    .select('*');

  // Text search
  if (searchQuery.trim()) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,creator.ilike.%${searchQuery}%`);
  }

  // Category filter
  if (categoryFilter !== 'all') {
    query = query.eq('category', categoryFilter);
  }

  // Price range
  if (minPrice !== undefined) {
    query = query.gte('price', minPrice);
  }
  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice);
  }

  // Sorting
  if (sortBy === 'price_low') {
    query = query.order('price', { ascending: true });
  } else if (sortBy === 'price_high') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  return { data, error };
}

// ===================== DIRECT MESSAGING =====================
export async function sendMessage(receiverId: string, content: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user?.id) return { error: { message: "Not authenticated" } };

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.user.id,
      receiver_id: receiverId,
      content
    })
    .select()
    .single();

  return { data, error };
}

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      is_read,
      sender_id,
      receiver_id,
      sender:profiles!messages_sender_id_fkey (username, avatar_url),
      receiver:profiles!messages_receiver_id_fkey (username, avatar_url)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) console.error('getConversations error:', error);
  return { data, error };
}


export async function getMessagesWithUser(otherUserId: string, limit = 50) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user?.id) return { data: null, error: { message: "Not authenticated" } };

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id (username, avatar_url),
      receiver:profiles!receiver_id (username, avatar_url)
    `)
    .or(`and(sender_id.eq.${user.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.user.id})`)
    .order('created_at', { ascending: true })
    .limit(limit);

  return { data, error };
}

export async function markMessagesAsRead(otherUserId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user?.id) return { error: { message: "Not authenticated" } };

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('receiver_id', user.user.id)
    .eq('sender_id', otherUserId)
    .eq('is_read', false);

  return { error };
}
