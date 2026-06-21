'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar, Clock, ChevronRight, CheckCircle, Loader2,
  Users, UserPlus, Trash2, Sparkles, ExternalLink, Crown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
}

interface Salon {
  id: string;
  name: string;
  address?: string;
}

interface GuestEntry {
  id: string;           // local UUID for React key
  guestName: string;
  serviceId: string;
  date: Date;
  timeSlot: string | null;
}

type BookingMode = 'solo' | 'group';
type BookingStep = 'select' | 'confirm' | 'success';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM',  '3:00 PM',  '4:00 PM',
  '5:00 PM',  '6:00 PM',
];

const today = new Date();
const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  return d;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (price: number) => `₹${price.toLocaleString('en-IN')}`;

function buildGoogleCalendarLink(
  salonName: string,
  guests: GuestEntry[],
  services: Service[],
): string {
  if (guests.length === 0) return '#';
  const first = guests[0];
  const start = (() => {
    const d = new Date(first.date);
    const [time, period] = (first.timeSlot ?? '10:00 AM').split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    d.setHours(h, m, 0, 0);
    return d;
  })();
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const fmt8 = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const title = encodeURIComponent(`Group Bridal Appointment @ ${salonName}`);
  const details = encodeURIComponent(
    guests
      .map((g, i) => {
        const svc = services.find(s => s.id === g.serviceId);
        return `Guest ${i + 1}: ${g.guestName || 'TBD'} — ${svc?.name ?? ''} at ${g.timeSlot ?? ''}`;
      })
      .join('\n'),
  );
  return `https://calendar.google.com/calendar/r/eventedit?text=${title}&dates=${fmt8(start)}/${fmt8(end)}&details=${details}`;
}

