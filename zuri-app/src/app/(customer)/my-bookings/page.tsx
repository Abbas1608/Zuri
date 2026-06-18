'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type Tab = 'upcoming' | 'past';

interface Booking {
  id: string;
  date: string;
  time: string;
  status: BookingStatus;
  salons: { name: string } | null;
  services: { name: string; price: number } | null;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: <Clock size={12} /> },
  confirmed: { label: 'Confirmed', color: 'text-green-400 bg-green-400/10 border-green-400/20',   icon: <CheckCircle size={12} /> },
  completed: { label: 'Completed', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',      icon: <CheckCircle size={12} /> },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-400/10 border-red-400/20',         icon: <XCircle size={12} /> },
};

function MyBookingsContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('id, date, time, status, salons(name), services(name, price)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    setBookings((data ?? []) as unknown as Booking[]);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const cancelBooking = async (id: string) => {
    setCancelling(id);
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('user_id', user!.id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    }
    setCancelling(null);
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelled' && b.status !== 'completed');
  const past = bookings.filter(b => b.date < today || b.status === 'cancelled' || b.status === 'completed');
  const tabBookings = tab === 'upcoming' ? upcoming : past;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.round((d.getTime() - new Date(today + 'T00:00:00').getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

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
          {(['upcoming', 'past'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
              {t}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-slate-900/30 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                {t === 'upcoming' ? upcoming.length : past.length}
              </span>
            </button>
          ))}
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="glass-panel rounded-2xl p-5 border border-white/10 animate-pulse">
                <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-3" />
                <div className="h-3 bg-slate-700/50 rounded w-3/4" />
              </div>
            ))
          ) : tabBookings.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 border border-white/10 text-center">
              <p className="text-slate-400">No {tab} bookings.</p>
              <Link href="/discover" className="mt-4 inline-block px-6 py-2.5 bg-amber-500 text-slate-900 rounded-xl text-sm font-medium hover:bg-amber-400 transition-colors">
                Browse Salons
              </Link>
            </div>
          ) : tabBookings.map(b => {
            const status = statusConfig[b.status];
            return (
              <div key={b.id} className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-amber-500/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{b.salons?.name ?? 'Unknown Salon'}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">{b.services?.name ?? 'Service'}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                    {status.icon}{status.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(b.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{b.time}</span>
                  {b.services?.price && (
                    <span className="text-amber-400 font-medium ml-auto">{formatPrice(b.services.price)}</span>
                  )}
                </div>
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => cancelBooking(b.id)}
                      disabled={cancelling === b.id}
                      className="flex-1 py-2 text-center text-sm text-red-400 border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                      {cancelling === b.id && <Loader2 size={12} className="animate-spin" />}
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

export default function MyBookingsPage() {
  return (
    <ProtectedRoute>
      <MyBookingsContent />
    </ProtectedRoute>
  );
}
