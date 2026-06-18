'use client';

import { useState, useCallback } from 'react';
import { Upload, Camera, Sparkles, Download, RefreshCw, Loader2, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

type AnalysisMode = 'makeup' | 'color';
type StudioState = 'upload' | 'choose' | 'analyzing' | 'result';

// ─── Render Gemini plain-text as structured UI ───────────────────────────────
function ReportRenderer({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-3" />;

        // H1: # heading
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="font-serif text-2xl text-white mt-4 mb-2 pb-2 border-b border-amber-500/30">
              {trimmed.replace(/^# /, '')}
            </h1>
          );
        }
        // H2: ## heading
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-amber-400 font-semibold text-base uppercase tracking-wider mt-5 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full inline-block" />
              {trimmed.replace(/^## /, '')}
            </h2>
          );
        }
        // H3: ### heading
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-slate-200 font-semibold text-sm mt-3 mb-1">
              {trimmed.replace(/^### /, '')}
            </h3>
          );
        }
        // Horizontal rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={i} className="border-white/10 my-3" />;
        }
        // Bullet points: * or - or •
        if (/^[\*\-•]\s/.test(trimmed)) {
          const content = trimmed.replace(/^[\*\-•]\s/, '');
          return (
            <div key={i} className="flex items-start gap-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
              <span className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }
        // Table rows: | col | col |
        if (trimmed.startsWith('|')) {
          return <TableRow key={i} line={trimmed} index={i} />;
        }
        // Bold label lines: **Label:** value
        if (trimmed.startsWith('**') && trimmed.includes(':**')) {
          const colonIdx = trimmed.indexOf(':**');
          const label = trimmed.slice(2, colonIdx);
          const value = trimmed.slice(colonIdx + 3).trim();
          return (
            <div key={i} className="flex items-start gap-2 py-1">
              <span className="text-amber-400 text-sm font-semibold shrink-0 min-w-[120px]">{label}:</span>
              <span className="text-slate-300 text-sm" dangerouslySetInnerHTML={{ __html: formatInline(value) }} />
            </div>
          );
        }
        // Numbered list: 1. 2. etc
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\.\s/)?.[1];
          const content = trimmed.replace(/^\d+\.\s/, '');
          return (
            <div key={i} className="flex items-start gap-3 py-0.5">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{num}</span>
              <span className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }
        // Regular paragraph
        return (
          <p key={i} className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        );
      })}
    </div>
  );
}

// Inline bold/italic formatting
function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-200 italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-700 text-amber-300 px-1 rounded text-xs">$1</code>');
}

