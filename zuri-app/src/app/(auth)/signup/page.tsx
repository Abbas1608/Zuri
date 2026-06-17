'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sparkles, Store, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Role = 'customer' | 'owner';
type Mode = 'login' | 'signup';

export default function SignupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signup');
  const [role, setRole] = useState<Role>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            role: role,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user && !data.session) {
        // Email confirmation required
        setMessage('✅ Check your email to confirm your account, then log in.');
      } else if (data.session) {
        // Auto-confirmed (email confirmation disabled)
        router.push(role === 'owner' ? '/dashboard' : '/home');
      }
    } else {
      // Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        const userRole = data.user.user_metadata?.role ?? 'customer';
        router.push(userRole === 'owner' ? '/dashboard' : '/home');
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-4xl text-white tracking-tight">Zuri</h1>
          </Link>
          <p className="text-slate-400 mt-2 text-sm tracking-widest uppercase">Mumbai&apos;s Premium Salon Marketplace</p>
        </div>

        {/* Split Panel */}
        <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          
          {/* Left: Customer Side */}
          <button
            onClick={() => setRole('customer')}
            className={`relative p-8 text-left transition-all duration-500 ${
              role === 'customer' 
                ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
                : 'bg-slate-950 opacity-60 hover:opacity-80'
            }`}
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800")' }} />
            <div className={`relative z-10 transition-all duration-300 ${role === 'customer' ? '' : 'grayscale'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${role === 'customer' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                  <Sparkles size={20} />
                </div>
                <span className={`font-medium text-sm tracking-wider uppercase ${role === 'customer' ? 'text-amber-400' : 'text-slate-500'}`}>Trendsetter</span>
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">For the Beauty Seeker</h2>
              <p className="text-slate-400 text-sm leading-relaxed">Discover salons, get AI-powered beauty diagnostics, and book your perfect look.</p>
              {role === 'customer' && (
                <div className="mt-4 w-8 h-0.5 bg-amber-400 rounded-full" />
              )}
            </div>
          </button>

          {/* Right: Owner Side */}
          <button
            onClick={() => setRole('owner')}
            className={`relative p-8 text-left transition-all duration-500 ${
              role === 'owner' 
                ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
                : 'bg-slate-950 opacity-60 hover:opacity-80'
            }`}
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800")' }} />
            <div className={`relative z-10 transition-all duration-300 ${role === 'owner' ? '' : 'grayscale'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${role === 'owner' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                  <Store size={20} />
                </div>
                <span className={`font-medium text-sm tracking-wider uppercase ${role === 'owner' ? 'text-amber-400' : 'text-slate-500'}`}>Partner</span>
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">For the Salon Owner</h2>
              <p className="text-slate-400 text-sm leading-relaxed">List your salon, manage bookings, and grow your business with AI-powered insights.</p>
              {role === 'owner' && (
                <div className="mt-4 w-8 h-0.5 bg-amber-400 rounded-full" />
              )}
            </div>
          </button>
        </div>

        {/* Auth Form */}
        <div className="mt-6 glass-panel rounded-2xl p-8 border border-white/10">
          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-slate-800 rounded-xl mb-8 w-fit">
            <button
              onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('login'); setError(null); setMessage(null); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              Log In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Priya Sharma"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Please wait...' : mode === 'signup' ? `Join as ${role === 'customer' ? 'Trendsetter' : 'Partner'}` : 'Enter Zuri'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
