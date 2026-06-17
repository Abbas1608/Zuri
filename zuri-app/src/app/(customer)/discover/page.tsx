'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Filter, Search, ChevronRight } from 'lucide-react';

const FILTERS = ['All', 'Balayage', 'Bridal', 'Keratin', 'Nails', 'HD Makeup', 'Anti-Frizz', 'Skin'];

const SALONS = [
  {
    id: 'salon_1',
    name: 'Silk & Stone Studio',
    area: 'Bandra West',
    rating: 4.9,
    reviews: 210,
    price: '₹800–₹4500',
    tags: ['Balayage', 'Bridal', 'Keratin'],
    description: 'Award-winning colourists specialising in balayage and bridal packages.',
    images: [
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=300',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=300',
    ]
  },
  {
    id: 'salon_2',
    name: 'The Monsoon Mane',
    area: 'Juhu',
    rating: 4.7,
    reviews: 143,
    price: '₹600–₹2800',
    tags: ['Keratin', 'Anti-Frizz', 'Nails'],
    description: 'Humidity specialists. Your hair survives every Mumbai monsoon.',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=300',
    ]
  },
  {
    id: 'salon_3',
    name: 'Heritage Glow',
    area: 'Colaba',
    rating: 4.8,
    reviews: 184,
    price: '₹1000–₹6000',
    tags: ['HD Makeup', 'Skin', 'Bridal'],
    description: 'Old-world luxury meets modern beauty science in the heart of South Mumbai.',
    images: [
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=300',
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=300',
    ]
  },
  {
    id: 'salon_4',
    name: 'Aria Beauty Lounge',
    area: 'Andheri',
    rating: 4.6,
    reviews: 97,
    price: '₹400–₹2000',
    tags: ['Nails', 'Waxing', 'Anti-Frizz'],
    description: 'Neighbourhood luxury — express services, walk-ins welcome.',
    images: [
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=300',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=300',
    ]
  },
];

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = SALONS.filter(s => {
    const matchesFilter = activeFilter === 'All' || s.tags.includes(activeFilter);
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.area.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/home" className="text-slate-400 hover:text-white transition-colors text-sm">← Home</Link>
            <h1 className="font-serif text-xl text-white">Discover Salons</h1>
          </div>
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or area in Mumbai…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
            />
          </div>
          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex items-center gap-1 text-slate-400 shrink-0 text-xs">
              <Filter size={12} /> Filters:
            </div>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeFilter === f
                    ? 'bg-amber-500 text-slate-900 border-amber-500'
                    : 'bg-slate-800/80 border-white/10 text-slate-300 hover:border-white/30'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        <p className="text-slate-400 text-sm">{filtered.length} salons found</p>
        {filtered.map(salon => (
          <div key={salon.id} className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex hover:border-amber-500/30 transition-all group">
            {/* Mini Image Carousel */}
            <div className="w-44 shrink-0 relative overflow-hidden">
              <img src={salon.images[0]} alt={salon.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/30" />
            </div>
            {/* Details */}
            <div className="flex-1 p-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-lg">{salon.name}</h3>
                </div>
                <p className="text-slate-400 text-sm flex items-center gap-1 mb-2"><MapPin size={11} />{salon.area}</p>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">{salon.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {salon.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-right space-y-3">
                <div className="flex items-center justify-end gap-1 text-amber-400">
                  <Star size={13} fill="currentColor" />
                  <span className="font-medium">{salon.rating}</span>
                  <span className="text-slate-500 text-xs">({salon.reviews})</span>
                </div>
                <p className="text-slate-400 text-xs">{salon.price}</p>
                <Link href={`/salon/${salon.id}`}
                  className="flex items-center gap-1 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold rounded-xl transition-all hover:shadow-[0_0_14px_rgba(212,175,55,0.3)] whitespace-nowrap">
                  Book Now <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
