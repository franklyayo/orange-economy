import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase, getUserRole, searchListings } from './lib/supabase';
import MintNFT from './components/MintNFT';
import LoginModal from './components/LoginModal';
import MarketplaceCard from './components/MarketplaceCard';
import Forum from './components/Forum';
import TopicDetail from './components/TopicDetail';
import ProfileModal from './components/ProfileModal';
import AdminDashboard from './components/AdminDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import NotificationBell from './components/NotificationBell';
import MessagesPage from './components/MessagesPage';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function App() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'forum' | 'admin' | 'analytics' | 'messages'>('marketplace');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Marketplace filters
  const [marketplaceCategory, setMarketplaceCategory] = useState('all');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<'admin' | 'creative' | 'normal'>('normal');
  const { address } = useAccount();

  // ===================== AUTH + ROLE =====================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      getUserRole(user.id).then(role => setCurrentRole(role));
    } else {
      setCurrentRole('normal');
    }
  }, [user]);

  // ===================== MARKETPLACE =====================
  const fetchMarketplace = async () => {
    setLoading(true);
    const { data, error } = await searchListings(
      globalSearchQuery,
      marketplaceCategory,
      sortBy,
      minPrice,
      maxPrice
    );
    if (error) console.error('Marketplace error:', error);
    else setListings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMarketplace();
  }, [globalSearchQuery, marketplaceCategory, sortBy, minPrice, maxPrice]);

  const refreshListings = () => fetchMarketplace();

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

          {/* Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === 'marketplace' 
                  ? "Search assets, creators, or description..." 
                  : activeTab === 'forum' 
                    ? "Search topics, content..." 
                    : "Search..."
              }
              className="pl-10 bg-card border-border focus-visible:ring-primary rounded-[10px]"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-[10px]">
              <ShoppingCart className="w-5 h-5" />
            </Button>

            <ConnectButton />

            {user && <NotificationBell userId={user.id} />}

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

      {/* Main Tabs */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="bg-transparent p-1 h-12 gap-2">
              <TabsTrigger value="marketplace" className="rounded-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="forum" className="rounded-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                Forum
              </TabsTrigger>
              {user && (
                <TabsTrigger value="messages" className="rounded-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                  Messages
                </TabsTrigger>
              )}
              {currentRole === 'admin' && (
                <>
                  <TabsTrigger value="admin" className="rounded-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                    Admin
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="rounded-[10px] data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                    Analytics
                  </TabsTrigger>
                </>
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

              {/* Advanced Filters + Listings */}
              <section className="mb-12">
                <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground mb-1 block">Search Assets</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Search by title, creator, or description..."
                          value={globalSearchQuery}
                          onChange={(e) => setGlobalSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                      <Select value={marketplaceCategory} onValueChange={setMarketplaceCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="art">Art</SelectItem>
                          <SelectItem value="digital">Digital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Sort By</label>
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'newest' | 'price_low' | 'price_high')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="price_low">Price: Low to High</SelectItem>
                          <SelectItem value="price_high">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Min Price (₦)</label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={minPrice || ''} 
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Max Price (₦)</label>
                      <Input 
                        type="number" 
                        placeholder="1000000" 
                        value={maxPrice || ''} 
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                  <p className="text-center py-12 text-muted-foreground">Loading assets...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {listings.length > 0 ? (
                      listings.map((item) => (
                        <MarketplaceCard key={item.id} item={item} />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20 bg-card border border-border rounded-[20px]">
                        <p className="text-muted-foreground text-lg">No assets found matching your criteria.</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          ) : activeTab === 'forum' ? (
            <Forum
              onTopicSelect={setSelectedTopicId}
              searchQuery={globalSearchQuery}
            />
          ) : activeTab === 'messages' ? (
            <MessagesPage />
          ) : activeTab === 'admin' ? (
            <AdminDashboard />
          ) : activeTab === 'analytics' ? (
            <AnalyticsDashboard />
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
