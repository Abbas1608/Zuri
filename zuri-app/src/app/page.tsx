'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HeritageLandingPage() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bgRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      bgRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#001220]">
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute inset-[-40px] z-0 transition-transform duration-700 ease-out"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=2400&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
        }}
      />

      {/* Deep gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#001220] via-[#001220]/60 to-[#001220]/80" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] bg-amber-700/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-900/15 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Floating silk curtain effects */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-amber-900/10 to-transparent blur-xl pointer-events-none z-0" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-amber-900/10 to-transparent blur-xl pointer-events-none z-0" />

      {/* Center Glassmorphic Card */}
      <div className="relative z-10 text-center px-4 animate-[fadeInUp_1s_ease_forwards]">
        {/* Heritage arch frame */}
        <div className="relative inline-block mb-8">
          <div className="absolute -inset-4 rounded-[50%_50%_0_0/60%_60%_0_0] border border-amber-600/20 pointer-events-none" />
          <div className="absolute -inset-8 rounded-[50%_50%_0_0/60%_60%_0_0] border border-amber-600/10 pointer-events-none" />
        </div>

        {/* Glass card */}
        <div
          className="inline-flex flex-col items-center gap-6 px-16 py-14 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 0 60px rgba(0,0,0,0.4), inset 0 0 40px rgba(212,175,55,0.03)',
          }}
        >
          {/* Gold accent line */}
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* Brand name */}
          <div>
            <h1
              className="text-7xl md:text-9xl text-white tracking-[0.12em]"
              style={{ fontFamily: 'var(--font-playfair)', textShadow: '0 0 40px rgba(212,175,55,0.2)' }}
            >
              Zuri
            </h1>
            <p className="text-amber-400/70 text-xs tracking-[0.4em] uppercase mt-3 font-light">
              Mumbai&apos;s Premium Salon Experience
            </p>
          </div>

          {/* Gold accent line */}
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* CTA */}
          <Link
            href="/signup"
            id="enter-cta"
            className="mt-2 px-10 py-4 rounded-full text-slate-900 font-semibold tracking-wide text-sm transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f0c040)',
              boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 32px rgba(212,175,55,0.55)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.04)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(212,175,55,0.35)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
            }}
          >
            Enter the Vibe
          </Link>
        </div>

        {/* Bottom caption */}
        <p className="mt-10 text-slate-500 text-xs tracking-[0.25em] uppercase">
          Bandra · Juhu · Colaba · Andheri
        </p>
      </div>

      {/* Fade-in keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
