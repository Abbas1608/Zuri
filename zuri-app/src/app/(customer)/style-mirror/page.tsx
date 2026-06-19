'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import {
  Upload, Sparkles, RefreshCw, AlertCircle, Star, MapPin,
  Scan, CheckCircle2, ImageIcon, ArrowLeft, Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ─── Types ────────────────────────────────────────────────────────────────────
type PageState = 'upload' | 'scanning' | 'fetching' | 'result';

interface Salon {
  id: string;
  name: string;
  address: string;
  style_tags: string[];
  rating: number;
  images: string[];
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'error' | 'warning';
}

// ─── Fallback Images ──────────────────────────────────────────────────────────
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=600',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=600',
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=600',
];

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl backdrop-blur-md border shadow-2xl max-w-sm ${
              toast.type === 'error'
                ? 'bg-red-950/80 border-red-500/40 text-red-300'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
            }`}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/40 hover:text-white/80 transition-colors text-xs shrink-0"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SalonSkeleton() {
  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-700/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-700/50 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-700/50 rounded-lg w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="h-6 bg-slate-700/40 rounded-full w-20" />
          <div className="h-6 bg-slate-700/40 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}

// ─── Laser Scan Animation ─────────────────────────────────────────────────────
function LaserScanOverlay() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      {/* Scanning beam */}
      <motion.div
        className="absolute left-0 right-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #d4af37 30%, #ffd700 50%, #d4af37 70%, transparent 100%)',
          boxShadow: '0 0 20px 4px rgba(212,175,55,0.7), 0 0 40px 8px rgba(212,175,55,0.3)',
        }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
      />
      {/* Scanline shimmer overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(212,175,55,0.03) 3px, rgba(212,175,55,0.03) 4px)',
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      {/* Corner brackets */}
      {[
        'top-3 left-3 border-t-2 border-l-2',
        'top-3 right-3 border-t-2 border-r-2',
        'bottom-3 left-3 border-b-2 border-l-2',
        'bottom-3 right-3 border-b-2 border-r-2',
      ].map((cls, i) => (
        <motion.div
          key={i}
          className={`absolute w-6 h-6 border-amber-400/80 rounded-sm ${cls}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      {/* Gold tinted overlay */}
      <div className="absolute inset-0 bg-amber-500/5 rounded-2xl" />
    </div>
  );
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────
function ImageUploadZone({
  onFile,
  scanning,
  preview,
}: {
  onFile: (file: File) => void;
  scanning: boolean;
  preview: string | null;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => !scanning && inputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
        dragOver
          ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_40px_rgba(212,175,55,0.2)]'
          : preview
          ? 'border-amber-500/40 bg-transparent'
          : 'border-white/15 hover:border-amber-500/40 hover:bg-amber-500/[0.03] bg-white/[0.02]'
      }`}
      style={{ minHeight: preview ? 'auto' : '320px' }}
      whileHover={!preview && !scanning ? { scale: 1.005 } : {}}
    >
      {preview ? (
        /* ── Preview with optional scan overlay ── */
        <div className="relative">
          <img
            src={preview}
            alt="Inspiration"
            className="w-full max-h-96 object-cover rounded-xl"
          />
          <AnimatePresence>
            {scanning && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LaserScanOverlay />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* ── Empty drop zone ── */
        <div className="flex flex-col items-center justify-center gap-5 p-16 text-center">
          <motion.div
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center"
            animate={dragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {dragOver ? (
              <Upload size={32} className="text-amber-400" />
            ) : (
              <ImageIcon size={32} className="text-amber-500/70" />
            )}
          </motion.div>
          <div>
            <p className="text-white text-xl font-semibold mb-2">
              Drop your inspiration here
            </p>
            <p className="text-slate-400 text-sm">
              JPG · PNG · WEBP — under 5MB
            </p>
          </div>
          <motion.div
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/25"
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(212,175,55,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Upload size={15} />
            Browse Photo
          </motion.div>
          <p className="text-slate-600 text-xs">
            Your photo is only used for AI analysis — never stored.
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </motion.div>
  );
}

// ─── Tag Pill ─────────────────────────────────────────────────────────────────
function TagPill({ tag, delay = 0 }: { tag: string; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 280 }}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium"
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))',
        border: '1px solid rgba(212,175,55,0.45)',
        color: '#f4d03f',
        boxShadow: '0 0 12px rgba(212,175,55,0.15), inset 0 0 12px rgba(212,175,55,0.05)',
      }}
    >
      <Sparkles size={11} />
      {tag}
    </motion.span>
  );
}

// ─── Salon Card ───────────────────────────────────────────────────────────────
function SalonCard({ salon, idx, matchedTags }: { salon: Salon; idx: number; matchedTags: string[] }) {
  const getArea = (address: string) => {
    if (!address) return 'Mumbai';
    const parts = address.split(',');
    return parts[parts.length > 1 ? parts.length - 2 : 0]?.trim() ?? 'Mumbai';
  };

  const matched = matchedTags.filter((t) =>
    (salon.style_tags ?? []).some((st) => st.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(st.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07, type: 'spring', stiffness: 200 }}
    >
      <Link
        href={`/salon/${salon.id}`}
        className="block glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] group"
      >
        {/* Image */}
        <div
          className="h-44 bg-cover bg-center relative overflow-hidden"
          style={{
            backgroundImage: `url(${salon.images?.[0] ?? FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
            {(salon.style_tags ?? []).slice(0, 2).map((t) => (
              <span
                key={t}
                className={`px-2.5 py-0.5 text-xs rounded-full backdrop-blur-sm font-medium ${
                  matched.some((m) => m.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(m.toLowerCase()))
                    ? 'bg-amber-500/30 border border-amber-400/50 text-amber-300'
                    : 'bg-black/50 text-white/80 border border-white/10'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
          {matched.length > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 backdrop-blur-sm border border-amber-500/40 rounded-full">
              <CheckCircle2 size={10} className="text-amber-400" />
              <span className="text-amber-300 text-[10px] font-semibold">{matched.length} match{matched.length > 1 ? 'es' : ''}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-white font-semibold truncate group-hover:text-amber-200 transition-colors">
                {salon.name}
              </p>
              <p className="text-slate-400 text-sm flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="shrink-0" />
                {getArea(salon.address)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-400 text-sm shrink-0">
              <Star size={12} fill="currentColor" />
              {salon.rating?.toFixed(1) ?? '—'}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── AI Scanning State UI ─────────────────────────────────────────────────────
function ScanningState({ phase }: { phase: 'scanning' | 'fetching' }) {
  const steps = ['Reading composition', 'Extracting style tags', 'Querying local salons'];
  const activeStep = phase === 'scanning' ? 1 : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md p-6 space-y-4"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Scan size={18} className="text-amber-400" />
        </motion.div>
        <div>
          <p className="text-amber-300 font-semibold text-sm">
            {phase === 'scanning' ? 'AI Vision Analysis' : 'Querying Bandra Salons'}
          </p>
          <p className="text-slate-400 text-xs">
            {phase === 'scanning' ? 'Gemini is reading your inspiration photo…' : 'Finding salons that can execute this look…'}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                done ? 'bg-green-500' : active ? 'bg-amber-500 shadow-[0_0_12px_rgba(212,175,55,0.6)]' : 'bg-slate-700'
              }`}>
                {done ? (
                  <CheckCircle2 size={12} className="text-white" />
                ) : active ? (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </div>
              <span className={`text-sm ${done ? 'text-green-400' : active ? 'text-white font-medium' : 'text-slate-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Skeleton grid during fetching */}
      {phase === 'fetching' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3].map((i) => (
            <SalonSkeleton key={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function StyleMirrorContent() {
  const [pageState, setPageState] = useState<PageState>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isMockResult, setIsMockResult] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback((message: string, type: 'error' | 'warning' = 'error') => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── File Validation & Processing ───────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (!VALID_TYPES.includes(file.type)) {
      addToast('Unsupported format. Please upload a JPG, PNG, or WEBP image.', 'error');
      return;
    }
    if (file.size > MAX_SIZE) {
      addToast(`Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      setFileData({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  }, [addToast]);

  // ─── Trigger Analysis Once File Is Ready ────────────────────────────────────
  useEffect(() => {
    if (fileData && preview && pageState === 'upload') {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileData]);

  // ─── Step 1: AI Tag Extraction → Step 2: Supabase Query ─────────────────────
  const runAnalysis = async () => {
    if (!fileData) return;

    setPageState('scanning');
    setStyleTags([]);
    setSalons([]);

    try {
      // ── Phase 1: AI Vision ──
      const aiRes = await fetch('/api/ai/style-mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: fileData.base64, mimeType: fileData.mimeType }),
      });

      const aiData = await aiRes.json();

      if (!aiRes.ok) {
        addToast('AI analysis failed. Showing demo results.', 'warning');
      }

      if (aiData.warning || aiData.isMock) {
        addToast('Using demo style tags — add your Gemini API key to enable live AI.', 'warning');
        setIsMockResult(true);
      } else {
        setIsMockResult(false);
      }

      const tags: string[] = aiData.tags ?? [];
      setStyleTags(tags);

      // ── Phase 2: Supabase Query ──
      setPageState('fetching');

      if (tags.length > 0) {
        const { data: salonData, error } = await supabase
          .from('salons')
          .select('id, name, address, style_tags, rating, images')
          .overlaps('style_tags', tags);

        if (error) {
          console.error('Supabase query error:', error);
          addToast('Database query failed. Please try again.', 'error');
        }

        setSalons(salonData ?? []);
      }

      setPageState('result');
    } catch (err) {
      console.error('Style Mirror error:', err);
      addToast('Something went wrong. Please try again.', 'error');
      setPageState('upload');
    }
  };

  // ─── Reset ───────────────────────────────────────────────────────────────────
  const reset = () => {
    setPageState('upload');
    setPreview(null);
    setFileData(null);
    setStyleTags([]);
    setSalons([]);
    setIsMockResult(false);
  };

  const isScanning = pageState === 'scanning';
  const isFetching = pageState === 'fetching';
  const showScan = isScanning || isFetching;

  return (
    <main className="min-h-screen bg-slate-900 text-white">

      {/* ── Header ── */}
      <div className="relative overflow-hidden border-b border-white/8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,48,73,0.4),transparent_60%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Icon badge */}
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                  boxShadow: '0 8px 32px rgba(212,175,55,0.35)',
                }}
                whileHover={{ scale: 1.05, rotate: 3 }}
              >
                <Wand2 size={24} className="text-slate-900" />
              </motion.div>
              <div>
                <h1 className="font-serif text-3xl text-white">Bandra Style Mirror</h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  AI Vision · Find salons for your exact look · Mumbai&apos;s best stylists
                </p>
              </div>
            </div>
            <Link
              href="/home"
              className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors mt-1 shrink-0"
            >
              <ArrowLeft size={14} />
              Home
            </Link>
          </div>

          {/* Subtitle */}
          <p className="text-slate-500 text-sm mt-6 max-w-2xl leading-relaxed">
            Upload any hairstyle or beauty inspiration — our Gemini Vision AI reads the look,
            extracts the professional techniques, and instantly surfaces Bandra salons that
            can recreate it for you.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── Upload Zone ── */}
        <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Your Inspiration Photo</h2>
              {preview && (
                <motion.button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <RefreshCw size={13} />
                  New photo
                </motion.button>
              )}
            </div>
            <ImageUploadZone
              onFile={handleFile}
              scanning={isScanning}
              preview={preview}
            />
          </div>

          {/* ── How It Works Sidebar ── */}
          <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              How It Works
            </h3>
            {[
              { icon: '📸', title: 'Upload', desc: 'Drop any hairstyle or beauty photo' },
              { icon: '🔍', title: 'AI Reads', desc: 'Gemini Vision extracts professional techniques' },
              { icon: '✨', title: 'Tags Extracted', desc: 'Balayage, bangs, blowout — auto-detected' },
              { icon: '📍', title: 'Match Salons', desc: 'Bandra salons capable of your exact look' },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-base shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scanning / Fetching Progress ── */}
        <AnimatePresence mode="wait">
          {showScan && (
            <ScanningState phase={isFetching ? 'fetching' : 'scanning'} />
          )}
        </AnimatePresence>

        {/* ── Result Section ── */}
        <AnimatePresence>
          {pageState === 'result' && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Uploaded image + extracted tags row */}
              <div className="glass-panel rounded-2xl border border-amber-500/20 p-6 space-y-5"
                style={{ boxShadow: '0 0 60px rgba(212,175,55,0.06)' }}
              >
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Preview thumb */}
                  {preview && (
                    <div className="relative shrink-0">
                      <img
                        src={preview}
                        alt="Inspiration"
                        className="w-28 h-28 rounded-2xl object-cover"
                        style={{ boxShadow: '0 0 30px rgba(212,175,55,0.25), 0 0 0 2px rgba(212,175,55,0.3)' }}
                      />
                      <motion.div
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-2 border-slate-900 flex items-center justify-center shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                      >
                        <CheckCircle2 size={14} className="text-white" />
                      </motion.div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                        AI Detected Style Tags
                      </p>
                      {isMockResult && (
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] rounded-full font-medium">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {styleTags.map((tag, i) => (
                        <TagPill key={tag} tag={tag} delay={i * 0.08} />
                      ))}
                    </div>
                    <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                      Searching for Bandra salons specialising in{' '}
                      <span className="text-amber-400/70">{styleTags.slice(0, 2).join(', ')}</span>
                      {styleTags.length > 2 ? ` +${styleTags.length - 2} more techniques` : ''}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Salons header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl text-white">
                    {salons.length > 0
                      ? `${salons.length} Matching Salon${salons.length > 1 ? 's' : ''} Found`
                      : 'No Matching Salons'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {salons.length > 0
                      ? 'These Bandra studios can execute your look'
                      : 'Try a different inspiration photo or browse all salons'}
                  </p>
                </div>
                <Link
                  href="/discover"
                  className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1 transition-colors shrink-0"
                >
                  Browse all →
                </Link>
              </div>

              {/* Salon grid or empty state */}
              {salons.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {salons.map((salon, idx) => (
                    <SalonCard
                      key={salon.id}
                      salon={salon}
                      idx={idx}
                      matchedTags={styleTags}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-12 text-center space-y-4"
                >
                  <div className="text-5xl">🪞</div>
                  <h3 className="text-white font-serif text-xl">No exact matches in our network</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                    We couldn&apos;t find Bandra salons tagged with{' '}
                    <span className="text-amber-400">{styleTags.join(', ')}</span> yet.
                    Try uploading a different inspiration, or browse all salons to book a consultation.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={reset}
                      className="flex items-center gap-2 px-5 py-2.5 border border-white/15 text-slate-300 hover:border-white/30 rounded-xl text-sm transition-all"
                    >
                      <RefreshCw size={13} />
                      Try another photo
                    </button>
                    <Link
                      href="/discover"
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-all"
                      style={{ boxShadow: '0 0 20px rgba(212,175,55,0.3)' }}
                    >
                      <Sparkles size={13} />
                      Browse All Salons
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function StyleMirrorPage() {
  return (
    <ProtectedRoute>
      <StyleMirrorContent />
    </ProtectedRoute>
  );
}
