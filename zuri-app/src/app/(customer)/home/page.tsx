'use client';

import Link from 'next/link';
import { CloudRain, Star, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { aiMocks } from '@/utils/ai-mocks';

const featuredSalons = [
  { id: 'salon_1', name: 'Silk & Stone Studio', area: 'Bandra West', rating: 4.9, tags: ['Balayage', 'Bridal'], img: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600' },
  { id: 'salon_2', name: 'The Monsoon Mane', area: 'Juhu', rating: 4.7, tags: ['Keratin', 'Anti-Frizz'], img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600' },
  { id: 'salon_3', name: 'Heritage Glow', area: 'Colaba', rating: 4.8, tags: ['HD Makeup', 'Skin'], img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=600' },
  { id: 'salon_4', name: 'Aria Beauty Lounge', area: 'Andheri', rating: 4.6, tags: ['Nails', 'Waxing'], img: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=600' },
];

export default function CustomerHomePage() {
  const advisor = aiMocks.monsoonAdvisor;

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-white">Zuri</h1>
        <div className="flex items-center gap-4">
          <Link href="/discover" className="text-slate-400 hover:text-white text-sm transition-colors">Discover</Link>
          <Link href="/my-bookings" className="text-slate-400 hover:text-white text-sm transition-colors">My Bookings</Link>
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-sm font-medium">P</div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Monsoon Advisor Widget */}
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

              <div className="flex gap-3 mt-5">
                {advisor.quickLinks.map(link => (
                  <Link key={link.salonId} href={`/salon/${link.salonId}`}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-full text-amber-300 text-sm transition-colors flex items-center gap-1">
                    <Sparkles size={12} />
                    {link.treatment}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Salons Carousel */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl text-white">Featured Salons</h2>
            <Link href="/discover" className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1 transition-colors">View all <ChevronRight size={14} /></Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
            {featuredSalons.map(salon => (
              <Link key={salon.id} href={`/salon/${salon.id}`}
                className="shrink-0 w-72 glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all hover:scale-[1.02] snap-start">
                <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${salon.img})` }}>
                  <div className="h-full bg-gradient-to-t from-slate-900 to-transparent flex items-end p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {salon.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{salon.name}</p>
                      <p className="text-slate-400 text-sm flex items-center gap-1 mt-0.5"><MapPin size={11} />{salon.area}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <Star size={12} fill="currentColor" />{salon.rating}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
