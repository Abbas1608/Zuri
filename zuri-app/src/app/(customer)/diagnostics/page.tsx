'use client';

import { useState, useCallback } from 'react';
import {
  Upload, Camera, Sparkles, Download, RefreshCw,
  Loader2, CheckCircle, ChevronRight, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ─── Types ────────────────────────────────────────────────────────────────────
type AnalysisMode = 'makeup' | 'color';
type StudioState  = 'upload' | 'choose' | 'analyzing' | 'result';
type PDFTheme     = 'dark' | 'cream' | 'rose';

interface ColorSwatch {
  name: string;
  hex: string;
  reason?: string;
  category?: string;
}
interface MakeupReport {
  undertone: { type: string; description: string; hex: string };
  skinCondition: string;
  overallStyle: string;
  foundation: ColorSwatch[];
  lipColors: ColorSwatch[];
  eyeshadow: ColorSwatch[];
  blush: ColorSwatch[];
  eyeliner: ColorSwatch[];
  highlight: ColorSwatch[];
  avoid: ColorSwatch[];
  tip: string;
  looks?: { name: string; description: string }[];
}
interface ColorReport {
  season: string;
  seasonDescription: string;
  undertone: { type: string; description: string; hex: string };
  bestColors: ColorSwatch[];
  avoidColors: ColorSwatch[];
  metals: string[];
  neutrals: ColorSwatch[];
  tip: string;
}

// ─── Metal palette ────────────────────────────────────────────────────────────
const METAL_HEX: Record<string, string> = {
  Gold: '#D4AF37', Silver: '#C0C0C0', Copper: '#B87333',
  'Rose Gold': '#B76E79', Bronze: '#CD7F32', Platinum: '#E5E4E2',
};

// ─── SwatchCircle ─────────────────────────────────────────────────────────────
function SwatchCircle({ hex, name, crossed = false }: { hex: string; name: string; crossed?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div className="relative">
        <div
          className="w-14 h-14 rounded-full transition-transform duration-200 group-hover:scale-110 cursor-default"
          style={{
            backgroundColor: hex,
            boxShadow: `0 4px 16px ${hex}55, 0 0 0 2px rgba(255,255,255,0.07)`,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-transparent" />
        </div>
        {crossed && (
          <div className="absolute inset-0 rounded-full border-2 border-red-500/70 flex items-center justify-center pointer-events-none">
            <span className="text-red-400 text-lg font-extrabold leading-none select-none">✕</span>
          </div>
        )}
      </div>
      <span className="text-[9.5px] text-slate-400 text-center leading-tight max-w-[58px]">{name}</span>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
const ACCENT_MAP = {
  amber:  { border: 'border-amber-500/20',  bg: 'bg-amber-500/5',  title: 'text-amber-400'  },
  rose:   { border: 'border-rose-500/20',   bg: 'bg-rose-500/5',   title: 'text-rose-400'   },
  purple: { border: 'border-purple-500/20', bg: 'bg-purple-500/5', title: 'text-purple-400' },
  blue:   { border: 'border-blue-500/20',   bg: 'bg-blue-500/5',   title: 'text-blue-400'   },
  red:    { border: 'border-red-500/20',    bg: 'bg-red-500/5',    title: 'text-red-400'    },
} as const;

function SectionCard({ title, icon, children, accent = 'amber' }: {
  title: string; icon: string; children: React.ReactNode;
  accent?: keyof typeof ACCENT_MAP;
}) {
  const a = ACCENT_MAP[accent];
  return (
    <div className={`rounded-2xl border ${a.border} ${a.bg} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className={`font-semibold text-xs uppercase tracking-widest ${a.title}`}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Makeup Report Visual ─────────────────────────────────────────────────────
function MakeupReportView({ report, preview }: { report: MakeupReport; preview: string | null }) {
  return (
    <div className="space-y-4">
      {/* Hero: Portrait + Undertone */}
      <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 flex flex-col sm:flex-row gap-6 items-start">
        {preview && (
          <div className="shrink-0 relative">
            <img
              src={preview} alt="Your portrait"
              className="w-28 h-28 rounded-2xl object-cover shadow-2xl"
              style={{ boxShadow: `0 0 40px ${report.undertone.hex}50` }}
            />
            {/* Undertone dot badge */}
            <div
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full border-[3px] border-slate-800 shadow-xl"
              style={{ backgroundColor: report.undertone.hex }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1">Skin Undertone</p>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-full shrink-0"
              style={{ backgroundColor: report.undertone.hex, boxShadow: `0 4px 14px ${report.undertone.hex}70` }}
            />
            <h2 className="font-serif text-2xl text-white">{report.undertone.type}</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-3">{report.undertone.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-slate-700/80 border border-white/10 rounded-full text-slate-300 text-xs">✨ {report.overallStyle}</span>
            <span className="px-3 py-1 bg-slate-700/80 border border-white/10 rounded-full text-slate-300 text-xs">🧴 {report.skinCondition}</span>
          </div>
        </div>
      </div>

      {/* 2-col grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionCard title="Best Foundation Shades" icon="🫧" accent="amber">
          <div className="flex flex-wrap gap-3">{report.foundation.map((s, i) => <SwatchCircle key={i} hex={s.hex} name={s.name} />)}</div>
        </SectionCard>

        <SectionCard title="Best Lip Colors" icon="💋" accent="rose">
          <div className="flex flex-wrap gap-3">{report.lipColors.map((s, i) => <SwatchCircle key={i} hex={s.hex} name={s.name} />)}</div>
        </SectionCard>

        <SectionCard title="Best Eyeshadows" icon="👁️" accent="purple">
          <div className="flex flex-wrap gap-3">{report.eyeshadow.map((s, i) => <SwatchCircle key={i} hex={s.hex} name={s.name} />)}</div>
        </SectionCard>

        <SectionCard title="Best Blush" icon="🌸" accent="rose">
          <div className="flex flex-wrap gap-3">{report.blush.map((s, i) => <SwatchCircle key={i} hex={s.hex} name={s.name} />)}</div>
        </SectionCard>

        <SectionCard title="Best Eyeliner" icon="✏️" accent="blue">
          <div className="flex flex-wrap gap-3">{report.eyeliner.map((s, i) => <SwatchCircle key={i} hex={s.hex} name={s.name} />)}</div>
        </SectionCard>

        <SectionCard title="Best Highlight" icon="✨" accent="amber">
          <div className="flex flex-wrap gap-3">{report.highlight.map((s, i) => <SwatchCircle key={i} hex={s.hex} name={s.name} />)}</div>
        </SectionCard>
      </div>

      {/* Avoid */}
      {report.avoid?.length > 0 && (
        <SectionCard title="Colours to Avoid" icon="⚠️" accent="red">
          <div className="flex flex-wrap gap-5">
            {report.avoid.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <SwatchCircle hex={s.hex} name={s.name} crossed />
                {s.reason && <span className="text-[9px] text-red-400/70 text-center max-w-[58px]">{s.reason}</span>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Tip */}
      {report.tip && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-600/5 border border-amber-500/20 p-5 flex items-start gap-4">
          <span className="text-2xl shrink-0 mt-0.5">💡</span>
          <div>
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">Beauty Tip</p>
            <p className="text-slate-200 text-sm leading-relaxed">{report.tip}</p>
          </div>
        </div>
      )}

      {/* Looks */}
      {report.looks && report.looks.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
          <h3 className="text-amber-400 font-semibold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>🌟</span> Best Makeup Looks for You
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {report.looks.map((look, i) => (
              <div key={i} className="bg-slate-700/40 rounded-xl p-4 border border-white/5 hover:border-amber-500/20 transition-colors">
                <p className="text-white font-semibold text-sm mb-1">{look.name}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{look.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Color Report Visual ──────────────────────────────────────────────────────
function ColorReportView({ report, preview }: { report: ColorReport; preview: string | null }) {
  const seasonGrad: Record<string, string> = {
    Spring: 'from-yellow-500/15 to-orange-300/5',
    Summer: 'from-pink-500/15 to-purple-400/5',
    Autumn: 'from-orange-600/15 to-red-500/5',
    Winter: 'from-blue-500/15 to-purple-500/5',
  };
  const key = Object.keys(seasonGrad).find(k => report.season.includes(k)) ?? 'Spring';

  return (
    <div className="space-y-4">
      {/* Hero: Portrait + Season */}
      <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${seasonGrad[key]} p-6 flex flex-col sm:flex-row gap-6 items-start`}>
        {preview && (
          <img src={preview} alt="Your portrait" className="w-28 h-28 rounded-2xl object-cover shadow-2xl shrink-0" />
        )}
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-1">Your Colour Season</p>
          <h2 className="font-serif text-3xl text-white mb-2">{report.season}</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">{report.seasonDescription}</p>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full shrink-0"
              style={{ backgroundColor: report.undertone.hex, boxShadow: `0 4px 12px ${report.undertone.hex}60` }}
            />
            <span className="text-slate-400 text-sm">
              Undertone: <span className="text-white font-medium">{report.undertone.type}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Best Colors */}
      <SectionCard title="Your Best Colours" icon="🎨" accent="purple">
        <div className="flex flex-wrap gap-3">
          {report.bestColors.map((c, i) => <SwatchCircle key={i} hex={c.hex} name={c.name} />)}
        </div>
      </SectionCard>

      {/* Neutrals + Metals */}
      <div className="grid sm:grid-cols-2 gap-4">
        <SectionCard title="Best Neutrals" icon="🤍" accent="blue">
          <div className="flex flex-wrap gap-3">
            {report.neutrals.map((c, i) => <SwatchCircle key={i} hex={c.hex} name={c.name} />)}
          </div>
        </SectionCard>

        <SectionCard title="Best Metals" icon="✨" accent="amber">
          <div className="flex flex-wrap gap-3">
            {report.metals.map((m, i) => (
              <SwatchCircle key={i} hex={METAL_HEX[m] ?? '#888888'} name={m} />
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Avoid */}
      {report.avoidColors?.length > 0 && (
        <SectionCard title="Colours to Avoid" icon="⚠️" accent="red">
          <div className="flex flex-wrap gap-4">
            {report.avoidColors.map((c, i) => <SwatchCircle key={i} hex={c.hex} name={c.name} crossed />)}
          </div>
        </SectionCard>
      )}

      {/* Tip */}
      {report.tip && (
        <div className="rounded-2xl bg-gradient-to-r from-purple-500/15 to-purple-600/5 border border-purple-500/20 p-5 flex items-start gap-4">
          <span className="text-2xl shrink-0 mt-0.5">💡</span>
          <div>
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-widest mb-1">Style Tip</p>
            <p className="text-slate-200 text-sm leading-relaxed">{report.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PDF Theme Data ───────────────────────────────────────────────────────────
const PDF_THEMES = {
  dark:  { bg: '#0f172a', card: '#1e293b', text: '#f1f5f9', muted: '#94a3b8', accent: '#f59e0b', border: 'rgba(255,255,255,0.1)'  },
  cream: { bg: '#faf7f2', card: '#ffffff', text: '#2d1b0e', muted: '#7a6552', accent: '#b8733a', border: 'rgba(0,0,0,0.08)'        },
  rose:  { bg: '#1a0a12', card: '#2d1520', text: '#fdf2f8', muted: '#d9a3c0', accent: '#f472b6', border: 'rgba(244,114,182,0.15)' },
} as const;

// ─── PDF Swatch (inline styles only) ─────────────────────────────────────────
function PdfSwatch({ hex, name, t }: { hex: string; name: string; t: typeof PDF_THEMES[PDFTheme] }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', minWidth:'52px' }}>
      <div style={{ width:'40px', height:'40px', borderRadius:'50%', backgroundColor: hex,
        boxShadow:`0 2px 10px ${hex}55`, border:`2px solid ${t.border}`, position:'relative' }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%',
          background:'linear-gradient(135deg,rgba(255,255,255,0.22),transparent)' }} />
      </div>
      <span style={{ fontSize:'8px', color: t.muted, textAlign:'center', maxWidth:'52px', lineHeight:'1.2' }}>{name}</span>
    </div>
  );
}

// ─── PDF Section (inline styles) ─────────────────────────────────────────────
function PdfSection({ title, icon, swatches, t }: {
  title: string; icon: string; swatches: ColorSwatch[];
  t: typeof PDF_THEMES[PDFTheme];
}) {
  return (
    <div style={{ backgroundColor: t.card, borderRadius:'10px', padding:'12px',
      border:`1px solid ${t.border}`, marginBottom:'8px' }}>
      <div style={{ fontSize:'9px', fontWeight:700, color: t.accent, textTransform:'uppercase',
        letterSpacing:'1px', marginBottom:'8px' }}>{icon} {title}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
        {swatches.map((s, i) => <PdfSwatch key={i} hex={s.hex} name={s.name} t={t} />)}
      </div>
    </div>
  );
}

// ─── PDF Hidden View ──────────────────────────────────────────────────────────
function PDFView({ report, mode, preview, theme }: {
  report: MakeupReport | ColorReport; mode: AnalysisMode;
  preview: string | null; theme: PDFTheme;
}) {
  const t = PDF_THEMES[theme];
  const isMakeup = mode === 'makeup';
  const mr = isMakeup ? (report as MakeupReport) : null;
  const cr = !isMakeup ? (report as ColorReport) : null;
  const undertone = (mr?.undertone ?? cr?.undertone)!;
  const dateStr = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  return (
    <div id={`zuri-pdf-${theme}`} style={{ backgroundColor: t.bg, width:'100%', padding:'32px 36px',
      fontFamily:"'Georgia', serif", color: t.text, boxSizing:'border-box' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:'18px', paddingBottom:'12px', borderBottom:`2px solid ${t.accent}50` }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {preview && (
            <img src={preview} style={{ width:'48px', height:'48px', borderRadius:'10px',
              objectFit:'cover', border:`2px solid ${t.accent}60` }} alt="portrait" />
          )}
          <div>
            <div style={{ fontSize:'20px', fontWeight:700, color: t.accent }}>Zuri</div>
            <div style={{ fontSize:'9px', color: t.muted, letterSpacing:'2px', textTransform:'uppercase' }}>
              AI Diagnostic Studio
            </div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'12px', fontWeight:600, color: t.text }}>
            {isMakeup ? '💄 Makeup & Undertone Report' : '🎨 Personal Color Report'}
          </div>
          <div style={{ fontSize:'9px', color: t.muted, marginTop:'3px' }}>{dateStr}</div>
        </div>
      </div>

      {/* Undertone / Season hero */}
      <div style={{ backgroundColor: t.card, borderRadius:'12px', padding:'14px',
        border:`1px solid ${t.border}`, marginBottom:'12px',
        display:'flex', alignItems:'center', gap:'14px' }}>
        <div style={{ width:'44px', height:'44px', borderRadius:'50%', flexShrink:0,
          backgroundColor: undertone.hex, boxShadow:`0 4px 12px ${undertone.hex}55` }} />
        <div>
          <div style={{ fontSize:'9px', color: t.accent, fontWeight:700, textTransform:'uppercase',
            letterSpacing:'1px', marginBottom:'4px' }}>
            {isMakeup ? 'Undertone' : `Season: ${cr?.season}`}
          </div>
          <div style={{ fontSize:'15px', fontWeight:700, color: t.text }}>{undertone.type}</div>
          <div style={{ fontSize:'10px', color: t.muted, marginTop:'2px' }}>{undertone.description}</div>
        </div>
      </div>

      {/* Makeup grid */}
      {mr && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <PdfSection title="Foundation Shades" icon="🫧" swatches={mr.foundation} t={t} />
            <PdfSection title="Lip Colors"        icon="💋" swatches={mr.lipColors}  t={t} />
            <PdfSection title="Eyeshadow"         icon="👁️" swatches={mr.eyeshadow}  t={t} />
            <PdfSection title="Blush"             icon="🌸" swatches={mr.blush}      t={t} />
            <PdfSection title="Eyeliner"          icon="✏️" swatches={mr.eyeliner}   t={t} />
            <PdfSection title="Highlight"         icon="✨" swatches={mr.highlight}  t={t} />
          </div>
          {mr.avoid?.length > 0 && (
            <div style={{ backgroundColor:'#ff000012', borderRadius:'10px', padding:'12px',
              border:'1px solid #ff000030', marginBottom:'8px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, color:'#ef4444', textTransform:'uppercase',
                letterSpacing:'1px', marginBottom:'8px' }}>⚠️ Avoid</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {mr.avoid.map((s, i) => <PdfSwatch key={i} hex={s.hex} name={s.name} t={t} />)}
              </div>
            </div>
          )}
          {mr.tip && (
            <div style={{ backgroundColor:`${t.accent}18`, borderRadius:'10px', padding:'12px',
              border:`1px solid ${t.accent}30`, marginBottom:'8px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, color: t.accent, textTransform:'uppercase',
                letterSpacing:'1px', marginBottom:'6px' }}>💡 Beauty Tip</div>
              <div style={{ fontSize:'10px', color: t.text, lineHeight:'1.6' }}>{mr.tip}</div>
            </div>
          )}
        </>
      )}

      {/* Color grid */}
      {cr && (
        <>
          <PdfSection title="Your Best Colours" icon="🎨" swatches={cr.bestColors} t={t} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <PdfSection title="Best Neutrals" icon="🤍" swatches={cr.neutrals} t={t} />
            <div style={{ backgroundColor: t.card, borderRadius:'10px', padding:'12px',
              border:`1px solid ${t.border}`, marginBottom:'8px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, color: t.accent, textTransform:'uppercase',
                letterSpacing:'1px', marginBottom:'8px' }}>✨ Best Metals</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {cr.metals.map((m, i) => (
                  <PdfSwatch key={i} hex={METAL_HEX[m] ?? '#888'} name={m} t={t} />
                ))}
              </div>
            </div>
          </div>
          {cr.avoidColors?.length > 0 && (
            <div style={{ backgroundColor:'#ff000012', borderRadius:'10px', padding:'12px',
              border:'1px solid #ff000030', marginBottom:'8px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, color:'#ef4444', textTransform:'uppercase',
                letterSpacing:'1px', marginBottom:'8px' }}>⚠️ Avoid</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {cr.avoidColors.map((c, i) => <PdfSwatch key={i} hex={c.hex} name={c.name} t={t} />)}
              </div>
            </div>
          )}
          {cr.tip && (
            <div style={{ backgroundColor:`${t.accent}18`, borderRadius:'10px', padding:'12px',
              border:`1px solid ${t.accent}30`, marginBottom:'8px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, color: t.accent, textTransform:'uppercase',
                letterSpacing:'1px', marginBottom:'6px' }}>💡 Style Tip</div>
              <div style={{ fontSize:'10px', color: t.text, lineHeight:'1.6' }}>{cr.tip}</div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop:'20px', paddingTop:'10px', borderTop:`1px solid ${t.border}`,
        display:'flex', justifyContent:'space-between', fontSize:'8px', color: t.muted }}>
        <span>Generated by Zuri AI Diagnostic Studio · Powered by Gemini</span>
        <span>zuri.in · Mumbai&apos;s Premium Salon Marketplace</span>
      </div>
    </div>
  );
}

// ─── PDF Export helper ────────────────────────────────────────────────────────
async function exportToPDF(elementId: string, filename: string) {
  const html2pdf = (await import('html2pdf.js')).default;
  const el = document.getElementById(elementId);
  if (!el) return;
  await html2pdf().set({
    margin: 0, filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }).from(el).save();
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function DiagnosticsContent() {
  const { user } = useAuth();
  const [studioState, setStudioState]   = useState<StudioState>('upload');
  const [dragOver, setDragOver]         = useState(false);
  const [preview, setPreview]           = useState<string | null>(null);
  const [fileData, setFileData]         = useState<{ base64: string; mimeType: string } | null>(null);
  const [report, setReport]             = useState<MakeupReport | ColorReport | null>(null);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('makeup');
  const [error, setError]               = useState<string | null>(null);
  const [exporting, setExporting]       = useState(false);
  const [pdfTheme, setPdfTheme]         = useState<PDFTheme>('dark');

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);                              // use data URL so PDF canvas works
      const base64 = dataUrl.split(',')[1];
      setFileData({ base64, mimeType: file.type });
      setStudioState('choose');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
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
      setReport(data.report);
      if (user) {
        await supabase.from('users')
          .update({ ai_diagnostic_results: { mode, report: data.report, generated_at: new Date().toISOString() } })
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
    const label = selectedMode === 'makeup' ? 'Makeup' : 'Color';
    await exportToPDF(`zuri-pdf-${pdfTheme}`, `Zuri_${label}_Report_${pdfTheme}.pdf`);
    setExporting(false);
  };

  const reset = () => {
    setStudioState('upload'); setPreview(null);
    setFileData(null); setReport(null); setError(null);
  };

  const stepIndex: Record<StudioState, number> = { upload:0, choose:1, analyzing:1, result:2 };

  return (
    <main className="min-h-screen bg-slate-900 text-white">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-b border-white/8">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
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
              const cur = stepIndex[studioState];
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < cur ? 'bg-green-500 text-white'
                    : i === cur ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/30'
                    : 'bg-slate-700 text-slate-500'}`}>
                    {i < cur ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm ${i === cur ? 'text-white font-medium' : 'text-slate-500'}`}>{label}</span>
                  {i < 2 && <ChevronRight size={13} className="text-slate-600 mx-1" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{error}</p>
              {error.includes('Rate limit') && (
                <p className="text-red-400/70 text-xs mt-1">The Gemini free tier allows limited requests per minute. Wait 30–60 seconds and try again.</p>
              )}
              {error.includes('overloaded') && (
                <p className="text-red-400/70 text-xs mt-1">Google's servers are temporarily busy. Try again shortly.</p>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 1: Upload ── */}
        {studioState === 'upload' && (
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`rounded-3xl border-2 border-dashed p-20 text-center transition-all cursor-pointer ${
              dragOver ? 'border-amber-500 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/40 hover:bg-amber-500/[0.02]'}`}>
            <div className="flex flex-col items-center gap-5">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${dragOver ? 'bg-amber-500/25' : 'bg-slate-800'}`}>
                <Camera size={36} className={dragOver ? 'text-amber-400' : 'text-slate-500'} />
              </div>
              <div>
                <p className="text-white text-xl font-semibold mb-1.5">Drop your portrait here</p>
                <p className="text-slate-400 text-sm">JPG · PNG · WEBP — clear front-facing photo works best</p>
              </div>
              <label className="flex items-center gap-2 px-7 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl cursor-pointer transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.35)] text-sm">
                <Upload size={15} />
                Choose Portrait
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </label>
              <p className="text-slate-600 text-xs">Your photo is only used for this analysis and is not stored.</p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Choose Mode ── */}
        {studioState === 'choose' && preview && (
          <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-800/60">
              <img src={preview} alt="Your portrait" className="w-full aspect-square object-cover" />
              <div className="p-4">
                <p className="text-white text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-400" /> Photo ready
                </p>
                <button onClick={reset} className="mt-2 text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors">
                  <RefreshCw size={11} /> Change photo
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="font-serif text-2xl text-white mb-1">Select Analysis Type</h2>
                <p className="text-slate-400 text-sm">Gemini AI will analyse your portrait and generate a personalised report.</p>
              </div>

              {/* Makeup button */}
              <button onClick={() => runAnalysis('makeup')}
                className="w-full text-left p-6 rounded-2xl border border-white/10 bg-slate-800/50 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 group-hover:bg-amber-500/25 transition-colors flex items-center justify-center text-3xl shrink-0">💄</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-bold text-lg">Makeup & Skin Undertone</h3>
                      <ChevronRight size={18} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">Skin undertone assessment, ideal makeup styles, shade comparisons, and product colour recommendations.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Undertone', 'Foundation', 'Lip Shades', 'Eyeshadow', 'Blush', 'Look Style'].map(t => (
                        <span key={t} className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>

              {/* Color button */}
              <button onClick={() => runAnalysis('color')}
                className="w-full text-left p-6 rounded-2xl border border-white/10 bg-slate-800/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 group-hover:bg-purple-500/25 transition-colors flex items-center justify-center text-3xl shrink-0">🎨</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-bold text-lg">Personal Color Analysis</h3>
                      <ChevronRight size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">Clothing palette comparisons, seasonal colour profile, best and worst wardrobe shades for your features.</p>
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

        {/* ── STEP 2.5: Analyzing ── */}
        {studioState === 'analyzing' && preview && (
          <div className="rounded-2xl p-16 text-center border border-white/10 bg-slate-800/40">
            <img src={preview} alt="Portrait"
              className="w-24 h-24 rounded-full mx-auto mb-8 object-cover ring-4 ring-amber-500/40" />
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <Loader2 size={64} className="text-amber-400/30 animate-spin absolute inset-0" />
                <Loader2 size={48} className="text-amber-400 animate-spin absolute inset-0 m-auto"
                  style={{ animationDirection:'reverse', animationDuration:'0.7s' }} />
                <Sparkles size={20} className="text-amber-300 absolute inset-0 m-auto" />
              </div>
            </div>
            <h2 className="text-white font-serif text-2xl mb-2">
              {selectedMode === 'makeup' ? 'Analysing skin & makeup…' : 'Mapping colour season…'}
            </h2>
            <p className="text-slate-400 text-sm">Gemini Vision is reading your portrait. This takes 5–20 seconds.</p>
          </div>
        )}

        {/* ── STEP 3: Result ── */}
        {studioState === 'result' && report && (
          <div className="space-y-5 animate-[fadeInUp_0.45s_ease_forwards]">

            {/* Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-green-400 text-sm font-medium">Analysis complete</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 text-sm">
                  {selectedMode === 'makeup' ? 'Makeup & Undertone Report' : 'Personal Color Report'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* PDF theme picker */}
                <div className="flex items-center gap-1 bg-slate-800 border border-white/10 rounded-xl p-1">
                  {(['dark', 'cream', 'rose'] as PDFTheme[]).map(th => (
                    <button key={th} onClick={() => setPdfTheme(th)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        pdfTheme === th ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                      {th === 'dark' ? '🌙 Dark' : th === 'cream' ? '☀️ Cream' : '🌸 Rose'}
                    </button>
                  ))}
                </div>
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

            {/* Visual report */}
            {selectedMode === 'makeup'
              ? <MakeupReportView report={report as MakeupReport} preview={preview} />
              : <ColorReportView  report={report as ColorReport}  preview={preview} />}

            {/* Hidden PDF renders (all 3 themes) */}
            <div className="sr-only" aria-hidden="true">
              {(['dark', 'cream', 'rose'] as PDFTheme[]).map(th => (
                <PDFView key={th} report={report} mode={selectedMode} preview={preview} theme={th} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
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
