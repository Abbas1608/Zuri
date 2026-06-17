'use client';

import { useState } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { aiMocks } from '@/utils/ai-mocks';
import Link from 'next/link';

type DiagnosticState = 'idle' | 'analyzing' | 'done';

export default function DiagnosticsPage() {
  const [state, setState] = useState<DiagnosticState>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const result = aiMocks.diagnosticStudio;

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setState('analyzing');
    setTimeout(() => setState('done'), 2500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-white">AI Diagnostic Studio</h1>
            <p className="text-slate-400 mt-1">Upload a selfie to get your personalized beauty profile</p>
          </div>
          <Link href="/home" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">Skip →</Link>
        </div>

        {state === 'idle' && (
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`glass-panel rounded-2xl border-2 border-dashed p-16 text-center transition-all cursor-pointer ${
              dragOver ? 'border-amber-500/80 bg-amber-500/5' : 'border-white/20 hover:border-white/40'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Camera size={28} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium text-lg">Drop your selfie here</p>
                <p className="text-slate-400 text-sm mt-1">or click to browse — JPG, PNG supported</p>
              </div>
              <label className="px-6 py-2.5 bg-amber-500 text-slate-900 rounded-full text-sm font-medium cursor-pointer hover:bg-amber-400 transition-colors">
                <Upload size={14} className="inline mr-2" />
                Choose File
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </label>
            </div>
          </div>
        )}

        {state === 'analyzing' && (
          <div className="glass-panel rounded-2xl p-16 text-center border border-white/10">
            {preview && <img src={preview} alt="Selfie preview" className="w-32 h-32 rounded-full mx-auto mb-6 object-cover ring-4 ring-amber-500/40" />}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-white font-medium">Analyzing your beauty profile…</p>
            <p className="text-slate-400 text-sm mt-1">Our AI is identifying your undertone and recommending styles</p>
          </div>
        )}

        {state === 'done' && (
          <div className="space-y-6">
            {/* Undertone Card */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center gap-6">
              {preview && <img src={preview} alt="Selfie" className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-500/40 shrink-0" />}
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Your Undertone</p>
                <p className="text-2xl font-serif text-amber-400">{result.undertone}</p>
                <div className="flex items-center gap-2 mt-2"><CheckCircle size={14} className="text-green-400" /><span className="text-green-400 text-sm">Analysis complete</span></div>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h2 className="font-serif text-lg text-white mb-4">Your Colour Palette</h2>
              {(['foundation', 'lipColors', 'eyeshadows'] as const).map(category => (
                <div key={category} className="mb-4 last:mb-0">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">{category}</p>
                  <div className="flex gap-3">
                    {result.makeupRecommendations[category].map(hex => (
                      <div key={hex} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full ring-2 ring-white/20" style={{ backgroundColor: hex }} />
                        <span className="text-xs text-slate-500">{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Hairstyles Matrix */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-panel rounded-2xl p-6 border border-green-500/20">
                <h3 className="text-green-400 font-medium mb-3 flex items-center gap-2"><CheckCircle size={16} /> Flattering</h3>
                <ul className="space-y-2">
                  {result.hairstyles.flattering.map(s => <li key={s} className="text-slate-300 text-sm flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>{s}</li>)}
                </ul>
              </div>
              <div className="glass-panel rounded-2xl p-6 border border-red-500/20">
                <h3 className="text-red-400 font-medium mb-3 flex items-center gap-2"><AlertCircle size={16} /> Avoid</h3>
                <ul className="space-y-2">
                  {result.hairstyles.avoid.map(s => <li key={s} className="text-slate-300 text-sm flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>{s}</li>)}
                </ul>
              </div>
            </div>

            <Link href="/home" className="block w-full py-3.5 text-center bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Continue to My Home →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
