import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ShoppingCart, Menu, Play, Image as ImageIcon, FileText, Filter, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from './lib/supabase';
import MintNFT from './components/MintNFT';
import LoginModal from './components/LoginModal';
import MarketplaceCard from './components/MarketplaceCard';   // ← NEW
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  // Fetch live listings
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

  // Auto-refresh after mint
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
            <LoginModal />
            <Button variant="ghost" size="icon" className="sm:hidden rounded-[10px]">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section - keep your existing hero here if you want */}

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

          {/* === MARKETPLACE SECTION WITH BUY/LIST LOGIC === */}
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

          {/* Your existing How it Works, CTA, Footer sections remain unchanged */}
        </div>
      </main>

      {/* Footer unchanged */}
    </div>
  );
}
