import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase, getUserRole } from './lib/supabase';
import MintNFT from './components/MintNFT';
import LoginModal from './components/LoginModal';
import MarketplaceCard from './components/MarketplaceCard';
import Forum from './components/Forum';
import TopicDetail from './components/TopicDetail';
import ProfileModal from './components/ProfileModal';
import AdminDashboard from './components/AdminDashboard';
import NotificationBell from './components/NotificationBell';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function App() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'forum' | 'admin'>('marketplace');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<'admin' | 'creative' | 'normal'>('normal');
  const { address } = useAccount();

  // ===================== AUTH LISTENER + ROLE CHECK =====================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check user role whenever user changes
  useEffect(() => {
    if (user) {
      const checkRole = async () => {
        const role = await getUserRole(user.id);
        setCurrentRole(role);
      };
      checkRole();
    } else {
      setCurrentRole('normal');
    }
  }, [user]);

  // ===================== MARKETPLACE =====================
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Supabase error:', error);
    else setListings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const refreshListings = () => fetchListings();

  const filteredListings = listings.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold text-2xl tracking-tight flex items-center gap-2">
              <span className="text-primary">ORANGE</span> ECONOMY
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search music, art, scripts..."
              className="pl-9 bg-card border-border focus-visible:ring-primary rounded-[10px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-[10px]">
              <ShoppingCart className="w-5 h-5" />
            </Button>

            <ConnectButton />

            {/* Notification Bell */}
            {user && <NotificationBell userId={user.id} />}

            {/* Profile Avatar */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfileModal(true)}
                className="rounded-[10px] overflow-hidden"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            )}

            <LoginModal />

            <Button variant="ghost" size="icon" className="sm:hidden rounded-[10px]">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Tabs: Marketplace / Forum / Admin (only for admins) */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'marketplace' | 'forum' | 'admin')}>
            <TabsList className="bg-transparent p-1 h-12 gap-2">
              <TabsTrigger value="marketplace" className="rounded-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="forum" className="rounded-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                Forum
              </TabsTrigger>
              {currentRole === 'admin' && (
                <TabsTrigger value="admin" className="rounded-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                  Admin
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-7xl">
          {activeTab === 'marketplace' ? (
            <>
              {/* Creator Quick Mint */}
              <section className="mb-12">
                <div className="bg-card border border-border rounded-[20px] p-8 md:p-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Creator Quick Mint</h2>
                      <p className="text-muted-foreground">Mint your IP on-chain and it appears instantly</p>
                    </div>
                  </div>
                  <MintNFT onMintSuccess={refreshListings} />
                </div>
              </section>

              {/* MARKETPLACE SECTION */}
              <section className="mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-card border border-border rounded-[20px] p-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Trending Assets</h2>
                    <p className="text-muted-foreground text-sm">Live from Nigerian creators • {filteredListings.length} assets</p>
                  </div>
                  <Tabs defaultValue="all" onValueChange={setActiveCategory}>
                    <TabsList className="bg-transparent p-0 h-auto gap-2">
                      {['all', 'music', 'art', 'digital'].map((cat) => (
                        <TabsTrigger key={cat} value={cat} className="rounded-[10px]">
                          {cat === 'all' ? 'All IPs' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {loading ? (
                  <p className="text-center py-12 text-muted-foreground">Loading live listings from blockchain...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {filteredListings.map((item) => (
                      <MarketplaceCard key={item.id} item={item} />
                    ))}
                  </div>
                )}

                {filteredListings.length === 0 && (
                  <div className="text-center py-20 bg-card border border-border rounded-[20px] mt-4">
                    <p className="text-muted-foreground text-lg">No assets found yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">Mint your first Orange Economy NFT above!</p>
                  </div>
                )}
              </section>
            </>
          ) : activeTab === 'forum' ? (
            /* FORUM SECTION */
            <Forum onTopicSelect={setSelectedTopicId} />
          ) : activeTab === 'admin' ? (
            /* ADMIN DASHBOARD */
            <AdminDashboard />
          ) : null}
        </div>
      </main>

      {/* Modals */}
      <TopicDetail
        topicId={selectedTopicId}
        open={!!selectedTopicId}
        onClose={() => setSelectedTopicId(null)}
      />
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={user?.id || ''}
      />
    </div>
  );
}
