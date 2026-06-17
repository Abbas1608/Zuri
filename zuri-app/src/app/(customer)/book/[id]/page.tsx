'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight, CheckCircle } from 'lucide-react';

const services = [
  { id: 's1', name: 'Signature Balayage', price: '₹3,500', duration: '3h' },
  { id: 's2', name: 'Bridal Makeup', price: '₹6,000', duration: '4h' },
  { id: 's3', name: 'Keratin Treatment', price: '₹2,800', duration: '2.5h' },
  { id: 's4', name: 'Cut & Blowdry', price: '₹800', duration: '1h' },
];

const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
const today = new Date();
const dates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  return d;
});

type BookingStep = 'select' | 'confirm' | 'success';

export default function BookingPage() {
  const [step, setStep] = useState<BookingStep>('select');
  const [selectedService, setSelectedService] = useState(services[0].id);
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const service = services.find(s => s.id === selectedService)!;

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="glass-panel rounded-2xl p-10 border border-green-500/30 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="font-serif text-3xl text-white mb-2">Booked!</h1>
          <p className="text-slate-400 text-sm mb-2">
            {service.name} on {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {selectedTime}
          </p>
          <p className="text-slate-400 text-sm mb-8">A confirmation email has been sent.</p>
          <div className="space-y-3">
            <Link href="/my-bookings" className="block w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all text-center">
              View My Bookings
            </Link>
            <a href="#" className="block w-full py-3 border border-white/20 hover:border-white/40 text-slate-300 rounded-xl transition-all text-center text-sm">
              Add to Google Calendar
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/salon/salon_1" className="text-slate-400 hover:text-white transition-colors">← Salon</Link>
          <h1 className="font-serif text-2xl text-white">Book Appointment</h1>
        </div>

        {step === 'select' && (
          <div className="space-y-6">
            {/* Service Selection */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-medium mb-4 flex items-center gap-2"><Clock size={16} className="text-amber-400" /> Choose a Service</h2>
              <div className="space-y-2">
                {services.map(s => (
                  <button key={s.id} onClick={() => setSelectedService(s.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${selectedService === s.id ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/30 bg-slate-800/50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{s.name}</p>
                        <p className="text-slate-400 text-sm">{s.duration}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${selectedService === s.id ? 'text-amber-400' : 'text-slate-300'}`}>{s.price}</span>
                        {selectedService === s.id && <CheckCircle size={16} className="text-amber-400" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Picker */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-medium mb-4 flex items-center gap-2"><Calendar size={16} className="text-amber-400" /> Pick a Date</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map(d => {
                  const isSelected = d.toDateString() === selectedDate.toDateString();
                  return (
                    <button key={d.toISOString()} onClick={() => setSelectedDate(d)}
                      className={`shrink-0 px-4 py-3 rounded-xl border text-center transition-all min-w-[64px] ${isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/30 bg-slate-800/50'}`}>
                      <p className={`text-xs uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                        {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </p>
                      <p className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {d.getDate()}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-medium mb-4">Available Times</h2>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${selectedTime === t ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/10 hover:border-white/30 bg-slate-800/50 text-slate-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!selectedTime}
              onClick={() => setStep('confirm')}
              className="w-full py-3.5 bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2">
              Review Booking <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="glass-panel rounded-2xl p-8 border border-white/10 space-y-5">
            <h2 className="font-serif text-xl text-white">Confirm Your Booking</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-slate-400">Service</span>
                <span className="text-white font-medium">{service.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-slate-400">Date</span>
                <span className="text-white">{selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-slate-400">Time</span>
                <span className="text-white">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total</span>
                <span className="text-amber-400 font-semibold text-lg">{service.price}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('select')} className="flex-1 py-3 border border-white/20 text-slate-300 rounded-xl hover:border-white/40 transition-colors">
                Back
              </button>
              <button onClick={() => setStep('success')} className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all">
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
