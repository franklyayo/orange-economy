import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ShoppingCart, Menu, Play, Image as ImageIcon, FileText, Filter, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// --- Dummy Data ---
const CATEGORIES = [
  { id: 'all', label: 'All IPs' },
  { id: 'music', label: 'Music & Audio' },
  { id: 'art', label: 'Visual Art' },
  { id: 'digital', label: 'Digital Content' },
  { id: 'film', label: 'Film & Video' },
];

const FEATURED_IPS = [
  {
    id: '1',
    title: 'Afrobeats Sample Pack Vol 1',
    creator: 'Sarz Productions',
    creatorAvatar: 'https://picsum.photos/seed/sarz/100/100',
    category: 'music',
    price: '₦25,000',
    licenseType: 'Royalty-Free',
    image: 'https://picsum.photos/seed/afrobeats/600/400',
    rating: 4.9,
    reviews: 128,
    description: 'A premium collection of authentic Afrobeats drum loops, percussion, and melodies. Perfect for producers looking to add that Naija bounce to their tracks.',
  },
  {
    id: '2',
    title: 'Lagos Cityscape Collection',
    creator: 'Tayo Visuals',
    creatorAvatar: 'https://picsum.photos/seed/tayo/100/100',
    category: 'art',
    price: '₦50,000',
    licenseType: 'Commercial Use',
    image: 'https://picsum.photos/seed/lagos/600/400',
    rating: 4.8,
    reviews: 56,
    description: 'High-resolution photography capturing the vibrant energy, traffic, and architecture of Lagos, Nigeria. Includes 50+ edited RAW files.',
  },
  {
    id: '3',
    title: 'Nollywood Script Template',
    creator: 'Chika Writes',
    creatorAvatar: 'https://picsum.photos/seed/chika/100/100',
    category: 'digital',
    price: '₦10,000',
    licenseType: 'Personal & Commercial',
    image: 'https://picsum.photos/seed/script/600/400',
    rating: 4.7,
    reviews: 89,
    description: 'Industry-standard script formatting templates tailored for the Nigerian film industry. Includes character breakdown sheets and scene planners.',
  },
  {
    id: '4',
    title: 'Yoruba Mythology 3D Models',
    creator: 'Kola 3D',
    creatorAvatar: 'https://picsum.photos/seed/kola/100/100',
    category: 'digital',
    price: '₦120,000',
    licenseType: 'Exclusive License Available',
    image: 'https://picsum.photos/seed/mythology/600/400',
    rating: 5.0,
    reviews: 24,
    description: 'Rigged and game-ready 3D models of Orishas including Sango, Ogun, and Osun. Compatible with Unreal Engine and Unity.',
  },
  {
    id: '5',
    title: 'Talking Drum Loops',
    creator: 'Ayan Sounds',
    creatorAvatar: 'https://picsum.photos/seed/ayan/100/100',
    category: 'music',
    price: '₦15,000',
    licenseType: 'Royalty-Free',
    image: 'https://picsum.photos/seed/drum/600/400',
    rating: 4.9,
    reviews: 210,
    description: 'Authentic talking drum (Gangan) loops recorded by master drummers in Oyo. Various tempos and traditional rhythms.',
  },
  {
    id: '6',
    title: 'Ankara Patterns Vector Set',
    creator: 'Ngozi Designs',
    creatorAvatar: 'https://picsum.photos/seed/ngozi/100/100',
    category: 'art',
    price: '₦20,000',
    licenseType: 'Commercial Use',
    image: 'https://picsum.photos/seed/ankara/600/400',
    rating: 4.6,
    reviews: 145,
    description: '100+ scalable vector graphics inspired by traditional Ankara fabric designs. Perfect for fashion design, branding, and packaging.',
  },
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIP, setSelectedIP] = useState<typeof FEATURED_IPS[0] | null>(null);

  const filteredIPs = FEATURED_IPS.filter((ip) => {
    const matchesCategory = activeCategory === 'all' || ip.category === activeCategory;
    const matchesSearch = ip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ip.creator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold text-2xl tracking-tight flex items-center gap-2">
              <span className="text-primary">ORANGE</span> EXCHANGE
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
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            <Button className="hidden sm:flex rounded-[10px] px-6 font-semibold">Connect Wallet</Button>
            <Button variant="ghost" size="icon" className="sm:hidden rounded-[10px]">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <section className="mb-6">
            <div className="bg-gradient-to-br from-[#FF6B2B] to-[#E65100] rounded-[20px] p-8 md:p-12 text-white relative overflow-hidden flex flex-col items-start">
              <Badge className="mb-6 bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 text-xs uppercase tracking-widest rounded-full">
                Live Auction
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight max-w-3xl">
                The Future of Nigerian Creativity
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mb-8">
                Securely license film rights, music publishing, and digital art from Africa's most influential creators.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                <Button size="lg" className="rounded-[10px] bg-white text-black hover:bg-gray-100 px-8 font-semibold">
                  Browse IP
                </Button>
                <Button size="lg" variant="outline" className="rounded-[10px] border-white text-white hover:bg-white/10 px-8 font-semibold bg-transparent">
                  Register Rights
                </Button>
              </div>
            </div>
          </section>

          {/* Marketplace Section */}
          <section className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-card border border-border rounded-[20px] p-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Trending Assets</h2>
                <p className="text-muted-foreground text-sm">Discover top-rated intellectual property from verified creators.</p>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <Button variant="outline" size="sm" className="rounded-[10px] shrink-0 bg-secondary border-none">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Separator orientation="vertical" className="h-6 mx-2 hidden md:block" />
                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
                  <ScrollArea className="w-full max-w-[100vw] sm:max-w-none">
                    <TabsList className="bg-transparent p-0 h-auto gap-2">
                      {CATEGORIES.map((cat) => (
                        <TabsTrigger 
                          key={cat.id} 
                          value={cat.id}
                          className="rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=inactive]:border-border data-[state=inactive]:bg-secondary"
                        >
                          {cat.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" className="invisible" />
                  </ScrollArea>
                </Tabs>
              </div>
            </div>

            {/* IP Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {filteredIPs.map((ip, index) => (
                <motion.div
                  key={ip.id}
                  className="col-span-1 md:col-span-6 lg:col-span-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full group overflow-hidden border-border bg-card rounded-[20px] flex flex-col">
                    <div className="relative aspect-video overflow-hidden border-b border-border">
                      <img 
                        src={ip.image} 
                        alt={ip.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border-none rounded-[8px]">
                          {ip.category === 'music' && <Play className="w-3 h-3 mr-1 text-[#818CF8]" />}
                          {ip.category === 'art' && <ImageIcon className="w-3 h-3 mr-1 text-[#F472B6]" />}
                          {ip.category === 'digital' && <FileText className="w-3 h-3 mr-1 text-[#34D399]" />}
                          {CATEGORIES.find(c => c.id === ip.category)?.label}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="secondary" className="bg-card text-foreground font-semibold rounded-[8px] border border-border">
                          {ip.price}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {ip.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Avatar className="w-6 h-6 border border-border">
                          <AvatarImage src={ip.creatorAvatar} referrerPolicy="no-referrer" />
                          <AvatarFallback>{ip.creator[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{ip.creator}</span>
                        <ShieldCheck className="w-4 h-4 text-primary" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-primary">
                          <Star className="w-4 h-4 fill-current mr-1" />
                          <span className="font-bold">{ip.rating}</span>
                          <span className="text-muted-foreground ml-1 font-normal">({ip.reviews})</span>
                        </div>
                        <span className="text-muted-foreground text-xs font-medium px-2 py-1 bg-secondary rounded-[8px]">
                          {ip.licenseType}
                        </span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-5 pt-0 mt-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full rounded-[10px] font-semibold" variant="secondary" onClick={() => setSelectedIP(ip)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[20px] border-border bg-card">
                          {selectedIP && (
                            <>
                              <div className="relative h-64 w-full border-b border-border">
                                <img 
                                  src={selectedIP.image} 
                                  alt={selectedIP.title} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 text-foreground">
                                  <Badge className="mb-3 bg-primary text-primary-foreground border-none rounded-[8px]">
                                    {CATEGORIES.find(c => c.id === selectedIP.category)?.label}
                                  </Badge>
                                  <DialogTitle className="text-2xl sm:text-3xl font-bold mb-2">
                                    {selectedIP.title}
                                  </DialogTitle>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border-2 border-border">
                                      <AvatarImage src={selectedIP.creatorAvatar} referrerPolicy="no-referrer" />
                                      <AvatarFallback>{selectedIP.creator[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-muted-foreground">{selectedIP.creator}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-6">
                                <DialogDescription className="text-base text-foreground mb-6">
                                  {selectedIP.description}
                                </DialogDescription>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div className="bg-secondary p-4 rounded-[12px] border border-border">
                                    <p className="text-sm text-muted-foreground mb-1">License Type</p>
                                    <p className="font-semibold">{selectedIP.licenseType}</p>
                                  </div>
                                  <div className="bg-secondary p-4 rounded-[12px] border border-border">
                                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                                    <p className="font-semibold text-xl text-primary">{selectedIP.price}</p>
                                  </div>
                                </div>
                                
                                <DialogFooter className="flex-col sm:flex-row gap-3 sm:justify-between items-center">
                                  <div className="flex items-center text-primary w-full sm:w-auto">
                                    <Star className="w-5 h-5 fill-current mr-1" />
                                    <span className="font-bold text-lg">{selectedIP.rating}</span>
                                    <span className="text-muted-foreground ml-1">({selectedIP.reviews} reviews)</span>
                                  </div>
                                  <div className="flex gap-3 w-full sm:w-auto">
                                    <Button variant="outline" className="w-full sm:w-auto rounded-[10px] font-semibold border-border">Save</Button>
                                    <Button className="w-full sm:w-auto rounded-[10px] px-8 font-semibold">Acquire License</Button>
                                  </div>
                                </DialogFooter>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {filteredIPs.length === 0 && (
              <div className="text-center py-20 bg-card border border-border rounded-[20px] mt-4">
                <p className="text-muted-foreground text-lg">No assets found matching your criteria.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="text-primary"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </section>

          {/* How it Works (Bento Style) */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-[20px] p-8 md:p-12">
              <div className="mb-10">
                <h2 className="text-3xl font-bold mb-2">How It Works</h2>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  A secure, transparent ecosystem for creators and buyers in the Nigerian orange economy.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {[
                  {
                    step: '01',
                    title: 'Mint & List',
                    desc: 'Creators upload their assets. We verify authenticity and register the IP on our secure ledger.'
                  },
                  {
                    step: '02',
                    title: 'Discover & License',
                    desc: 'Buyers browse curated collections and purchase clear, legally-binding licenses instantly.'
                  },
                  {
                    step: '03',
                    title: 'Create & Earn',
                    desc: 'Buyers use the assets in their projects, while creators receive instant payouts and royalties.'
                  }
                ].map((item, i) => (
                  <div key={i} className="col-span-1 md:col-span-4 relative p-8 rounded-[16px] bg-secondary border border-border flex flex-col">
                    <div className="text-5xl font-black text-muted-foreground/20 absolute top-6 right-6">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold mb-3 mt-6">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-[20px] p-10 md:p-16 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to share your craft?</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  Join thousands of Nigerian creators monetizing their intellectual property globally.
                </p>
                <Button size="lg" className="rounded-[10px] px-10 h-14 text-lg font-semibold">
                  Start Selling Today <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl tracking-tight">
              <span className="text-primary">ORANGE</span> EXCHANGE
            </div>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Licenses</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Orange Exchange.
          </p>
        </div>
      </footer>
    </div>
  );
}