// Markdown table row renderer (stateful via context)
const tableState: { isHeader: boolean } = { isHeader: true };
function TableRow({ line, index }: { line: string; index: number }) {
  const cells = line.split('|').filter(c => c.trim() !== '');
  // Separator row: |---|---|
  const isSeparator = cells.every(c => /^[-:\s]+$/.test(c));
  if (isSeparator) {
    tableState.isHeader = false;
    return null;
  }
  if (index === 0 || tableState.isHeader) {
    tableState.isHeader = false; // reset after first header
    return (
      <div className="flex gap-0 overflow-hidden rounded-t-lg border-b border-amber-500/30 bg-slate-800/80 mt-3">
        {cells.map((cell, j) => (
          <div key={j} className="flex-1 px-3 py-2 text-amber-400 text-xs font-semibold uppercase tracking-wider text-center border-r border-white/10 last:border-r-0">
            {cell.trim()}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-0 border-b border-white/5 bg-slate-800/40 hover:bg-slate-700/30 transition-colors">
      {cells.map((cell, j) => (
        <div key={j} className="flex-1 px-3 py-2 text-slate-300 text-xs border-r border-white/5 last:border-r-0" dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
      ))}
    </div>
  );
}

// ─── PDF Export ──────────────────────────────────────────────────────────────
async function exportToPDF(mode: AnalysisMode) {
  const html2pdf = (await import('html2pdf.js')).default;
  const element = document.getElementById('zuri-report-pdf');
  if (!element) return;
  const options = {
    margin: 0,
    filename: `Zuri_${mode === 'makeup' ? 'Makeup_Analysis' : 'Color_Analysis'}_Report.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f172a' },
    jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css'] },
  };
  await html2pdf().set(options).from(element).save();
}

// ─── Hex colour swatch helper ─────────────────────────────────────────────────
function renderPDFLine(text: string): React.ReactNode[] {
  // Split on #RRGGBB or #RGB tokens; use a stateless (non-g) regex for the test
  const splitPattern = /(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})/g;
  const isHex = (s: string) => /^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(s);
  const parts = text.split(splitPattern);
  return parts.map((part, idx) => {
    if (isHex(part)) {
      return (
        <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '0 2px' }}>
          <span style={{
            display: 'inline-block', width: '12px', height: '12px',
            backgroundColor: part, borderRadius: '3px',
            border: '1px solid rgba(255,255,255,0.25)', verticalAlign: 'middle',
          }} />
          <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8' }}>{part}</span>
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

// ─── PDF Print View (hidden, used by html2pdf) ───────────────────────────────
function PDFView({ text, mode, preview }: { text: string; mode: AnalysisMode; preview: string | null }) {
  const lines = text.split('\n');
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    // Outer full-page wrapper — fills entire PDF page with theme background
    <div style={{
      backgroundColor: '#0f172a',
      minHeight: '100%',
      width: '100%',
      padding: 0,
      margin: 0,
    }}>
      <div id="zuri-report-pdf" style={{
        backgroundColor: '#0f172a', color: '#f1f5f9',
        fontFamily: "'Georgia', serif", padding: '36px 44px 40px',
        width: '100%', boxSizing: 'border-box', lineHeight: '1.6',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid rgba(245,158,11,0.5)', paddingBottom: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {preview && (
              <img src={preview} alt="portrait" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(245,158,11,0.5)' }} />
            )}
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>Zuri</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase' }}>AI Diagnostic Studio</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
              {mode === 'makeup' ? '💄 Makeup & Undertone Report' : '🎨 Personal Color Report'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
              {dateStr} · {timeStr}
            </div>
          </div>
        </div>

        {/* Content */}
        {lines.map((line, i) => {
          const t = line.trim();
          if (!t) return <div key={i} style={{ height: '6px' }} />;
          if (t.startsWith('# '))  return <h1 key={i} style={{ fontSize: '17px', fontWeight: 700, color: '#f59e0b', margin: '16px 0 6px', borderBottom: '1px solid rgba(245,158,11,0.25)', paddingBottom: '4px' }}>{t.replace(/^# /, '')}</h1>;
          if (t.startsWith('## ')) return <h2 key={i} style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', margin: '14px 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.replace(/^## /, '')}</h2>;
          if (t.startsWith('### ')) return <h3 key={i} style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0', margin: '10px 0 3px' }}>{t.replace(/^### /, '')}</h3>;
          if (t === '---' || t === '***') return <hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '10px 0' }} />;
          if (/^[\*\-•]\s/.test(t)) return (
            <div key={i} style={{ display: 'flex', gap: '8px', margin: '3px 0', alignItems: 'flex-start' }}>
              <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>•</span>
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>{renderPDFLine(t.replace(/^[\*\-•]\s/, ''))}</span>
            </div>
          );
          if (t.startsWith('|')) {
            const cells = t.split('|').filter(c => c.trim() !== '');
            const isSep = cells.every(c => /^[-:\s]+$/.test(c));
            if (isSep) return null;
            return (
              <div key={i} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {cells.map((cell, j) => (
                  <div key={j} style={{ flex: 1, padding: '5px 8px', fontSize: '10px', color: j === 0 ? '#f59e0b' : '#cbd5e1', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    {renderPDFLine(cell.trim())}
                  </div>
                ))}
              </div>
            );
          }
          return <p key={i} style={{ fontSize: '11px', color: '#cbd5e1', margin: '3px 0', lineHeight: '1.7' }}>{renderPDFLine(t)}</p>;
        })}

        {/* Footer */}
        <div style={{ marginTop: '28px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#475569' }}>
          <span>Generated by Zuri AI Diagnostic Studio · Generated by Gemini</span>
          <span>zuri.in · Mumbai&apos;s Premium Salon Marketplace</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function DiagnosticsContent() {
  const { user } = useAuth();
  const [studioState, setStudioState] = useState<StudioState>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [reportText, setReportText] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('makeup');
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      setFileData({ base64, mimeType: file.type });
      setStudioState('choose');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const runAnalysis = async (mode: AnalysisMode) => {
    if (!fileData) return;
    setSelectedMode(mode);
    setStudioState('analyzing');
    setError(null);

    try {
      const res = await fetch('/api/ai/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: fileData.base64, mimeType: fileData.mimeType, mode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Analysis failed. Please try again.');
        setStudioState('choose');
        return;
      }

      setReportText(data.text ?? '');

      // Save to Supabase user profile
      if (user) {
        await supabase.from('users')
          .update({ ai_diagnostic_results: { mode, text: data.text, generated_at: new Date().toISOString() } })
          .eq('id', user.id);
      }

      setStudioState('result');
    } catch {
      setError('Network error. Please try again.');
      setStudioState('choose');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    await exportToPDF(selectedMode);
    setExporting(false);
  };

  const reset = () => {
    setStudioState('upload');
    setPreview(null);
    setFileData(null);
    setReportText('');
    setError(null);
  };

  const stepIndex: Record<StudioState, number> = { upload: 0, choose: 1, analyzing: 1, result: 2 };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Top gradient bar */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-b border-white/8">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Sparkles size={22} className="text-slate-900" />
              </div>
              <div>
                <h1 className="font-serif text-3xl text-white">AI Diagnostic Studio</h1>
                <p className="text-slate-400 text-sm mt-0.5">Powered by Google Gemini Vision · Mumbai Beauty Intelligence</p>
              </div>
            </div>
            <Link href="/home" className="text-slate-500 hover:text-white text-sm transition-colors mt-1">← Home</Link>
          </div>

          {/* Step tracker */}
          <div className="flex items-center gap-2 mt-7">
            {['Upload Portrait', 'Choose Analysis', 'View Report'].map((label, i) => {
              const current = stepIndex[studioState];
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < current ? 'bg-green-500 text-white' : i === current ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/30' : 'bg-slate-700 text-slate-500'
                  }`}>
                    {i < current ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm transition-colors ${i === current ? 'text-white font-medium' : 'text-slate-500'}`}>{label}</span>
                  {i < 2 && <ChevronRight size={13} className="text-slate-600 mx-1" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{error}</p>
              {error.includes('Rate limit') && (
                <p className="text-red-400/70 text-xs mt-1">The Gemini free tier allows limited requests per minute. Wait 30–60 seconds and try again.</p>
              )}
              {error.includes('API key') && (
                <p className="text-red-400/70 text-xs mt-1">Open <code className="bg-red-900/30 px-1 rounded">.env.local</code> and paste your key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">aistudio.google.com/apikey</a></p>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Upload */}
        {studioState === 'upload' && (
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`rounded-3xl border-2 border-dashed p-20 text-center transition-all cursor-pointer ${
              dragOver ? 'border-amber-500 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/40 hover:bg-amber-500/[0.02]'
            }`}
          >
            <div className="flex flex-col items-center gap-5">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${dragOver ? 'bg-amber-500/25' : 'bg-slate-800 hover:bg-slate-700'}`}>
                <Camera size={36} className={`transition-colors ${dragOver ? 'text-amber-400' : 'text-slate-500'}`} />
              </div>
              <div>
                <p className="text-white text-xl font-semibold mb-1.5">Drop your portrait here</p>
                <p className="text-slate-400 text-sm">JPG · PNG · WEBP — clear front-facing photo works best</p>
              </div>
              <label className="flex items-center gap-2 px-7 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl cursor-pointer transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.35)] text-sm">
                <Upload size={15} />
                Choose Portrait
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </label>
              <p className="text-slate-600 text-xs">Your photo is only used for this analysis and is not stored.</p>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Mode */}
        {studioState === 'choose' && preview && (
          <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
            {/* Photo preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-800/60">
              <img src={preview} alt="Your portrait" className="w-full aspect-square object-cover" />
              <div className="p-4">
                <p className="text-white text-sm font-medium flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Photo ready</p>
                <button onClick={reset} className="mt-2 text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors">
                  <RefreshCw size={11} /> Change photo
                </button>
              </div>
            </div>

            {/* Analysis buttons */}
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="font-serif text-2xl text-white mb-1">Select Analysis Type</h2>
                <p className="text-slate-400 text-sm">Gemini AI will analyse your portrait and generate a personalised report.</p>
              </div>

              {/* Makeup Analysis */}
              <button onClick={() => runAnalysis('makeup')}
                className="w-full text-left p-6 rounded-2xl border border-white/10 bg-slate-800/50 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 group-hover:bg-amber-500/25 transition-colors flex items-center justify-center text-3xl shrink-0">
                    💄
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-bold text-lg">Makeup & Skin Undertone</h3>
                      <ChevronRight size={18} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">
                      Skin undertone assessment, ideal makeup styles, shade comparisons, and product colour recommendations.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Undertone', 'Foundation', 'Lip Shades', 'Eyeshadow', 'Blush', 'Look Style'].map(t => (
                        <span key={t} className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>

              {/* Color Analysis */}
              <button onClick={() => runAnalysis('color')}
                className="w-full text-left p-6 rounded-2xl border border-white/10 bg-slate-800/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 group-hover:bg-purple-500/25 transition-colors flex items-center justify-center text-3xl shrink-0">
                    🎨
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-bold text-lg">Personal Color Analysis</h3>
                      <ChevronRight size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">
                      Clothing palette comparisons, seasonal colour profile, best and worst wardrobe shades for your features.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Season', 'Wardrobe Colors', 'Best Neutrals', 'Accents', 'Metals', 'Contrast'].map(t => (
                        <span key={t} className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2.5: Analyzing */}
        {studioState === 'analyzing' && preview && (
          <div className="rounded-2xl p-16 text-center border border-white/10 bg-slate-800/40">
            <img src={preview} alt="Portrait" className="w-24 h-24 rounded-full mx-auto mb-8 object-cover ring-4 ring-amber-500/40" />
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <Loader2 size={64} className="text-amber-400/30 animate-spin absolute inset-0" />
                <Loader2 size={48} className="text-amber-400 animate-spin absolute inset-0 m-auto" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
                <Sparkles size={20} className="text-amber-300 absolute inset-0 m-auto" />
              </div>
            </div>
            <h2 className="text-white font-serif text-2xl mb-2">
              {selectedMode === 'makeup' ? 'Analysing skin & makeup…' : 'Mapping colour season…'}
            </h2>
            <p className="text-slate-400 text-sm">Gemini Vision is reading your portrait. This takes 5–15 seconds.</p>
          </div>
        )}

        {/* STEP 3: Result */}
        {studioState === 'result' && reportText && (
          <div className="space-y-5">
            {/* Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-green-400 text-sm font-medium">Analysis complete</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 text-sm">{selectedMode === 'makeup' ? 'Makeup & Undertone Report' : 'Personal Color Report'}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 border border-white/15 text-slate-300 hover:border-white/30 rounded-xl text-sm transition-all">
                  <RefreshCw size={13} /> New Analysis
                </button>
                <button onClick={handleExport} disabled={exporting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] text-sm">
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {exporting ? 'Generating PDF…' : 'Export PDF'}
                </button>
              </div>
            </div>

            {/* Report panel */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/50 overflow-hidden">
              {/* Report header */}
              <div className={`px-6 py-4 border-b border-white/10 flex items-center gap-4 ${
                selectedMode === 'makeup'
                  ? 'bg-gradient-to-r from-amber-500/10 to-transparent'
                  : 'bg-gradient-to-r from-purple-500/10 to-transparent'
              }`}>
                {preview && <img src={preview} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/40 shrink-0" />}
                <div>
                  <p className={`text-xs uppercase tracking-widest font-semibold ${selectedMode === 'makeup' ? 'text-amber-400' : 'text-purple-400'}`}>
                    {selectedMode === 'makeup' ? '💄 Makeup & Skin Undertone Report' : '🎨 Personal Color Analysis Report'}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">Generated by Gemini · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                </div>
              </div>

              {/* Report content */}
              <div className="p-6">
                <ReportRenderer text={reportText} />
              </div>
            </div>

            {/* Hidden PDF element */}
            <div className="sr-only" aria-hidden="true">
              <PDFView text={reportText} mode={selectedMode} preview={preview} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DiagnosticsPage() {
  return (
    <ProtectedRoute>
      <DiagnosticsContent />
    </ProtectedRoute>
  );
}
