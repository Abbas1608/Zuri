'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, MapPin, Clock, ChevronRight, Sparkles, ThumbsUp, AlertTriangle, Coffee, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Salon {
  id: string;
  name: string;
  address: string;
  rating: number;
  style_tags: string[];
  operating_hours: { mon_fri?: string; saturday?: string; sunday?: string };
  about: string;
  images: string[];
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
}

interface Review {
  id: string;
  text: string;
  rating: number;
  created_at: string;
  users: { name: string } | null;
}

interface ReviewSynthesis {
  bestFor: string;
  watchOutFor: string;
  vibe: string;
}

type Tab = 'overview' | 'services' | 'reviews';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=600',
];

export default function SalonProfilePage() {
  const params = useParams();
  const salonId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [synthesis, setSynthesis] = useState<ReviewSynthesis | null>(null);
  const [loading, setLoading] = useState(true);
  const [synthLoading, setSynthLoading] = useState(false);

  useEffect(() => {
    async function loadSalon() {
      const { data: salonData } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();
      setSalon(salonData);

      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .order('price', { ascending: true });
      setServices(serviceData ?? []);

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, text, rating, created_at, users(name)')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false })
        .limit(10);
      setReviews((reviewData ?? []) as unknown as Review[]);

      setLoading(false);
    }
    loadSalon();
  }, [salonId]);

  // Fetch AI review synthesis when switching to reviews tab
  useEffect(() => {
    if (activeTab === 'reviews' && reviews.length > 0 && !synthesis) {
      setSynthLoading(true);
      fetch('/api/ai/review-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews, mode: 'customer' }),
      })
        .then(r => r.json())
        .then(data => { setSynthesis(data); setSynthLoading(false); })
        .catch(() => setSynthLoading(false));
    }
  }, [activeTab, reviews, synthesis]);

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  const images = salon?.images?.length ? salon.images : FALLBACK_IMAGES;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading salon…</p>
        </div>
      </main>
    );
  }

  if (!salon) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-4">Salon not found</p>
          <Link href="/discover" className="text-amber-400 hover:text-amber-300">← Back to Discover</Link>
        </div>
      </main>
    );
  }

  const hours = salon.operating_hours ?? {};

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Hero Masonry Grid */}
      <div className="h-72 md:h-96 grid grid-cols-3 grid-rows-2 gap-1 overflow-hidden">
        <div className="col-span-2 row-span-2 bg-cover bg-center" style={{ backgroundImage: `url(${images[0]})` }} />
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${images[1] ?? images[0]})` }} />
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${images[2] ?? images[0]})` }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 relative">
        <div className="md:flex gap-8">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            {/* Salon header */}
            <div className="mb-6">
              <Link href="/discover" className="text-slate-400 hover:text-white text-sm transition-colors mb-3 inline-block">← All Salons</Link>
              <h1 className="font-serif text-3xl text-white mb-1">{salon.name}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={12} />{salon.address}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-amber-400"><Star size={13} fill="currentColor" />{salon.rating?.toFixed(1) ?? '—'}</span>
                <span className="text-slate-500 text-sm">({reviews.length} reviews)</span>
                <div className="flex gap-1.5 flex-wrap">
                  {(salon.style_tags ?? []).map(t => <span key={t} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">{t}</span>)}
                </div>
              </div>
              {hours.mon_fri && (
                <p className="flex items-center gap-1 text-slate-400 text-sm mt-2">
                  <Clock size={12} />
                  Mon–Fri: {hours.mon_fri}
                  {hours.saturday && ` | Sat: ${hours.saturday}`}
                  {hours.sunday && ` | Sun: ${hours.sunday}`}
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-800 rounded-xl mb-6 w-fit">
              {(['overview', 'services', 'reviews'] as Tab[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="glass-panel rounded-2xl p-5 border border-white/10">
                  <h3 className="text-white font-medium mb-2">About the Salon</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{salon.about || 'A premium beauty salon in Mumbai.'}</p>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-3">
                {services.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
                    <p className="text-slate-400">No services listed yet.</p>
                  </div>
                ) : services.map(s => (
                  <div key={s.id} className="glass-panel rounded-xl p-4 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{s.name}</p>
                      <p className="text-slate-400 text-sm mt-0.5">{s.duration}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-amber-400 font-semibold">{formatPrice(s.price)}</span>
                      <Link href={`/book/${salon.id}`}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-900 border border-amber-500/40 rounded-lg text-xs font-medium transition-all">
                        Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* AI Review Synthesis */}
                <div className="glass-panel rounded-2xl p-5 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={14} className="text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">AI Summary</span>
                  </div>
                  {synthLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Loader2 size={14} className="animate-spin" /> Generating AI summary…
                    </div>
                  ) : synthesis ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <ThumbsUp size={16} className="text-green-400 shrink-0 mt-0.5" />
                        <div><p className="text-xs text-green-400 uppercase tracking-wider mb-0.5">Best for</p><p className="text-slate-300 text-sm">{synthesis.bestFor}</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                        <div><p className="text-xs text-yellow-400 uppercase tracking-wider mb-0.5">Watch out for</p><p className="text-slate-300 text-sm">{synthesis.watchOutFor}</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Coffee size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <div><p className="text-xs text-blue-400 uppercase tracking-wider mb-0.5">Vibe</p><p className="text-slate-300 text-sm">{synthesis.vibe}</p></div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No reviews yet to synthesize.</p>
                  )}
                </div>
                {/* Raw Reviews */}
                {reviews.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
                    <p className="text-slate-400">No reviews yet. Be the first!</p>
                  </div>
                ) : reviews.map(r => (
                  <div key={r.id} className="glass-panel rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{r.users?.name ?? 'Anonymous'}</span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{r.text}</p>
                    <p className="text-slate-500 text-xs mt-2">{timeAgo(r.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Booking CTA */}
          <div className="md:w-72 shrink-0 mt-8 md:mt-0">
            <div className="sticky top-6 glass-panel rounded-2xl p-6 border border-amber-500/20 shadow-xl">
              <h3 className="font-serif text-xl text-white mb-1">Book an Appointment</h3>
              <p className="text-slate-400 text-sm mb-5">
                {services.length > 0
                  ? `From ${formatPrice(Math.min(...services.map(s => s.price)))}`
                  : 'Contact for pricing'}
              </p>
              <Link href={`/book/${salon.id}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                Book Now <ChevronRight size={16} />
              </Link>
              <div className="mt-4 pt-4 border-t border-white/10 text-slate-400 text-xs space-y-1.5">
                <p>✓ Instant confirmation</p>
                <p>✓ Free cancellation up to 24h</p>
                <p>✓ {reviews.length} customer reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
