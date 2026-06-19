'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, Star, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

interface Salon {
  id: string;
  name: string;
  rating: number;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  users: { name: string } | null;
  services: { name: string; price: number } | null;
}

interface Stats {
  todayFootfall: number;
  upcomingToday: number;
  avgRating: number;
  totalReviews: number;
  monthRevenue: number;
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [stats, setStats] = useState<Stats>({ todayFootfall: 0, upcomingToday: 0, avgRating: 0, totalReviews: 0, monthRevenue: 0 });
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;

      // Get owner's salon
      const { data: salonData } = await supabase
        .from('salons')
        .select('id, name, rating')
        .eq('owner_id', user.id)
        .single();

      if (!salonData) { setLoading(false); return; }
      setSalon(salonData);

      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Today's bookings
      const { data: todayData } = await supabase
        .from('bookings')
        .select('id, date, time, status, users(name), services(name, price)')
        .eq('salon_id', salonData.id)
        .eq('date', today)
        .order('time');
      setTodayBookings((todayData ?? []) as unknown as Booking[]);

      // This month's bookings for revenue
      const { data: monthData } = await supabase
        .from('bookings')
        .select('status, services(price)')
        .eq('salon_id', salonData.id)
        .gte('date', monthStart)
        .in('status', ['confirmed', 'completed']);

      const monthRevenue = (monthData ?? []).reduce((sum, b) => {
        const booking = b as unknown as { services: { price: number } | null };
        return sum + (booking.services?.price ?? 0);
      }, 0);

      // Reviews count
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonData.id);

      setStats({
        todayFootfall: (todayData ?? []).filter(b => b.status === 'confirmed' || b.status === 'completed').length,
        upcomingToday: (todayData ?? []).filter(b => b.status === 'confirmed' || b.status === 'pending').length,
        avgRating: salonData.rating ?? 0,
        totalReviews: reviewCount ?? 0,
        monthRevenue,
      });

      setLoading(false);
    }
    loadDashboard();
  }, [user]);

  const formatRevenue = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    { label: "Today's Footfall", value: stats.todayFootfall.toString(), sub: 'completed today', icon: Users, color: 'text-blue-400', glow: 'bg-blue-400/10' },
    { label: 'Upcoming Today', value: stats.upcomingToday.toString(), sub: 'pending/confirmed', icon: Calendar, color: 'text-amber-400', glow: 'bg-amber-400/10' },
    { label: 'Avg Rating', value: stats.avgRating?.toFixed(1) ?? '—', sub: `${stats.totalReviews} reviews`, icon: Star, color: 'text-yellow-400', glow: 'bg-yellow-400/10' },
    { label: 'Revenue (This Month)', value: formatRevenue(stats.monthRevenue), sub: 'from bookings', icon: TrendingUp, color: 'text-green-400', glow: 'bg-green-400/10' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-white">
          {loading ? 'Loading…' : `${getGreeting()}, ${salon?.name ?? 'Owner'} ✨`}
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Here&apos;s your salon performance at a glance.</p>
      </div>

      {/* If no salon setup yet */}
      {!loading && !salon && (
        <div className="glass-panel rounded-2xl p-8 border border-amber-500/20 text-center">
          <p className="text-white text-lg mb-2">Your salon isn&apos;t set up yet!</p>
          <p className="text-slate-400 text-sm mb-4">Complete your profile to start receiving bookings.</p>
          <a href="/profile-setup" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all inline-block">
            Set Up Salon →
          </a>
        </div>
      )}

      {/* Stats Bento Grid */}
      {!loading && salon && (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map(s => (
              <div key={s.label} className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-amber-500/20 transition-all">
                <div className={`w-10 h-10 rounded-xl ${s.glow} flex items-center justify-center mb-4`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-white text-3xl font-semibold">{s.value}</p>
                <p className="text-slate-500 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Today's Schedule */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h2 className="text-white font-medium font-serif text-lg mb-5">Today&apos;s Schedule</h2>
            {todayBookings.length === 0 ? (
              <p className="text-slate-400 text-sm">No bookings scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todayBookings.map(a => {
                  const booking = a as unknown as { id: string; time: string; status: string; users: { name: string } | null; services: { name: string } | null };
                  return (
                    <div key={booking.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-semibold text-sm shrink-0">
                          {(booking.users?.name ?? 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{booking.users?.name ?? 'Unknown Client'}</p>
                          <p className="text-slate-400 text-xs">{booking.services?.name ?? 'Service'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-sm">{booking.time}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          booking.status === 'confirmed' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                          booking.status === 'completed' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                          'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
