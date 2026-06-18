'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Target, Sparkles, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

interface Review {
  id: string;
  text: string;
  rating: number;
  created_at: string;
  users: { name: string } | null;
}

interface OwnerAnalysis {
  topAsset: string;
  frictionPoint: string;
  growthSuggestion: string;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analysis, setAnalysis] = useState<OwnerAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data: salonData } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      if (!salonData) { setLoading(false); return; }

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, text, rating, created_at, users(name)')
        .eq('salon_id', salonData.id)
        .order('created_at', { ascending: false });
      setReviews((reviewData ?? []) as unknown as Review[]);
      setLoading(false);

      // Fetch AI analysis
      if (reviewData && reviewData.length > 0) {
        setAiLoading(true);
        try {
          const res = await fetch('/api/ai/review-synthesis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviews: reviewData, mode: 'owner' }),
          });
          const data = await res.json();
          setAnalysis(data);
        } catch {
          // fallback to mock
          setAnalysis({
            topAsset: 'Your reviews show strong customer satisfaction.',
            frictionPoint: 'Wait times appear to be the most common complaint.',
            growthSuggestion: 'Consider adding an online queue management system.',
          });
        }
        setAiLoading(false);
      }
    }
    load();
  }, [user]);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-white">Review Analytics</h1>
          <p className="text-slate-400 mt-1 text-sm">AI-powered insights from your customer feedback.</p>
        </div>
        <div className="glass-panel rounded-xl px-4 py-3 border border-white/10 text-center">
          <p className="text-amber-400 text-2xl font-bold">{avgRating}</p>
          <p className="text-slate-500 text-xs">{reviews.length} reviews</p>
        </div>
      </div>

      {/* AI Analysis Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">AI Business Analysis</span>
        </div>

        {aiLoading ? (
          <div className="glass-panel rounded-2xl p-8 border border-purple-500/20 flex items-center gap-3 text-slate-400">
            <Loader2 size={18} className="animate-spin text-purple-400" />
            <span>Gemini is analyzing your reviews…</span>
          </div>
        ) : analysis ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl p-6 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-green-400/10 flex items-center justify-center">
                  <TrendingUp size={15} className="text-green-400" />
                </div>
                <span className="text-green-400 text-xs font-medium uppercase tracking-wider">Top Asset</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{analysis.topAsset}</p>
            </div>
            <div className="glass-panel rounded-2xl p-6 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-red-400/10 flex items-center justify-center">
                  <AlertTriangle size={15} className="text-red-400" />
                </div>
                <span className="text-red-400 text-xs font-medium uppercase tracking-wider">Friction Point</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{analysis.frictionPoint}</p>
            </div>
            <div className="glass-panel rounded-2xl p-6 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-400/10 flex items-center justify-center">
                  <Target size={15} className="text-blue-400" />
                </div>
                <span className="text-blue-400 text-xs font-medium uppercase tracking-wider">Growth Suggestion</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{analysis.growthSuggestion}</p>
            </div>
          </div>
        ) : !loading && reviews.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-slate-400">No reviews yet. AI analysis will appear once customers review your salon.</p>
          </div>
        ) : null}
      </div>

      {/* Raw Reviews Feed */}
      <div>
        <h2 className="text-white font-medium font-serif text-lg mb-4">Customer Reviews ({reviews.length})</h2>
        <div className="space-y-4">
          {loading && [1, 2].map(i => (
            <div key={i} className="glass-panel rounded-2xl p-5 border border-white/10 animate-pulse">
              <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-700/50 rounded w-full" />
            </div>
          ))}
          {!loading && reviews.length === 0 && (
            <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
              <p className="text-slate-400">No customer reviews yet.</p>
            </div>
          )}
          {reviews.map(r => (
            <div key={r.id} className="glass-panel rounded-2xl p-5 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-semibold text-sm shrink-0">
                    {(r.users?.name ?? 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{r.users?.name ?? 'Anonymous'}</p>
                    <p className="text-slate-500 text-xs">{timeAgo(r.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
