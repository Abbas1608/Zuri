'use client';

import { Users, Calendar, Star, TrendingUp } from 'lucide-react';

const stats = [
  { label: "Today's Footfall", value: '14', sub: '+3 vs yesterday', icon: Users, color: 'text-blue-400', glow: 'bg-blue-400/10' },
  { label: 'Upcoming Today', value: '8', sub: 'Next at 11:00 AM', icon: Calendar, color: 'text-amber-400', glow: 'bg-amber-400/10' },
  { label: 'Avg Rating', value: '4.9', sub: '210 total reviews', icon: Star, color: 'text-yellow-400', glow: 'bg-yellow-400/10' },
  { label: 'Revenue (June)', value: '₹1.2L', sub: '+18% vs last month', icon: TrendingUp, color: 'text-green-400', glow: 'bg-green-400/10' },
];

const upcomingAppts = [
  { name: 'Priya Sharma', service: 'Balayage', time: '11:00 AM', status: 'confirmed' },
  { name: 'Anika Mehta', service: 'Bridal Makeup', time: '12:30 PM', status: 'confirmed' },
  { name: 'Ritika Joshi', service: 'Keratin Treatment', time: '2:00 PM', status: 'pending' },
  { name: 'Sneha Patel', service: 'Cut & Blowdry', time: '4:00 PM', status: 'confirmed' },
];

export default function OwnerDashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-white">Good evening, Silk &amp; Stone ✨</h1>
        <p className="text-slate-400 mt-1 text-sm">Here&apos;s your salon performance at a glance.</p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
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

      {/* Upcoming Appointments */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h2 className="text-white font-medium font-serif text-lg mb-5">Today&apos;s Schedule</h2>
        <div className="space-y-3">
          {upcomingAppts.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-semibold text-sm shrink-0">
                  {a.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{a.name}</p>
                  <p className="text-slate-400 text-xs">{a.service}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">{a.time}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${a.status === 'confirmed' ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
