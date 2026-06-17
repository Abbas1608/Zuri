'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

type BookingStatus = 'confirmed' | 'completed' | 'cancelled';
type Tab = 'active' | 'future' | 'past';

const bookings = [
  { id: 'b1', salon: 'Silk & Stone Studio', service: 'Signature Balayage', date: 'Tomorrow', time: '11:00 AM', status: 'confirmed' as BookingStatus, price: '₹3,500' },
  { id: 'b2', salon: 'The Monsoon Mane', service: 'Keratin Treatment', date: 'Sat, 21 Jun', time: '2:00 PM', status: 'confirmed' as BookingStatus, price: '₹2,800' },
  { id: 'b3', salon: 'Heritage Glow', service: 'Bridal Makeup', date: 'Mon, 23 Jun', time: '10:00 AM', status: 'confirmed' as BookingStatus, price: '₹6,000' },
  { id: 'b4', salon: 'Aria Beauty Lounge', service: 'Cut & Blowdry', date: '10 Jun', time: '3:00 PM', status: 'completed' as BookingStatus, price: '₹800' },
  { id: 'b5', salon: 'Silk & Stone Studio', service: 'Deep Conditioning Spa', date: '2 Jun', time: '12:00 PM', status: 'cancelled' as BookingStatus, price: '₹1,200' },
];

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  confirmed: { label: 'Confirmed', color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: <CheckCircle size={12} /> },
  completed: { label: 'Completed', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: <CheckCircle size={12} /> },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <XCircle size={12} /> },
};

export default function MyBookingsPage() {
  const [tab, setTab] = useState<Tab>('active');

  const tabBookings = {
    active: bookings.filter(b => b.status === 'confirmed' && b.date === 'Tomorrow'),
    future: bookings.filter(b => b.status === 'confirmed' && b.date !== 'Tomorrow'),
    past: bookings.filter(b => b.status !== 'confirmed'),
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-slate-400 hover:text-white transition-colors text-sm">← Home</Link>
            <h1 className="font-serif text-xl text-white">My Bookings</h1>
          </div>
          <Link href="/discover" className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1">
            Book New <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Tab Bar */}
        <div className="flex gap-1 p-1 bg-slate-800 rounded-xl mb-6">
          {(['active', 'future', 'past'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
              {t}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-slate-900/30 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                {tabBookings[t].length}
              </span>
            </button>
          ))}
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {tabBookings[tab].length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 border border-white/10 text-center">
              <p className="text-slate-400">No {tab} bookings.</p>
              <Link href="/discover" className="mt-4 inline-block px-6 py-2.5 bg-amber-500 text-slate-900 rounded-xl text-sm font-medium hover:bg-amber-400 transition-colors">
                Browse Salons
              </Link>
            </div>
          ) : tabBookings[tab].map(b => {
            const status = statusConfig[b.status];
            return (
              <div key={b.id} className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-amber-500/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{b.salon}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">{b.service}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                    {status.icon}{status.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={12} />{b.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{b.time}</span>
                  <span className="text-amber-400 font-medium ml-auto">{b.price}</span>
                </div>
                {b.status === 'confirmed' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                    <Link href={`/book/${b.id}`} className="flex-1 py-2 text-center text-sm text-slate-300 border border-white/20 rounded-xl hover:border-white/40 transition-colors">
                      Reschedule
                    </Link>
                    <button className="flex-1 py-2 text-center text-sm text-red-400 border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
