"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Loader2, TrendingUp, AlertTriangle, ShieldCheck, ShieldAlert, Star } from "lucide-react";

interface ReviewInsights {
  topAsset: string;
  frictionPoint: string;
  growthSuggestion: string;
}

interface AnalysisResult {
  totalAnalyzed: number;
  sentiment: { good: number; neutral: number; bad: number };
  authenticity: { real: number; suspicious: number };
  insights: ReviewInsights;
}

interface DBReview {
  id: string;
  rating: number;
  text: string;
  created_at: string;
  user_id: string;
}

export default function OwnerReviewsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawReviews, setRawReviews] = useState<DBReview[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    async function fetchAndAnalyze() {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // 1. Fetch current user (Owner)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 2. Fetch the owner's salon
        // Assuming owner has one salon for this demo
        const { data: salons, error: salonError } = await supabase
          .from("salons")
          .select("id")
          .eq("owner_id", user.id)
          .limit(1);

        if (salonError || !salons || salons.length === 0) {
           // Fallback to testing with the first salon in the DB if not an owner
           const { data: anySalon } = await supabase.from("salons").select("id").limit(1);
           if (!anySalon || anySalon.length === 0) throw new Error("No salons found in database.");
           salons.push(anySalon[0]);
        }

        const salonId = salons[0].id;

        // 3. Fetch reviews for the salon
        const { data: reviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("salon_id", salonId)
          .order("created_at", { ascending: false });

        if (reviewsError) throw reviewsError;
        setRawReviews(reviews || []);

        if (!reviews || reviews.length === 0) {
          setLoading(false);
          return;
        }

        // 4. Send to Python NLP Engine
        const reviewTexts = reviews.map((r) => r.text);
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviews: reviewTexts }),
        });

        if (!response.ok) {
          throw new Error("Failed to analyze reviews with Python NLP engine");
        }

        const result: AnalysisResult = await response.json();
        setAnalysis(result);
      } catch (err: any) {
        console.error("Error in fetchAndAnalyze:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchAndAnalyze();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-8 text-white">
        <Loader2 className="h-12 w-12 text-[#FFD700] animate-spin mb-4" />
        <p className="text-zinc-400 font-medium">Running Python NLP Analysis on {rawReviews.length || "..."} reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8 text-white">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-lg text-center backdrop-blur-md">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-12 font-sans selection:bg-[#FFD700]/30 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#FFD700]/10 to-transparent pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-2">
            AI Review Analytics
          </h1>
          <p className="text-zinc-400">Powered by Python NLP & Next.js</p>
        </div>

        {analysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Vibe Meter (Sentiment) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">Vibe Meter</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-400 font-medium">Good</span>
                    <span className="text-zinc-300">{analysis.sentiment.good}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: \`\${analysis.sentiment.good}%\` }} transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-green-400 rounded-full" 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400 font-medium">Neutral</span>
                    <span className="text-zinc-300">{analysis.sentiment.neutral}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: \`\${analysis.sentiment.neutral}%\` }} transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-zinc-500 rounded-full" 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-red-400 font-medium">Bad</span>
                    <span className="text-zinc-300">{analysis.sentiment.bad}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: \`\${analysis.sentiment.bad}%\` }} transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-red-400 rounded-full" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. Trust Score (Authenticity) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-purple-500/20 rounded-xl">
                    <ShieldCheck className="h-5 w-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Trust Score</h2>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Our heuristics analyzed {analysis.totalAnalyzed} reviews for repetitive text, spam formatting, and bot patterns.
                </p>
              </div>
              
              <div className="flex items-end justify-between mt-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-4xl font-bold text-white mb-1">{analysis.authenticity.real}%</p>
                  <p className="text-xs text-green-400 font-medium tracking-wide uppercase">Authentic Reviews</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-zinc-300 mb-1">{analysis.authenticity.suspicious}%</p>
                  <p className="text-xs text-red-400 font-medium tracking-wide uppercase flex items-center gap-1 justify-end">
                    <ShieldAlert className="h-3 w-3" /> Suspicious
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3. AI Action Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#FFD700]/10 to-transparent backdrop-blur-xl border border-[#FFD700]/30 p-6 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 blur-3xl rounded-full" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 bg-[#FFD700]/20 rounded-xl">
                  <Star className="h-5 w-5 text-[#FFD700]" />
                </div>
                <h2 className="text-xl font-semibold text-[#FFD700]">AI Action Plan</h2>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">Top Asset</p>
                  <p className="font-medium text-white text-lg">{analysis.insights.topAsset}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">Friction Point</p>
                  <p className="font-medium text-white text-lg">{analysis.insights.frictionPoint}</p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#FFD700]/20 relative z-10">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  <span className="text-[#FFD700] font-semibold">Suggestion: </span> 
                  {analysis.insights.growthSuggestion}
                </p>
              </div>
            </motion.div>

          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center">
            <p className="text-zinc-400">No reviews found to analyze.</p>
          </div>
        )}

        {/* Raw Reviews List (Preview) */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Raw Dataset <span className="text-sm font-normal text-zinc-500 bg-white/5 px-3 py-1 rounded-full">{rawReviews.length} records</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rawReviews.slice(0, 6).map((review) => (
              <div key={review.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={\`h-4 w-4 \${i < review.rating ? "text-[#FFD700] fill-[#FFD700]" : "text-zinc-600"}\`} />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 line-clamp-3">{review.text}</p>
              </div>
            ))}
          </div>
          {rawReviews.length > 6 && (
            <p className="text-center text-sm text-zinc-500 mt-6">+ {rawReviews.length - 6} more reviews processed in backend</p>
          )}
        </div>
      </div>
    </div>
  );
}
