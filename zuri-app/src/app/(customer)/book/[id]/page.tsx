'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
}

interface Salon {
  id: string;
  name: string;
}

const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
const today = new Date();
const dates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  return d;
});

type BookingStep = 'select' | 'confirm' | 'success';

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const salonId = params.id as string;

  const [step, setStep] = useState<BookingStep>('select');
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: salonData } = await supabase
        .from('salons')
        .select('id, name')
        .eq('id', salonId)
        .single();
      setSalon(salonData);

      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .order('price', { ascending: true });
      setServices(serviceData ?? []);
      if (serviceData && serviceData.length > 0) {
        setSelectedService(serviceData[0].id);
      }
      setLoading(false);
    }
    load();
  }, [salonId]);

  const service = services.find(s => s.id === selectedService);
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const confirmBooking = async () => {
    if (!user || !service || !selectedTime) return;
    setSubmitting(true);
    setError(null);

    const dateStr = selectedDate.toISOString().split('T')[0];

    const { data, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        salon_id: salonId,
        service_id: service.id,
        date: dateStr,
        time: selectedTime,
        status: 'pending',
      })
      .select('id')
      .single();

    if (bookingError) {
      setError('Failed to create booking. Please try again.');
      console.error(bookingError);
    } else {
      setBookingId(data.id);
      setStep('success');
    }
    setSubmitting(false);
  };

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="glass-panel rounded-2xl p-10 border border-green-500/30 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="font-serif text-3xl text-white mb-2">Booked!</h1>
          {service && (
            <p className="text-slate-400 text-sm mb-2">
              {service.name} on {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {selectedTime}
            </p>
          )}
          <p className="text-slate-400 text-sm mb-2">at {salon?.name}</p>
          <p className="text-slate-500 text-xs mb-8">Booking ID: {bookingId?.slice(0, 8).toUpperCase()}</p>
          <div className="space-y-3">
            <Link href="/my-bookings" className="block w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all text-center">
              View My Bookings
            </Link>
            <button
              onClick={() => { setStep('select'); setSelectedTime(null); }}
              className="block w-full py-3 border border-white/20 hover:border-white/40 text-slate-300 rounded-xl transition-all text-center text-sm"
            >
              Book Another Service
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Link href={`/salon/${salonId}`} className="text-slate-400 hover:text-white transition-colors">← {salon?.name ?? 'Salon'}</Link>
          <h1 className="font-serif text-2xl text-white">Book Appointment</h1>
        </div>

        {step === 'select' && (
          <div className="space-y-6">
            {/* Service Selection */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-medium mb-4 flex items-center gap-2"><Clock size={16} className="text-amber-400" /> Choose a Service</h2>
              {services.length === 0 ? (
                <p className="text-slate-400 text-sm">No services available yet.</p>
              ) : (
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
                          <span className={`font-semibold ${selectedService === s.id ? 'text-amber-400' : 'text-slate-300'}`}>{formatPrice(s.price)}</span>
                          {selectedService === s.id && <CheckCircle size={16} className="text-amber-400" />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h2 className="text-white font-medium mb-4 flex items-center gap-2"><Calendar size={16} className="text-amber-400" /> Pick a Date</h2>
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
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
              disabled={!selectedTime || services.length === 0}
              onClick={() => setStep('confirm')}
              className="w-full py-3.5 bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2">
              Review Booking <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 'confirm' && service && (
          <div className="glass-panel rounded-2xl p-8 border border-white/10 space-y-5">
            <h2 className="font-serif text-xl text-white">Confirm Your Booking</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-slate-400">Salon</span>
                <span className="text-white font-medium">{salon?.name}</span>
              </div>
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
                <span className="text-amber-400 font-semibold text-lg">{formatPrice(service.price)}</span>
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('select')} className="flex-1 py-3 border border-white/20 text-slate-300 rounded-xl hover:border-white/40 transition-colors">
                Back
              </button>
              <button
                onClick={confirmBooking}
                disabled={submitting}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <ProtectedRoute>
      <BookingContent />
    </ProtectedRoute>
  );
}
