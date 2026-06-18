'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CloudRain, Star, MapPin, ChevronRight, Sparkles, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Salon {
  id: string;
  name: string;
  address: string;
  style_tags: string[];
  rating: number;
  images: string[];
}

interface MonsoonAdvisor {
  currentWeather: { condition: string; humidity: number; temp: number };
  recommendationText: string;
  quickLinks: { treatment: string; salonId: string }[];
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=600',
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=600',
];

function CustomerHomeContent() {
  const { user, signOut } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [advisor, setAdvisor] = useState<MonsoonAdvisor | null>(null);
  const [loading, setLoading] = useState(true);

  const userName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Guest';
  const userInitial = userName[0]?.toUpperCase() ?? 'Z';

  useEffect(() => {
    async function loadData() {
      // Fetch featured salons from Supabase
      const { data: salonData } = await supabase
        .from('salons')
        .select('id, name, address, style_tags, rating, images')
        .order('rating', { ascending: false })
        .limit(6);

      setSalons(salonData ?? []);

      // Fetch monsoon advisor from AI
      const profile = user?.user_metadata ?? {};
      try {
        const res = await fetch('/api/ai/monsoon-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hairType: profile.hairType ?? 'wavy',
            skinType: profile.skinType ?? 'combination',
          }),
        });
        const data = await res.json();
        setAdvisor(data);
      } catch {
        // Use mock fallback
        setAdvisor({
          currentWeather: { condition: 'Heavy Rain', humidity: 88, temp: 28 },
          recommendationText: '88% Humidity in Mumbai today. Your wavy hair needs an anti-frizz treatment to survive the monsoon.',
          quickLinks: [
            { treatment: 'Anti-Frizz Spa', salonId: 'salon_1' },
            { treatment: 'Matte Makeup Set', salonId: 'salon_2' },
          ],
        });
      }

      setLoading(false);
    }
    loadData();
  }, [user]);

  // Extract area from address for display
  const getArea = (address: string) => {
    if (!address) return 'Mumbai';
    const parts = address.split(',');
    return parts[parts.length > 1 ? parts.length - 2 : 0]?.trim() ?? 'Mumbai';
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-white">Zuri</h1>
        <div className="flex items-center gap-4">
          <Link href="/discover" className="text-slate-400 hover:text-white text-sm transition-colors">Discover</Link>
          <Link href="/my-bookings" className="text-slate-400 hover:text-white text-sm transition-colors">My Bookings</Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-sm font-medium">
              {userInitial}
            </div>
            <button onClick={signOut} className="text-slate-500 hover:text-white transition-colors" title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Greeting */}
        <div>
          <h2 className="font-serif text-2xl text-white">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {userName} ✨</h2>
          <p className="text-slate-400 text-sm mt-1">Your beauty journey in Mumbai starts here.</p>
        </div>

        {/* Monsoon Advisor Widget */}
        {advisor && (
          <section>
            <div className="glass-panel rounded-2xl p-6 border border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <CloudRain size={18} className="text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium uppercase tracking-wider">The Monsoon Advisor</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white text-base leading-relaxed">{advisor.recommendationText}</p>
                    <div className="flex items-center gap-3 mt-3 text-slate-400 text-sm">
                      <span>{advisor.currentWeather.condition}</span>
                      <span>·</span>
                      <span>{advisor.currentWeather.humidity}% humidity</span>
                      <span>·</span>
                      <span>{advisor.currentWeather.temp}°C</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-4xl">🌧️</div>
                </div>
                <div className="flex gap-3 mt-5 flex-wrap">
                  {advisor.quickLinks.map((link, i) => (
                    <Link key={i} href={`/salon/${link.salonId}`}
                      className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-full text-amber-300 text-sm transition-colors flex items-center gap-1">
                      <Sparkles size={12} />
                      {link.treatment}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Salons Carousel */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl text-white">
              {salons.length > 0 ? 'Featured Salons' : loading ? 'Loading Salons…' : 'Explore Salons'}
            </h2>
            <Link href="/discover" className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1 transition-colors">View all <ChevronRight size={14} /></Link>
          </div>
          {salons.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
              {salons.map((salon, idx) => (
                <Link key={salon.id} href={`/salon/${salon.id}`}
                  className="shrink-0 w-72 glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all hover:scale-[1.02] snap-start">
                  <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${salon.images?.[0] ?? FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]})` }}>
                    <div className="h-full bg-gradient-to-t from-slate-900 to-transparent flex items-end p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {(salon.style_tags ?? []).slice(0, 2).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{salon.name}</p>
                        <p className="text-slate-400 text-sm flex items-center gap-1 mt-0.5"><MapPin size={11} />{getArea(salon.address)}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-sm">
                        <Star size={12} fill="currentColor" />{salon.rating?.toFixed(1) ?? '—'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : loading ? (
            <div className="flex gap-4 overflow-x-auto pb-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="shrink-0 w-72 glass-panel rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                  <div className="h-44 bg-slate-700/50" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
              <p className="text-slate-400">No salons yet. <Link href="/signup" className="text-amber-400">Owners: add your salon →</Link></p>
            </div>
          )}
        </section>

        {/* AI Diagnostic CTA */}
        <section>
          <div className="glass-panel rounded-2xl p-6 border border-purple-500/20 flex items-center justify-between gap-6">
            <div>
              <p className="text-purple-300 text-sm uppercase tracking-wider mb-1 flex items-center gap-2"><Sparkles size={12} /> AI Feature</p>
              <h3 className="text-white font-serif text-xl">Get Your Beauty Profile</h3>
              <p className="text-slate-400 text-sm mt-1">Upload a selfie for personalized colour and hairstyle recommendations.</p>
            </div>
            <Link href="/diagnostics" className="shrink-0 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">
              Start →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CustomerHomePage() {
  return (
    <ProtectedRoute>
      <CustomerHomeContent />
    </ProtectedRoute>
  );
}
