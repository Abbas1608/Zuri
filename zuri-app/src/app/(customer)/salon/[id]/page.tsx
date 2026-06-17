'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, ChevronRight, Sparkles, ThumbsUp, AlertTriangle, Coffee } from 'lucide-react';
import { aiMocks } from '@/utils/ai-mocks';

const salon = {
  id: 'salon_1',
  name: 'Silk & Stone Studio',
  area: 'Bandra West, Mumbai',
  rating: 4.9,
  reviews: 210,
  tags: ['Balayage', 'Bridal', 'Keratin'],
  hours: 'Mon–Sat: 10am – 8pm | Sun: 11am – 6pm',
  description: 'Award-winning colourists and bridal specialists set in a luxurious Bandra studio. Known for their signature balayage technique and relaxed, welcoming atmosphere.',
  images: [
    'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=600',
    'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=600',
  ],
  services: [
    { name: 'Signature Balayage', price: '₹3,500', duration: '3h' },
    { name: 'Bridal Makeup', price: '₹6,000', duration: '4h' },
    { name: 'Keratin Treatment', price: '₹2,800', duration: '2.5h' },
    { name: 'Cut & Blowdry', price: '₹800', duration: '1h' },
    { name: 'Deep Conditioning Spa', price: '₹1,200', duration: '1.5h' },
  ],
};

const rawReviews = [
  { user: 'Priya M.', rating: 5, text: 'Absolutely stunning balayage. My hair has never looked this good!', date: '2 days ago' },
  { user: 'Anika S.', rating: 5, text: 'Best bridal makeup in Bandra, hands down. The team is so professional.', date: '1 week ago' },
  { user: 'Reena K.', rating: 4, text: 'Loved the service but the wait on Friday evening was 45 mins. Worth it though!', date: '2 weeks ago' },
];

type Tab = 'overview' | 'services' | 'reviews';

export default function SalonProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const synthesis = aiMocks.customerReviewSynthesis;

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Hero Masonry Grid */}
      <div className="h-72 md:h-96 grid grid-cols-3 grid-rows-2 gap-1 overflow-hidden">
        <div className="col-span-2 row-span-2 bg-cover bg-center" style={{ backgroundImage: `url(${salon.images[0]})` }} />
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${salon.images[1]})` }} />
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${salon.images[2]})` }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 relative">
        <div className="md:flex gap-8">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            {/* Salon header */}
            <div className="mb-6">
              <h1 className="font-serif text-3xl text-white mb-1">{salon.name}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-1"><MapPin size={12} />{salon.area}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-amber-400"><Star size={13} fill="currentColor" />{salon.rating}</span>
                <span className="text-slate-500 text-sm">({salon.reviews} reviews)</span>
                <div className="flex gap-1.5">
                  {salon.tags.map(t => <span key={t} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">{t}</span>)}
                </div>
              </div>
              <p className="flex items-center gap-1 text-slate-400 text-sm mt-2"><Clock size={12} />{salon.hours}</p>
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
                  <p className="text-slate-300 text-sm leading-relaxed">{salon.description}</p>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-3">
                {salon.services.map(s => (
                  <div key={s.name} className="glass-panel rounded-xl p-4 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{s.name}</p>
                      <p className="text-slate-400 text-sm mt-0.5">{s.duration}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-amber-400 font-semibold">{s.price}</span>
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
                </div>
                {/* Raw Reviews */}
                {rawReviews.map((r, i) => (
                  <div key={i} className="glass-panel rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{r.user}</span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs">{Array.from({length: r.rating}).map((_, j) => <Star key={j} size={10} fill="currentColor" />)}</div>
                    </div>
                    <p className="text-slate-300 text-sm">{r.text}</p>
                    <p className="text-slate-500 text-xs mt-2">{r.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Booking CTA */}
          <div className="md:w-72 shrink-0 mt-8 md:mt-0">
            <div className="sticky top-6 glass-panel rounded-2xl p-6 border border-amber-500/20 shadow-xl">
              <h3 className="font-serif text-xl text-white mb-1">Book an Appointment</h3>
              <p className="text-slate-400 text-sm mb-5">Starting from ₹800</p>
              <Link href={`/book/${salon.id}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                Book Now <ChevronRight size={16} />
              </Link>
              <div className="mt-4 pt-4 border-t border-white/10 text-slate-400 text-xs space-y-1.5">
                <p>✓ Instant confirmation</p>
                <p>✓ Free cancellation up to 24h</p>
                <p>✓ Google Calendar link</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
