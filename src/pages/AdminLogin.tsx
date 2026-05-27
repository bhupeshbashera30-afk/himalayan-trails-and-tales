import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mountain, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in as admin
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from('admin_users')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        if (data?.is_admin) {
          navigate('/admin/dashboard');
          return;
        }
      }
      setChecking(false);
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) throw signInError;

      // Check if this user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();

      if (adminError || !adminData?.is_admin) {
        // Sign them back out — not an admin
        await supabase.auth.signOut();
        setError('Access denied. This account does not have admin privileges.');
        setLoading(false);
        return;
      }

      toast({ title: 'Welcome back, Admin! 🏔️', description: "You're logged in to the admin dashboard." });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Checking session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl mb-4">
            <Mountain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold gradient-text">Himaale</h1>
          <p className="text-muted-foreground text-sm mt-1">Himalayan Trails &amp; Tales</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Admin Login</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="admin-email" className="flex items-center gap-2 mb-2 text-sm">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@himalayan.com"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                required
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label htmlFor="admin-password" className="flex items-center gap-2 mb-2 text-sm">
                <Lock className="w-3.5 h-3.5" /> Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full pulse-glow" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            This page is for authorized administrators only.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
