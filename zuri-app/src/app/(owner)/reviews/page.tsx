'use client';

import { TrendingUp, AlertTriangle, Target, Sparkles, Star } from 'lucide-react';
import { aiMocks } from '@/utils/ai-mocks';

const rawReviews = [
  { user: 'Priya M.', rating: 5, text: 'Absolutely stunning balayage. The senior stylist is a genius!', date: '2 days ago' },
  { user: 'Anika S.', rating: 5, text: 'Best bridal makeup in Bandra. So professional and relaxed.', date: '1 week ago' },
  { user: 'Reena K.', rating: 4, text: 'Loved the service but Friday evening wait was 45 mins. Worth it though!', date: '2 weeks ago' },
  { user: 'Deepa V.', rating: 5, text: 'The balayage team here is unmatched in all of Mumbai.', date: '3 weeks ago' },
  { user: 'Meera J.', rating: 3, text: 'Great services but the wait times on weekends need to be fixed.', date: '1 month ago' },
];

export default function ReviewsPage() {
  const analysis = aiMocks.adminReviewAnalysis;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-white">Review Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">AI-powered insights from your customer feedback.</p>
      </div>

      {/* AI Analysis Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">AI Business Analysis</span>
        </div>
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
      </div>

      {/* Raw Reviews Feed */}
      <div>
        <h2 className="text-white font-medium font-serif text-lg mb-4">Raw Review Feed</h2>
        <div className="space-y-4">
          {rawReviews.map((r, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-semibold text-sm shrink-0">
                    {r.user[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{r.user}</p>
                    <p className="text-slate-500 text-xs">{r.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{r.text}</p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <button className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors">Reply →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
