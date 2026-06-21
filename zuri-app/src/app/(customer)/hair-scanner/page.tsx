'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import HairCareScanner from '@/components/HairCareScanner';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function HairScannerContent() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link
          href="/home"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-slate-500 text-sm">Zuri Diagnostic</span>
      </nav>

      {/* Hero */}
      <div
        className="relative px-6 py-12 text-center overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,48,73,0.6) 0%, transparent 70%), #0f172a',
        }}
      >
        {/* ambient orbs */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(212,175,55,0.06)' }}
        />
        <div className="relative z-10 max-w-xl mx-auto">
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: 'rgba(212,175,55,0.8)' }}
          >
            ✦ Mumbai Water Intelligence
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-3 leading-tight">
            Zuri Hair Care Scanner
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Enter your Mumbai pincode and hair profile — we instantly calculate your
            local water TDS and generate a hyper-personalised hair care prescription.
            <br />
            <span className="text-slate-500">Zero AI tokens · 0ms latency · 100% local.</span>
          </p>
        </div>
      </div>

      {/* Scanner Card */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <HairCareScanner />
      </div>
    </main>
  );
}

export default function HairScannerPage() {
  return (
    <ProtectedRoute>
      <HairScannerContent />
    </ProtectedRoute>
  );
}