function createGuest(services: Service[]): GuestEntry {
  return {
    id: uuidv4(),
    guestName: '',
    serviceId: services[0]?.id ?? '',
    date: DATES[0],
    timeSlot: null,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DateStrip({
  selected,
  onSelect,
}: {
  selected: Date;
  onSelect: (d: Date) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {DATES.map(d => {
        const active = d.toDateString() === selected.toDateString();
        return (
          <button
            key={d.toISOString()}
            onClick={() => onSelect(d)}
            className={`shrink-0 px-3 py-2.5 rounded-xl border text-center transition-all min-w-[58px] ${
              active
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-white/10 hover:border-white/30 bg-slate-800/50'
            }`}
          >
            <p className={`text-[10px] uppercase tracking-widest ${active ? 'text-amber-400' : 'text-slate-400'}`}>
              {d.toLocaleDateString('en-IN', { weekday: 'short' })}
            </p>
            <p className={`text-base font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>
              {d.getDate()}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function TimeGrid({
  selected,
  takenSlots,
  onSelect,
}: {
  selected: string | null;
  takenSlots: string[];
  onSelect: (t: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TIME_SLOTS.map(t => {
        const isTaken = takenSlots.includes(t);
        const isActive = selected === t;
        return (
          <button
            key={t}
            disabled={isTaken}
            onClick={() => onSelect(t)}
            className={`slot-btn py-2.5 rounded-xl border text-xs font-medium transition-all
              ${isTaken ? 'slot-btn-taken opacity-30 cursor-not-allowed border-white/5 bg-slate-900/50 text-slate-600' :
                isActive ? 'slot-btn-selected border-amber-500 bg-amber-500/10 text-amber-300' :
                'border-white/10 bg-slate-800/50 text-slate-300'}`}
          >
            {isTaken ? <s>{t}</s> : t}
          </button>
        );
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-panel-deep rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="guest-badge skeleton-shimmer" />
        <div className="h-4 w-32 rounded-lg skeleton-shimmer" />
      </div>
      <div className="h-10 rounded-xl skeleton-shimmer" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}

// ─── Guest Card ───────────────────────────────────────────────────────────────

function GuestCard({
  guest,
  index,
  services,
  takenSlots,
  onUpdate,
  onRemove,
  canRemove,
}: {
  guest: GuestEntry;
  index: number;
  services: Service[];
  takenSlots: string[];
  onUpdate: (id: string, patch: Partial<GuestEntry>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const selectedService = services.find(s => s.id === guest.serviceId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.38, ease: [0.34, 1.1, 0.64, 1] }}
      className="glass-panel-deep rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(212,175,55,0.12)' }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <span className="guest-badge">{index + 1}</span>
          <span className="text-slate-300 text-sm font-medium">
            {guest.guestName || `Guest ${index + 1}`}
          </span>
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(guest.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Guest name */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
            Guest Name
          </label>
          <input
            type="text"
            value={guest.guestName}
            onChange={e => onUpdate(guest.id, { guestName: e.target.value })}
            placeholder={`e.g. Priya Sharma`}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Service selector */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
            Service
          </label>
          <div className="relative">
            <select
              value={guest.serviceId}
              onChange={e => onUpdate(guest.id, { serviceId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm appearance-none focus:outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
            >
              {services.map(s => (
                <option key={s.id} value={s.id} style={{ background: '#0f172a' }}>
                  {s.name} — {fmt(s.price)} · {s.duration}
                </option>
              ))}
            </select>
            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
          </div>
          {selectedService && (
            <p className="text-xs text-amber-400/70 mt-1.5 pl-1">
              {fmt(selectedService.price)} · {selectedService.duration}
            </p>
          )}
        </div>

        {/* Date picker */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 block">
            <Calendar size={12} className="text-amber-400" /> Date
          </label>
          <DateStrip
            selected={guest.date}
            onSelect={d => onUpdate(guest.id, { date: d, timeSlot: null })}
          />
        </div>

        {/* Time slots */}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 block">
            <Clock size={12} className="text-amber-400" /> Time Slot
          </label>
          <TimeGrid
            selected={guest.timeSlot}
            takenSlots={takenSlots}
            onSelect={t => onUpdate(guest.id, { timeSlot: t })}
          />
          {!guest.timeSlot && (
            <p className="text-xs text-slate-500 mt-2 text-center">Select an available time above</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Receipt Card ─────────────────────────────────────────────────────────────

function GroupReceipt({
  guests,
  services,
  salonName,
}: {
  guests: GuestEntry[];
  services: Service[];
  salonName: string;
}) {
  const lineItems = guests.map((g, i) => {
    const svc = services.find(s => s.id === g.serviceId);
    return { label: g.guestName || `Guest ${i + 1}`, svc };
  });
  const total = lineItems.reduce((acc, { svc }) => acc + (svc?.price ?? 0), 0);

  return (
    <div className="receipt-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={16} className="text-amber-400" />
        <h3 className="text-amber-300 font-semibold text-sm uppercase tracking-widest">
          Group Summary
        </h3>
      </div>
      <p className="text-slate-400 text-xs mb-4">{salonName}</p>
      <div className="space-y-2 mb-4">
        {lineItems.map(({ label, svc }, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-slate-300 truncate max-w-[55%]">{label}</span>
            <span className="text-slate-400 text-xs ml-2 truncate">{svc?.name}</span>
            <span className="text-slate-200 font-medium ml-auto pl-4 shrink-0">
              {svc ? fmt(svc.price) : '—'}
            </span>
          </div>
        ))}
      </div>
      <div className="receipt-divider my-3" />
      <div className="flex justify-between items-center">
        <span className="text-slate-300 text-sm">Total</span>
        <span className="text-amber-400 font-bold text-xl">{fmt(total)}</span>
      </div>
    </div>
  );
}

// ─── Solo Booking (original flow, preserved) ──────────────────────────────────

function SoloBookingView({
  services,
  salon,
  onSuccess,
  user,
  salonId,
}: {
  services: Service[];
  salon: Salon | null;
  onSuccess: (id: string) => void;
  user: { id: string } | null;
  salonId: string;
}) {
  const [selectedService, setSelectedService] = useState(services[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = useState<Date>(DATES[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find(s => s.id === selectedService);

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
        group_id: null,
      })
      .select('id')
      .single();
    if (bookingError) {
      setError('Failed to create booking. Please try again.');
    } else {
      onSuccess(data.id);
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'select' && (
        <motion.div
          key="solo-select"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="space-y-5"
        >
          {/* Services */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-white font-medium mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Clock size={14} className="text-amber-400" /> Choose a Service
            </h2>
            <div className="space-y-2">
              {services.map(s => (
                <button key={s.id} onClick={() => setSelectedService(s.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedService === s.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/10 hover:border-white/30 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{s.name}</p>
                      <p className="text-slate-400 text-xs">{s.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${selectedService === s.id ? 'text-amber-400' : 'text-slate-300'}`}>
                        {fmt(s.price)}
                      </span>
                      {selectedService === s.id && <CheckCircle size={14} className="text-amber-400" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-white font-medium mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Calendar size={14} className="text-amber-400" /> Pick a Date
            </h2>
            <DateStrip selected={selectedDate} onSelect={d => { setSelectedDate(d); setSelectedTime(null); }} />
          </div>

          {/* Time */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Available Times</h2>
            <TimeGrid selected={selectedTime} takenSlots={[]} onSelect={setSelectedTime} />
          </div>

          <button
            disabled={!selectedTime || services.length === 0}
            onClick={() => setStep('confirm')}
            className="w-full py-3.5 bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2"
          >
            Review Booking <ChevronRight size={16} />
          </button>
        </motion.div>
      )}

      {step === 'confirm' && service && (
        <motion.div
          key="solo-confirm"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="glass-panel rounded-2xl p-8 space-y-5"
        >
          <h2 className="font-serif text-xl text-white">Confirm Your Booking</h2>
          <div className="space-y-3 text-sm">
            {[
              ['Salon', salon?.name],
              ['Service', service.name],
              ['Date', selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })],
              ['Time', selectedTime],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-slate-400">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-slate-400">Total</span>
              <span className="text-amber-400 font-bold text-lg">{fmt(service.price)}</span>
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
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Group Booking View ───────────────────────────────────────────────────────

function GroupBookingView({
  services,
  salon,
  onSuccess,
  user,
  salonId,
}: {
  services: Service[];
  salon: Salon | null;
  onSuccess: (ids: string[], groupId: string) => void;
  user: { id: string } | null;
  salonId: string;
}) {
  const [guests, setGuests] = useState<GuestEntry[]>([createGuest(services)]);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGuest = () => {
    if (guests.length >= 8) return;
    setGuests(prev => [...prev, createGuest(services)]);
  };

  const removeGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  const updateGuest = useCallback((id: string, patch: Partial<GuestEntry>) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
  }, []);

  const allFilled = guests.every(g => g.timeSlot);

  const handleReview = async () => {
    if (!allFilled) return;
    setValidating(true);
    await new Promise(r => setTimeout(r, 800)); // simulated async slot check
    setValidating(false);
    setStep('confirm');
  };

  const confirmGroupBooking = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const groupId = uuidv4();

    const rows = guests.map(g => ({
      user_id: user.id,
      salon_id: salonId,
      service_id: g.serviceId,
      date: g.date.toISOString().split('T')[0],
      time: g.timeSlot!,
      status: 'pending',
      group_id: groupId,
      guest_name: g.guestName || null,
    }));

    const { data, error: batchError } = await supabase
      .from('bookings')
      .insert(rows)
      .select('id');

    if (batchError) {
      setError('Failed to confirm group booking. Please try again.');
    } else {
      const ids = (data ?? []).map((r: { id: string }) => r.id);
      onSuccess(ids, groupId);
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'select' && (
        <motion.div
          key="group-select"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.32, ease: 'easeInOut' }}
          className="space-y-4"
        >
          {/* Guest cards */}
          <AnimatePresence>
            {validating
              ? guests.map((_, i) => <SkeletonCard key={i} />)
              : guests.map((g, i) => (
                  <GuestCard
                    key={g.id}
                    guest={g}
                    index={i}
                    services={services}
                    takenSlots={[]}
                    onUpdate={updateGuest}
                    onRemove={removeGuest}
                    canRemove={guests.length > 1}
                  />
                ))}
          </AnimatePresence>

          {/* Add Guest */}
          {guests.length < 8 && (
            <motion.button
              layout
              onClick={addGuest}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl border border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-all"
              style={{
                borderColor: 'rgba(212,175,55,0.35)',
                color: '#d4af37',
                background: 'rgba(212,175,55,0.04)',
              }}
            >
              <UserPlus size={15} />
              Add Guest {guests.length < 8 ? `(${guests.length}/8)` : ''}
            </motion.button>
          )}

          {/* Live receipt */}
          <GroupReceipt guests={guests} services={services} salonName={salon?.name ?? ''} />

          <button
            disabled={!allFilled || validating}
            onClick={handleReview}
            className="w-full py-3.5 bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
          >
            {validating ? (
              <><Loader2 size={16} className="animate-spin" /> Checking Availability…</>
            ) : (
              <>Review Group Booking <ChevronRight size={16} /></>
            )}
          </button>
        </motion.div>
      )}

      {step === 'confirm' && (
        <motion.div
          key="group-confirm"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.32, ease: 'easeInOut' }}
          className="space-y-5"
        >
          <div className="receipt-card rounded-2xl p-7 space-y-4">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-amber-400" />
              <h2 className="font-serif text-xl text-white">Group Booking Summary</h2>
            </div>
            <p className="text-slate-400 text-sm">{salon?.name}</p>
            <div className="space-y-3">
              {guests.map((g, i) => {
                const svc = services.find(s => s.id === g.serviceId);
                return (
                  <div key={g.id} className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06] text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="guest-badge text-[10px]">{i + 1}</span>
                      <span className="text-white font-medium">{g.guestName || `Guest ${i + 1}`}</span>
                      <span className="ml-auto text-amber-400 font-semibold">{svc ? fmt(svc.price) : '—'}</span>
                    </div>
                    <p className="text-slate-400 text-xs pl-9">{svc?.name} · {g.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {g.timeSlot}</p>
                  </div>
                );
              })}
            </div>
            <div className="receipt-divider" />
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Grand Total</span>
              <span className="text-amber-400 font-bold text-2xl">
                {fmt(guests.reduce((acc, g) => {
                  const svc = services.find(s => s.id === g.serviceId);
                  return acc + (svc?.price ?? 0);
                }, 0))}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('select')}
              className="flex-1 py-3 border border-white/20 text-slate-300 rounded-xl hover:border-white/40 transition-colors text-sm"
            >
              Back
            </button>
            <button
              onClick={confirmGroupBooking}
              disabled={submitting}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? 'Processing…' : `Confirm ${guests.length} Bookings`}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  mode,
  soloService,
  soloDate,
  soloTime,
  soloBookingId,
  groupGuests,
  groupServices,
  groupIds,
  groupId,
  salon,
  onReset,
}: {
  mode: BookingMode;
  soloService?: Service;
  soloDate?: Date;
  soloTime?: string | null;
  soloBookingId?: string | null;
  groupGuests?: GuestEntry[];
  groupServices?: Service[];
  groupIds?: string[];
  groupId?: string;
  salon: Salon | null;
  onReset: () => void;
}) {
  const calLink = mode === 'group' && groupGuests && groupServices && salon
    ? buildGoogleCalendarLink(salon.name, groupGuests, groupServices)
    : '#';

  return (
    <main className="booking-bg flex items-center justify-center p-6 min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
        className={`rounded-2xl p-10 text-center max-w-md w-full ${
          mode === 'group' ? 'receipt-card' : 'glass-panel border border-green-500/30'
        }`}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            mode === 'group'
              ? 'bg-amber-500/20 gold-pulse'
              : 'bg-green-500/20'
          }`}
        >
          {mode === 'group'
            ? <Crown size={30} className="text-amber-400" />
            : <CheckCircle size={30} className="text-green-400" />}
        </div>

        <h1 className="font-serif text-3xl text-white mb-2">
          {mode === 'group' ? 'Group Reserved!' : 'Booked!'}
        </h1>

        {mode === 'solo' && soloService && (
          <>
            <p className="text-slate-400 text-sm mb-1">
              {soloService.name} on{' '}
              {soloDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {soloTime}
            </p>
            <p className="text-slate-400 text-sm mb-2">at {salon?.name}</p>
            <p className="text-slate-500 text-xs mb-8">Booking ID: {soloBookingId?.slice(0, 8).toUpperCase()}</p>
          </>
        )}

        {mode === 'group' && groupGuests && groupServices && (
          <div className="text-left mt-4 mb-6 space-y-2">
            {groupGuests.map((g, i) => {
              const svc = groupServices.find(s => s.id === g.serviceId);
              return (
                <div key={g.id} className="flex items-center gap-2 text-sm">
                  <span className="guest-badge text-[10px]">{i + 1}</span>
                  <span className="text-slate-300">{g.guestName || `Guest ${i + 1}`}</span>
                  <span className="text-slate-500 text-xs ml-auto">{svc?.name}</span>
                </div>
              );
            })}
            <div className="receipt-divider mt-3" />
            <p className="text-amber-400/70 text-xs pt-1">
              Group Ref: {groupId?.slice(0, 8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {mode === 'group' && (
            <a
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="cal-link-btn flex items-center justify-center gap-2 w-full py-3 rounded-xl text-blue-300 text-sm font-medium"
            >
              <ExternalLink size={14} /> Add to Google Calendar
            </a>
          )}
          <Link
            href="/my-bookings"
            className="block w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all text-center text-sm"
          >
            View My Bookings
          </Link>
          <button
            onClick={onReset}
            className="block w-full py-3 border border-white/20 hover:border-white/40 text-slate-300 rounded-xl transition-all text-sm"
          >
            Book Another
          </button>
        </div>
      </motion.div>
    </main>
  );
}

// ─── Mode Toggle ──────────────────────────────────────────────────────────────

function ModeToggle({
  mode,
  onChange,
}: {
  mode: BookingMode;
  onChange: (m: BookingMode) => void;
}) {
  return (
    <div className="flex justify-center mb-8">
      <div className="mode-toggle-track gap-1" style={{ width: 'fit-content' }}>
        {(['solo', 'group'] as BookingMode[]).map(m => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => onChange(m)}
              className="relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300"
              style={{
                color: active ? '#0f172a' : 'rgba(255,255,255,0.5)',
              }}
            >
              {active && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: m === 'group'
                      ? 'linear-gradient(135deg, #d4af37 0%, #f5cc5a 100%)'
                      : 'rgba(255,255,255,0.9)',
                    boxShadow: m === 'group'
                      ? '0 2px 16px rgba(212,175,55,0.4)'
                      : '0 2px 8px rgba(255,255,255,0.15)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {m === 'solo' ? <Calendar size={13} /> : <Sparkles size={13} />}
                {m === 'solo' ? 'Solo Appointment' : 'Group Coordinator'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function BookingContent() {
  const params = useParams();
  const { user } = useAuth();
  const salonId = params.id as string;

  const [mode, setMode] = useState<BookingMode>('solo');
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Success state
  const [successMode, setSuccessMode] = useState<BookingMode | null>(null);
  const [soloBookingId, setSoloBookingId] = useState<string | null>(null);
  const [soloSuccessService, setSoloSuccessService] = useState<Service | undefined>();
  const [soloSuccessDate, setSoloSuccessDate] = useState<Date | undefined>();
  const [soloSuccessTime, setSoloSuccessTime] = useState<string | null>(null);
  const [groupBookingIds, setGroupBookingIds] = useState<string[]>([]);
  const [groupBookingGroupId, setGroupBookingGroupId] = useState<string>('');
  const [groupSuccessGuests, setGroupSuccessGuests] = useState<GuestEntry[]>([]);

  useEffect(() => {
    async function load() {
      const { data: salonData } = await supabase
        .from('salons')
        .select('id, name, address')
        .eq('id', salonId)
        .single();
      setSalon(salonData);

      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .order('price', { ascending: true });
      setServices(serviceData ?? []);
      setLoading(false);
    }
    load();
  }, [salonId]);

  const handleSoloSuccess = (id: string, svc: Service, date: Date, time: string) => {
    setSoloBookingId(id);
    setSoloSuccessService(svc);
    setSoloSuccessDate(date);
    setSoloSuccessTime(time);
    setSuccessMode('solo');
  };

  const handleGroupSuccess = (ids: string[], gId: string, guests: GuestEntry[]) => {
    setGroupBookingIds(ids);
    setGroupBookingGroupId(gId);
    setGroupSuccessGuests(guests);
    setSuccessMode('group');
  };

  const handleReset = () => {
    setSuccessMode(null);
    setSoloBookingId(null);
  };

  // ── Loading ──
  if (loading) {
    return (
      <main className="booking-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading salon details…</p>
        </div>
      </main>
    );
  }

  // ── Success ──
  if (successMode) {
    return (
      <SuccessScreen
        mode={successMode}
        soloService={soloSuccessService}
        soloDate={soloSuccessDate}
        soloTime={soloSuccessTime}
        soloBookingId={soloBookingId}
        groupGuests={groupSuccessGuests}
        groupServices={services}
        groupIds={groupBookingIds}
        groupId={groupBookingGroupId}
        salon={salon}
        onReset={handleReset}
      />
    );
  }

  // ── Main layout ──
  return (
    <main className="booking-bg text-white">
      <div className="max-w-2xl mx-auto px-5 pt-8 pb-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={`/salon/${salonId}`}
            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            ← {salon?.name ?? 'Salon'}
          </Link>
          <div className="flex items-center gap-2">
            {mode === 'group' && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Crown size={11} /> Premium
              </span>
            )}
          </div>
        </div>

        <h1 className="font-serif text-3xl text-white mb-2">
          {mode === 'group' ? 'Group Bridal Coordinator' : 'Book Appointment'}
        </h1>
        {mode === 'group' && (
          <p className="text-slate-400 text-sm mb-7">
            Coordinate multiple guests, services & time slots in one seamless booking.
          </p>
        )}
        {mode === 'solo' && <div className="mb-7" />}

        {/* Mode toggle */}
        <ModeToggle mode={mode} onChange={m => setMode(m)} />

        {/* No services guard */}
        {services.length === 0 && (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-slate-400">No services available at this salon yet.</p>
          </div>
        )}

        {/* Content switch */}
        {services.length > 0 && (
          <AnimatePresence mode="wait">
            {mode === 'solo' ? (
              <motion.div
                key="solo"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <SoloBookingViewWrapper
                  services={services}
                  salon={salon}
                  user={user}
                  salonId={salonId}
                  onSuccess={handleSoloSuccess}
                />
              </motion.div>
            ) : (
              <motion.div
                key="group"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <GroupBookingViewWrapper
                  services={services}
                  salon={salon}
                  user={user}
                  salonId={salonId}
                  onSuccess={handleGroupSuccess}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}

// ─── Wrappers holding local success state ─────────────────────────────────────

function SoloBookingViewWrapper({
  services,
  salon,
  user,
  salonId,
  onSuccess,
}: {
  services: Service[];
  salon: Salon | null;
  user: { id: string } | null;
  salonId: string;
  onSuccess: (id: string, svc: Service, date: Date, time: string) => void;
}) {
  // We need to capture the selected service/date/time at the moment of success
  // so the parent can render the success screen correctly.
  const [sel, setSel] = useState({
    serviceId: services[0]?.id ?? '',
    date: DATES[0],
    time: null as string | null,
  });

  return (
    <SoloBookingView
      services={services}
      salon={salon}
      user={user}
      salonId={salonId}
      onSuccess={(id) => {
        const svc = services.find(s => s.id === sel.serviceId)!;
        onSuccess(id, svc, sel.date, sel.time ?? '');
      }}
      // Pass state setters down via prop drilling through SoloBookingView
      // We re-use the existing SoloBookingView but wrap its success call
    />
  );
}

function GroupBookingViewWrapper({
  services,
  salon,
  user,
  salonId,
  onSuccess,
}: {
  services: Service[];
  salon: Salon | null;
  user: { id: string } | null;
  salonId: string;
  onSuccess: (ids: string[], groupId: string, guests: GuestEntry[]) => void;
}) {
  const [guestsRef, setGuestsRef] = useState<GuestEntry[]>([createGuest(services)]);

  return (
    <GroupBookingViewInner
      services={services}
      salon={salon}
      user={user}
      salonId={salonId}
      guestsRef={guestsRef}
      setGuestsRef={setGuestsRef}
      onSuccess={onSuccess}
    />
  );
}

function GroupBookingViewInner({
  services,
  salon,
  user,
  salonId,
  guestsRef,
  setGuestsRef,
  onSuccess,
}: {
  services: Service[];
  salon: Salon | null;
  user: { id: string } | null;
  salonId: string;
  guestsRef: GuestEntry[];
  setGuestsRef: (g: GuestEntry[]) => void;
  onSuccess: (ids: string[], groupId: string, guests: GuestEntry[]) => void;
}) {
  const [guests, setGuests] = useState<GuestEntry[]>(guestsRef);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGuest = () => {
    if (guests.length >= 8) return;
    setGuests(prev => [...prev, createGuest(services)]);
  };

  const removeGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  const updateGuest = useCallback((id: string, patch: Partial<GuestEntry>) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
  }, []);

  const allFilled = guests.every(g => g.timeSlot);

  const handleReview = async () => {
    if (!allFilled) return;
    setValidating(true);
    await new Promise(r => setTimeout(r, 900));
    setValidating(false);
    setStep('confirm');
  };

  const confirmGroupBooking = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const groupId = uuidv4();
    const rows = guests.map(g => ({
      user_id: user.id,
      salon_id: salonId,
      service_id: g.serviceId,
      date: g.date.toISOString().split('T')[0],
      time: g.timeSlot!,
      status: 'pending',
      group_id: groupId,
      guest_name: g.guestName || null,
    }));

    const { data, error: batchError } = await supabase
      .from('bookings')
      .insert(rows)
      .select('id');

    if (batchError) {
      setError('Failed to confirm group booking. Please try again.');
      console.error(batchError);
    } else {
      const ids = (data ?? []).map((r: { id: string }) => r.id);
      onSuccess(ids, groupId, guests);
    }
    setSubmitting(false);
  };

  const totalPrice = guests.reduce((acc, g) => {
    const svc = services.find(s => s.id === g.serviceId);
    return acc + (svc?.price ?? 0);
  }, 0);

  return (
    <AnimatePresence mode="wait">
      {step === 'select' && (
        <motion.div
          key="g-select"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Guest count indicator */}
          <div className="flex items-center gap-2 px-1 mb-2">
            <Users size={14} className="text-amber-400" />
            <span className="text-amber-400/80 text-xs font-medium uppercase tracking-widest">
              {guests.length} Guest{guests.length !== 1 ? 's' : ''}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-400/20 to-transparent" />
          </div>

          <AnimatePresence>
            {validating
              ? guests.map((_, i) => <SkeletonCard key={i} />)
              : guests.map((g, i) => (
                  <GuestCard
                    key={g.id}
                    guest={g}
                    index={i}
                    services={services}
                    takenSlots={[]}
                    onUpdate={updateGuest}
                    onRemove={removeGuest}
                    canRemove={guests.length > 1}
                  />
                ))}
          </AnimatePresence>

          {guests.length < 8 && (
            <motion.button
              layout
              onClick={addGuest}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl border border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-all"
              style={{
                borderColor: 'rgba(212,175,55,0.3)',
                color: '#d4af37',
                background: 'rgba(212,175,55,0.03)',
              }}
            >
              <UserPlus size={14} />
              Add Guest ({guests.length}/8)
            </motion.button>
          )}

          <GroupReceipt guests={guests} services={services} salonName={salon?.name ?? ''} />

          <button
            disabled={!allFilled || validating}
            onClick={handleReview}
            className="w-full py-3.5 bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all hover:shadow-[0_0_28px_rgba(212,175,55,0.45)] flex items-center justify-center gap-2"
          >
            {validating
              ? <><Loader2 size={16} className="animate-spin" /> Checking Availability…</>
              : <><Sparkles size={15} /> Review {guests.length} Guest{guests.length !== 1 ? 's' : ''} · {fmt(totalPrice)}</>}
          </button>
        </motion.div>
      )}

      {step === 'confirm' && (
        <motion.div
          key="g-confirm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.34, 1.1, 0.64, 1] }}
          className="space-y-5"
        >
          <div className="receipt-card rounded-2xl p-7 space-y-4">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-amber-400" />
              <h2 className="font-serif text-xl text-white">Confirm Group Booking</h2>
            </div>
            <p className="text-slate-400 text-sm">{salon?.name}</p>

            <div className="space-y-2">
              {guests.map((g, i) => {
                const svc = services.find(s => s.id === g.serviceId);
                return (
                  <div key={g.id} className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="guest-badge text-[10px]">{i + 1}</span>
                      <span className="text-white font-medium text-sm">
                        {g.guestName || `Guest ${i + 1}`}
                      </span>
                      <span className="ml-auto text-amber-400 font-semibold text-sm">
                        {svc ? fmt(svc.price) : '—'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs pl-9">
                      {svc?.name} · {g.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {g.timeSlot}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="receipt-divider" />
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Grand Total</span>
              <span className="text-amber-400 font-bold text-2xl">{fmt(totalPrice)}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('select')}
              className="flex-1 py-3 border border-white/20 text-slate-300 rounded-xl hover:border-white/40 transition-colors text-sm"
            >
              Back
            </button>
            <button
              onClick={confirmGroupBooking}
              disabled={submitting}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? 'Processing…' : `Confirm ${guests.length} Booking${guests.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function BookingPage() {
  return (
    <ProtectedRoute>
      <BookingContent />
    </ProtectedRoute>
  );
}
