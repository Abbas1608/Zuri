'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  users: { name: string; email: string } | null;
  services: { name: string; price: number } | null;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminded, setReminded] = useState<string[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data: salonData } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      if (!salonData) { setLoading(false); return; }
      setSalonId(salonData.id);

      const { data } = await supabase
        .from('bookings')
        .select('id, date, time, status, users(name, email), services(name, price)')
        .eq('salon_id', salonData.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      setBookings((data ?? []) as unknown as Booking[]);
      setLoading(false);
    }
    load();
  }, [user]);

  const sendReminder = async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    await fetch('/api/owner/remind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: id,
        clientEmail: booking.users?.email,
        clientName: booking.users?.name,
        service: booking.services?.name,
        date: booking.date,
        time: booking.time,
      }),
    });
    setReminded(prev => [...prev, id]);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
    setUpdating(null);
  };

  const formatDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-white">Appointments</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage your schedule and send client reminders.</p>
        </div>
        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-slate-800 rounded-xl">
          {(['all', 'pending', 'confirmed', 'completed'] as StatusFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {!salonId && !loading && (
        <div className="glass-panel rounded-2xl p-8 border border-amber-500/20 text-center">
          <p className="text-slate-400">Set up your salon profile first to see appointments.</p>
          <a href="/profile-setup" className="mt-4 inline-block px-6 py-2.5 bg-amber-500 text-slate-900 rounded-xl text-sm font-medium">
            Set Up Salon →
          </a>
        </div>
      )}

      {salonId && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_100px_160px] gap-4 px-6 py-3 bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
            <span>Client</span>
            <span>Service</span>
            <span>Date &amp; Time</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-white/5">
            {loading && [1, 2, 3].map(i => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_100px_160px] gap-4 px-6 py-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(j => <div key={j} className="h-4 bg-slate-700/50 rounded" />)}
              </div>
            ))}

            {!loading && filtered.map(a => {
              const isReminded = reminded.includes(a.id);
              const booking = a as unknown as { id: string; date: string; time: string; status: string; users: { name: string; email: string } | null; services: { name: string; price: number } | null };
              return (
                <div key={booking.id} className="grid grid-cols-[1fr_1fr_1fr_100px_160px] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{booking.users?.name ?? 'Unknown'}</p>
                    <p className="text-slate-500 text-xs">{booking.users?.email ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm">{booking.services?.name ?? '—'}</p>
                    {booking.services?.price && <p className="text-amber-400 text-xs">{formatPrice(booking.services.price)}</p>}
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm flex items-center gap-1.5"><Clock size={12} className="text-slate-400" />{booking.time}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{formatDate(booking.date)}</p>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      booking.status === 'confirmed' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                      booking.status === 'completed' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                      booking.status === 'cancelled' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                      'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Confirm button for pending */}
                    {booking.status === 'pending' && (
                      <button onClick={() => updateStatus(booking.id, 'confirmed')}
                        disabled={updating === booking.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-xs font-medium rounded-lg transition-all disabled:opacity-50">
                        {updating === booking.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />} OK
                      </button>
                    )}
                    {/* Complete button for confirmed */}
                    {booking.status === 'confirmed' && (
                      <button onClick={() => updateStatus(booking.id, 'completed')}
                        disabled={updating === booking.id}
                        className="flex items-center gap-1 px-2 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-lg transition-all disabled:opacity-50">
                        Done
                      </button>
                    )}
                    {/* Remind button */}
                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                      isReminded ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                          <CheckCircle size={12} /> Sent
                        </span>
                      ) : (
                        <button onClick={() => sendReminder(booking.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-xs font-medium rounded-lg transition-all">
                          <Bell size={11} /> Remind
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}

            {!loading && filtered.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-slate-400">No {filter === 'all' ? '' : filter} appointments.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
