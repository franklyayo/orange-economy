import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogIn, LogOut, User, Wallet, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';

export default function LoginModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isWalletLinked, setIsWalletLinked] = useState(false);

  const { address } = useAccount();

  // Listen to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if wallet is already linked when user logs in
  useEffect(() => {
    if (user && address) {
      supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setIsWalletLinked(!!data?.wallet_address);
        });
    }
  }, [user, address]);

  const handleAuth = async () => {
    setLoading(true);
    setMessage('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('✅ Check your email to confirm your account!');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMessage('');
    setIsWalletLinked(false);
  };

  const linkWallet = async () => {
    if (!user || !address) {
      setMessage("Please connect your wallet first");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: user.email,
        wallet_address: address,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      setMessage("Failed to link wallet: " + error.message);
    } else {
      setIsWalletLinked(true);
      setMessage("✅ Wallet successfully linked to your account!");
    }
  };

  if (user) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="rounded-[10px] flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Welcome back, {user.email}</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Wallet Status</p>
              {address ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="font-mono text-sm break-all">{address}</div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No wallet connected</p>
              )}
            </div>

            {address && !isWalletLinked && (
              <Button onClick={linkWallet} className="w-full rounded-[10px]" variant="secondary">
                <Wallet className="w-4 h-4 mr-2" />
                Link Current Wallet
              </Button>
            )}

            <Button onClick={handleLogout} variant="destructive" className="w-full rounded-[10px]">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>

            {message && <p className="text-center text-sm text-green-600">{message}</p>}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Login / Register form
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-[10px]">
          <LogIn className="w-4 h-4 mr-2" />
          Login / Register
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[20px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Login to Orange Exchange' : 'Create Account'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button onClick={handleAuth} disabled={loading} className="w-full rounded-[10px]">
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>

          {message && <p className="text-sm text-center text-muted-foreground">{message}</p>}

          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-sm"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
