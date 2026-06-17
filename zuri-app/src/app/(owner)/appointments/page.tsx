'use client';

import { useState } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';

const appointments = [
  { id: 'a1', client: 'Priya Sharma', email: 'priya@example.com', service: 'Signature Balayage', date: 'Today', time: '11:00 AM', status: 'confirmed', price: '₹3,500' },
  { id: 'a2', client: 'Anika Mehta', email: 'anika@example.com', service: 'Bridal Makeup', date: 'Today', time: '12:30 PM', status: 'confirmed', price: '₹6,000' },
  { id: 'a3', client: 'Ritika Joshi', email: 'ritika@example.com', service: 'Keratin Treatment', date: 'Tomorrow', time: '2:00 PM', status: 'pending', price: '₹2,800' },
  { id: 'a4', client: 'Sneha Patel', email: 'sneha@example.com', service: 'Cut & Blowdry', date: 'Sat, 21 Jun', time: '4:00 PM', status: 'confirmed', price: '₹800' },
  { id: 'a5', client: 'Meena Rao', email: 'meena@example.com', service: 'Deep Conditioning Spa', date: 'Sat, 21 Jun', time: '10:00 AM', status: 'confirmed', price: '₹1,200' },
];

export default function AppointmentsPage() {
  const [reminded, setReminded] = useState<string[]>([]);

  const sendReminder = async (id: string) => {
    // API call to /api/owner/remind
    await new Promise(r => setTimeout(r, 800));
    setReminded(prev => [...prev, id]);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Live Appointments</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your schedule and send client reminders.</p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_1fr_1fr_100px_120px] gap-4 px-6 py-3 bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
          <span>Client</span>
          <span>Service</span>
          <span>Date & Time</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        <div className="divide-y divide-white/5">
          {appointments.map(a => {
            const isReminded = reminded.includes(a.id);
            return (
              <div key={a.id} className="grid grid-cols-[1fr_1fr_1fr_100px_120px] gap-4 px-6 py-4 items-center hover:bg-white/3 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{a.client}</p>
                  <p className="text-slate-500 text-xs">{a.email}</p>
                </div>
                <div>
                  <p className="text-slate-300 text-sm">{a.service}</p>
                  <p className="text-amber-400 text-xs">{a.price}</p>
                </div>
                <div>
                  <p className="text-slate-300 text-sm flex items-center gap-1.5"><Clock size={12} className="text-slate-400" />{a.time}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{a.date}</p>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${a.status === 'confirmed' ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>
                    {a.status}
                  </span>
                </div>
                <div>
                  {isReminded ? (
                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                      <CheckCircle size={13} /> Sent
                    </span>
                  ) : (
                    <button onClick={() => sendReminder(a.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-xs font-medium rounded-lg transition-all hover:shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                      <Bell size={12} /> Remind
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
