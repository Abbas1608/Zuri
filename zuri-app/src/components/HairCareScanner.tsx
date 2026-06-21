'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  Droplets,
  Scan,
  FileDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Activity,
  Database,
  Search,
} from 'lucide-react';
import {
  getTDSProfile,
  getHairCareTip,
  getHairProfileGuide,
  type WaterType,
  type HairType,
  type Thickness,
  type Length,
  type TDSProfile,
  type HairCareTip,
  type HairProfileGuide,
} from '@/utils/hair-care-matrix';

// ── Types ──────────────────────────────────────────────────────
interface ScanResult {
  tds: TDSProfile;
  tip: HairCareTip;
  guide: HairProfileGuide;
  pincode: string;
  hairType: HairType;
  thickness: Thickness;
  length: Length;
}

// ── Subcomponents ──────────────────────────────────────────────

function ToggleSelector<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="relative flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={
              value === opt.value
                ? {
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.10))',
                    border: '1px solid rgba(212,175,55,0.6)',
                    color: '#F5E6C4',
                    boxShadow: '0 0 12px rgba(212,175,55,0.15)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                  }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Animated Semi-Circle Gauge for TDS
function TDSGauge({ tdsLevel, waterType }: { tdsLevel: number; waterType: WaterType }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const MAX_TDS = 500;
  const clampedTds = Math.min(tdsLevel, MAX_TDS);
  const fraction = clampedTds / MAX_TDS;
  
  // SVG Arc Math (Semi-circle from 180 deg to 0 deg)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half circle length
  const strokeDashoffset = circumference - fraction * circumference;

  const colors = {
    Soft: { color: '#22c55e', label: '#4ade80' },
    Moderate: { color: '#f59e0b', label: '#fbbf24' },
    Hard: { color: '#ef4444', label: '#f87171' },
  }[waterType];

  return (
    <div className="relative flex flex-col items-center pt-4 pb-2">
      <div className="relative w-48 h-24 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-xl">
          {/* Background Track */}
          <path
            d={`M ${100 - radius} 90 A ${radius} ${radius} 0 0 1 ${100 + radius} 90`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Animated Value Fill */}
          <motion.path
            d={`M ${100 - radius} 90 A ${radius} ${radius} 0 0 1 ${100 + radius} 90`}
            fill="none"
            stroke={colors.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={mounted ? { strokeDashoffset } : { strokeDashoffset: circumference }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 8px ${colors.color}80)` }}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <motion.span
            className="text-3xl font-bold font-serif leading-none"
            style={{ color: colors.label }}
            initial={{ opacity: 0, y: 10 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {tdsLevel}
          </motion.span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">ppm</span>
        </div>
      </div>
      <div className="flex justify-between w-48 px-2 mt-2 text-[9px] text-slate-500 font-medium tracking-wider">
        <span>0</span>
        <span>250</span>
        <span>500+</span>
      </div>
    </div>
  );
}

// Urgency badge
function UrgencyBadge({ urgency }: { urgency: 'low' | 'medium' | 'high' }) {
  const cfg = {
    low: { icon: <CheckCircle size={12} />, label: 'Low Risk', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
    medium: { icon: <Info size={12} />, label: 'Medium Risk', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
    high: { icon: <AlertTriangle size={12} />, label: 'High Risk', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  }[urgency];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── PDF Export ─────────────────────────────────────────────────
async function exportToPDF(result: ScanResult) {
  const html2pdf = (await import('html2pdf.js')).default;

  const waterColors: Record<WaterType, { bar: string; bg: string; text: string }> = {
    Soft: { bar: '#22c55e', bg: 'rgba(34,197,94,0.10)', text: '#4ade80' },
    Moderate: { bar: '#f59e0b', bg: 'rgba(245,158,11,0.10)', text: '#fbbf24' },
    Hard: { bar: '#ef4444', bg: 'rgba(239,68,68,0.10)', text: '#f87171' },
  };
  const wc = waterColors[result.tds.waterType];
  const pct = Math.min((result.tds.tdsLevel / 500) * 100, 100);

  const urgencyCfg = {
    low: { label: 'Low Risk', color: '#4ade80' },
    medium: { label: 'Medium Risk', color: '#fbbf24' },
    high: { label: 'High Risk', color: '#f87171' },
  }[result.tip.urgency];

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body {
    background: #0f172a;
    color: #f8fafc;
    font-family: 'Inter', sans-serif;
    width: 100%;
  }
  .pdf-page {
    background: #0f172a;
    width: 210mm;
    height: 296mm;
    padding: 40px;
    box-sizing: border-box;
    overflow: hidden;
  }
  .page-break { page-break-before: always; }
  .page-content { max-width: 720px; margin: 0 auto; }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(212,175,55,0.25);
  }
  .logo {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #d4af37, #F5E6C4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .report-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #94a3b8;
  }
  .report-date {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
  }

  /* Profile Grid */
  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  .profile-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 16px;
  }
  .profile-card .label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #64748b;
    margin-bottom: 6px;
  }
  .profile-card .value {
    font-size: 15px;
    font-weight: 600;
    color: #f1f5f9;
    text-transform: capitalize;
  }
  .profile-card .sub {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }

  /* TDS Section */
  .tds-section {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .tds-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .tds-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
  .tds-value { font-size: 36px; font-weight: 700; color: ${wc.text}; line-height: 1; }
  .tds-unit { font-size: 14px; color: #64748b; font-weight: 400; }
  .water-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    background: ${wc.bg};
    color: ${wc.text};
    border: 1px solid ${wc.bar}55;
    margin-top: 4px;
  }
  .meter-track {
    height: 10px;
    background: rgba(255,255,255,0.06);
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 8px;
  }
  .meter-fill {
    height: 100%;
    width: ${pct}%;
    background: linear-gradient(90deg, ${wc.bar}99, ${wc.bar});
    border-radius: 999px;
  }
  .meter-labels {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #475569;
  }
  .zone-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    font-size: 13px;
    color: #94a3b8;
  }

  /* Tip Section */
  .tip-section {
    background: linear-gradient(135deg, rgba(212,175,55,0.06), rgba(0,48,73,0.25));
    border: 1px solid rgba(212,175,55,0.2);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .tip-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .tip-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(212,175,55,0.8);
  }
  .risk-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    color: ${urgencyCfg.color};
    background: ${urgencyCfg.color}18;
    border: 1px solid ${urgencyCfg.color}44;
  }
  .tip-headline {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 12px;
    line-height: 1.3;
  }
  .tip-detail {
    font-size: 13px;
    line-height: 1.75;
    color: #cbd5e1;
  }

  /* Treatment CTA */
  .treatment-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .treatment-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .treatment-name { font-size: 15px; font-weight: 600; color: #F5E6C4; }

  /* Guide Section */
  .guide-box {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .guide-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #F5E6C4;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(212,175,55,0.2);
    padding-bottom: 8px;
  }
  .guide-block { margin-bottom: 16px; }
  .guide-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
  .guide-text { font-size: 13px; line-height: 1.6; color: #e2e8f0; }

  /* Footer */
  .footer {
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-brand {
    font-family: 'Playfair Display', serif;
    font-size: 14px;
    color: rgba(212,175,55,0.6);
  }
  .footer-note { font-size: 10px; color: #475569; }
  .disclaimer {
    margin-top: 12px;
    font-size: 10px;
    color: #475569;
    line-height: 1.6;
    padding: 10px 14px;
    border-radius: 8px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.04);
  }
</style>
</head>
<body>
<!-- PAGE 1 -->
<div class="pdf-page">
  <div class="page-content">
    <div class="header">
      <div>
        <div class="logo">Zuri</div>
        <div class="report-label">Hair Care Diagnostic Report</div>
      </div>
      <div style="text-align:right">
        <div class="report-label">Mumbai Water + Hair Analysis</div>
        <div class="report-date">Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>

    <div class="profile-grid">
      <div class="profile-card">
        <div class="label">Pincode</div>
        <div class="value">${result.pincode}</div>
        <div class="sub">${result.tds.zone}</div>
      </div>
      <div class="profile-card">
        <div class="label">Water Type</div>
        <div class="value" style="color:${wc.text}">${result.tds.waterType} Water</div>
        <div class="sub">${result.tds.riskLabel}</div>
      </div>
      <div class="profile-card">
        <div class="label">Hair Type</div>
        <div class="value">${result.hairType}</div>
        <div class="sub">${result.thickness} · ${result.length}</div>
      </div>
      <div class="profile-card">
        <div class="label">Urgency</div>
        <div class="value" style="color:${urgencyCfg.color}">${urgencyCfg.label}</div>
        <div class="sub">Action recommended</div>
      </div>
    </div>

    <div class="tds-section">
      <div class="tds-header">
        <div>
          <div class="tds-title">Water TDS Level</div>
          <div style="margin-top:8px">
            <span class="tds-value">${result.tds.tdsLevel}</span>
            <span class="tds-unit"> ppm</span>
          </div>
          <span class="water-badge">${result.tds.waterType} Water</span>
        </div>
      </div>
      <div class="meter-track"><div class="meter-fill"></div></div>
      <div class="meter-labels">
        <span>0 — Pure</span><span>100 — Soft</span><span>250 — Moderate</span><span>500 — Hard</span>
      </div>
      <div class="zone-row">📍 Zone: ${result.tds.zone} &nbsp;·&nbsp; ${result.tds.riskLabel}</div>
    </div>

    <div class="tip-section">
      <div class="tip-header">
        <span class="tip-label">✦ Zuri Hair Care Tip</span>
        <span class="risk-badge">${urgencyCfg.label}</span>
      </div>
      <div class="tip-headline">${result.tip.headline}</div>
      <div class="tip-detail">${result.tip.detail}</div>
    </div>

    <div class="treatment-box">
      <div>
        <div class="treatment-label">Recommended Treatment</div>
        <div class="treatment-name">✦ ${result.tip.treatmentTag}</div>
      </div>
      <div style="font-size:11px;color:#94a3b8;text-align:right">
        Book via Zuri<br/>
        <span style="color:rgba(212,175,55,0.7)">zuri-app.vercel.app/discover</span>
      </div>
    </div>
  </div>
</div>

<!-- PAGE 2: DETAILED GUIDE -->
<div class="pdf-page page-break">
  <div class="page-content">
    <div class="header">
      <div>
        <div class="logo">Zuri</div>
        <div class="report-label">Comprehensive Profile Guide</div>
      </div>
    </div>

    <div class="guide-box">
      <div class="guide-title">${result.guide.combo} Masterclass</div>
      
      <div class="guide-block">
        <div class="guide-label">Why It Happens</div>
        <div class="guide-text">${result.guide.whyItHappens}</div>
      </div>
      
      <div class="guide-block">
        <div class="guide-label">The Solution</div>
        <div class="guide-text">${result.guide.solution}</div>
      </div>
      
      <div class="guide-block">
        <div class="guide-label">Hair Care Routine</div>
        <div class="guide-text">${result.guide.routine}</div>
      </div>
      
      <div class="guide-block">
        <div class="guide-label">Product & Cream Use</div>
        <div class="guide-text">${result.guide.products}</div>
      </div>
      
      <div class="guide-block">
        <div class="guide-label">Stop Doing This</div>
        <div class="guide-text" style="color: #fca5a5;">${result.guide.wasteTip}</div>
      </div>
      
      <div class="guide-block">
        <div class="guide-label">Hair Management Tip</div>
        <div class="guide-text">${result.guide.managementTip}</div>
      </div>
      
      <div class="guide-block">
        <div class="guide-label">Diet & Food Tips</div>
        <div class="guide-text">${result.guide.diet}</div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">Zuri · Mumbai Beauty Marketplace</div>
      <div class="footer-note">Hair Care Scanner v1.0</div>
    </div>
    <div class="disclaimer">
      ⚠️ Disclaimer: TDS values are based on publicly available municipal water quality data for Mumbai zones and are indicative only. Hair care advice is algorithmically generated using a rule-based matrix and should not replace consultation with a professional trichologist or cosmetologist.
    </div>
  </div>
</div>
</body>
</html>`;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  await html2pdf()
    .set({
      margin: 0,
      filename: `Zuri_HairCare_Report_${result.pincode}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: '#0f172a', useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(container)
    .save();

  document.body.removeChild(container);
}

// ── Main Scanner Component ────────────────────────────────────
export default function HairCareScanner() {
  const [pincode, setPincode] = useState('');
  const [hairType, setHairType] = useState<HairType>('wavy');
  const [thickness, setThickness] = useState<Thickness>('thick');
  const [length, setLength] = useState<Length>('long');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  
  // 0: idle, 1: connecting, 2: analyzing water, 3: generating tip
  const [scanState, setScanState] = useState(0);
  const [exporting, setExporting] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const scanStatusMessages = [
    "",
    "Connecting to Municipal Water Database...",
    "Analyzing Zone TDS Hardness...",
    "Compiling Custom Hair Care Matrix...",
  ];

  function handleScan() {
    setError('');
    
    const tds = getTDSProfile(pincode);
    if (!tds) {
      setError(
        pincode.length !== 6
          ? 'Please enter a valid 6-digit pincode.'
          : !pincode.startsWith('400')
          ? 'Only Mumbai pincodes (starting with 400) are currently supported.'
          : 'Pincode not found. Try a standard Mumbai 400xxx pincode.'
      );
      return;
    }

    setResult(null);
    setScanState(1);

    // Staggered delays for cool animation effect
    setTimeout(() => setScanState(2), 800);
    setTimeout(() => setScanState(3), 1600);
    setTimeout(() => {
      const tip = getHairCareTip(tds.waterType, hairType, thickness, length);
      const guide = getHairProfileGuide(hairType, thickness, length);
      setResult({ tds, tip, guide, pincode, hairType, thickness, length });
      setScanState(0);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 2500);
  }

  async function handleExport() {
    if (!result) return;
    setExporting(true);
    try {
      await exportToPDF(result);
    } finally {
      setExporting(false);
    }
  }

  const waterBorderColor: Record<WaterType, string> = {
    Soft: 'rgba(34,197,94,0.35)',
    Moderate: 'rgba(245,158,11,0.35)',
    Hard: 'rgba(239,68,68,0.35)',
  };

  const isScanning = scanState > 0;

  // Variants for staggered children animation in the guide
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <section>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,48,73,0.35) 0%, rgba(15,23,42,0.7) 100%)',
          border: '1px solid rgba(212,175,55,0.22)',
          boxShadow: '0 0 48px rgba(0,48,73,0.25), inset 0 1px 0 rgba(212,175,55,0.1)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* ── Card Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.1))', border: '1px solid rgba(212,175,55,0.4)' }}
            >
              <Droplets size={16} style={{ color: '#F5E6C4' }} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-widest block">Zuri Diagnostic</span>
              <h2 className="font-serif text-lg text-white leading-none">Hair Care Scanner</h2>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Enter your Mumbai pincode — we instantly calculate your local water TDS and generate a hyper-personalised hair care prescription. Zero AI tokens. 0ms latency.
          </p>
        </div>

        {/* ── Input Form ── */}
        <div className="px-6 py-5 space-y-5">
          {/* Pincode */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
              Your Mumbai Pincode
            </label>
            <div className="relative">
              <input
                id="hair-scanner-pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 400050"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'Inter, sans-serif',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
              {pincode.length === 6 && !error && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400" />
              )}
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs mt-1.5 flex items-center gap-1"
                >
                  <AlertTriangle size={11} /> {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Hair Type dropdown */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Hair Type</label>
            <div className="relative">
              <select
                id="hair-scanner-type"
                value={hairType}
                onChange={(e) => { setHairType(e.target.value as HairType); setResult(null); }}
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none appearance-none cursor-pointer transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <option value="straight" style={{ background: '#1e293b' }}>🔸 Straight</option>
                <option value="wavy" style={{ background: '#1e293b' }}>〰️ Wavy</option>
                <option value="curly" style={{ background: '#1e293b' }}>🌀 Curly</option>
              </select>
              <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Thickness toggle */}
          <ToggleSelector<Thickness>
            label="Hair Thickness"
            value={thickness}
            onChange={(v) => { setThickness(v); setResult(null); }}
            options={[
              { value: 'fine', label: 'Fine' },
              { value: 'thick', label: 'Thick' },
            ]}
          />

          {/* Length toggle */}
          <ToggleSelector<Length>
            label="Hair Length"
            value={length}
            onChange={(v) => { setLength(v); setResult(null); }}
            options={[
              { value: 'short', label: 'Short' },
              { value: 'long', label: 'Long' },
            ]}
          />

          {/* Scan button & Animation Status */}
          <div className="relative mt-2">
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div
                  key="scanning-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full py-4 rounded-xl flex flex-col items-center justify-center gap-2"
                  style={{
                    background: 'rgba(212,175,55,0.05)',
                    border: '1px solid rgba(212,175,55,0.2)',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="text-amber-400"
                  >
                    {scanState === 1 && <Database size={20} />}
                    {scanState === 2 && <Activity size={20} />}
                    {scanState === 3 && <Search size={20} />}
                  </motion.div>
                  <motion.p
                    key={scanState}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-semibold text-amber-300/80 uppercase tracking-widest"
                  >
                    {scanStatusMessages[scanState]}
                  </motion.p>
                  
                  {/* Progress bar */}
                  <div className="w-48 h-1 bg-black/30 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-200"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(scanState / 3) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="scan-button"
                  id="hair-scanner-btn"
                  onClick={handleScan}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                    color: '#0f172a',
                    boxShadow: '0 0 24px rgba(212,175,55,0.35)',
                  }}
                >
                  <Scan size={16} />
                  Scan Water &amp; Hair Profile
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Result Panel ── */}
        <AnimatePresence>
          {result && !isScanning && (
            <motion.div
              ref={resultRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.34, 1, 0.64, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="mx-4 mb-4 rounded-xl overflow-hidden"
                style={{
                  border: `1px solid ${waterBorderColor[result.tds.waterType]}`,
                  background: 'rgba(15,23,42,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Zone pill */}
                <div className="px-5 pt-4 pb-3 border-b border-white/[0.05]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">📍</span>
                      <span className="text-sm text-slate-300 font-medium">{result.tds.zone}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                          background: result.tds.waterType === 'Soft' ? 'rgba(34,197,94,0.12)' : result.tds.waterType === 'Moderate' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                          color: result.tds.waterType === 'Soft' ? '#4ade80' : result.tds.waterType === 'Moderate' ? '#fbbf24' : '#f87171',
                          border: `1px solid ${result.tds.waterType === 'Soft' ? 'rgba(34,197,94,0.3)' : result.tds.waterType === 'Moderate' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}
                      >
                        {result.tds.waterType} Water
                      </span>
                    </div>
                    <UrgencyBadge urgency={result.tip.urgency} />
                  </div>
                </div>

                {/* Animated TDS Gauge */}
                <div className="px-5 py-6 border-b border-white/[0.05] flex flex-col items-center">
                  <span className="text-[11px] text-slate-400 uppercase tracking-widest mb-1">Local Water Hardness</span>
                  <TDSGauge tdsLevel={result.tds.tdsLevel} waterType={result.tds.waterType} />
                </div>

                {/* Hair Care Tip */}
                <div className="px-5 py-5 border-b border-white/[0.05]">
                  <p className="text-[10px] text-amber-400/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Sparkle /> Water-Specific Tip
                  </p>
                  <motion.h3
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-serif text-base text-white mb-2 leading-snug"
                  >
                    {result.tip.headline}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-300 text-[13px] leading-relaxed"
                  >
                    {result.tip.detail}
                  </motion.p>
                </div>

                {/* Detailed Guide Section */}
                <div className="px-5 py-5 border-b border-white/[0.05] bg-white/[0.015]">
                  <p className="text-[10px] text-amber-400/70 uppercase tracking-widest mb-5 flex items-center gap-1.5">
                    <Sparkle /> Full Profile Guide: {result.guide.combo}
                  </p>
                  
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-5"
                  >
                    <motion.div variants={itemVariants}>
                      <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Why It Happens</h4>
                      <p className="text-slate-300 text-[13px] leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">{result.guide.whyItHappens}</p>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">The Solution</h4>
                      <p className="text-slate-300 text-[13px] leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">{result.guide.solution}</p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <motion.div variants={itemVariants}>
                          <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Routine</h4>
                          <p className="text-slate-300 text-[13px] leading-relaxed">{result.guide.routine}</p>
                       </motion.div>
                       <motion.div variants={itemVariants}>
                          <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Products</h4>
                          <p className="text-slate-300 text-[13px] leading-relaxed">{result.guide.products}</p>
                       </motion.div>
                    </div>
                    
                    <motion.div variants={itemVariants}>
                      <h4 className="text-[11px] text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><AlertTriangle size={12}/> Stop Doing This</h4>
                      <p className="text-red-200 text-[13px] leading-relaxed bg-red-950/20 p-3 rounded-lg border border-red-900/30">{result.guide.wasteTip}</p>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Management Tip</h4>
                      <p className="text-slate-300 text-[13px] leading-relaxed">{result.guide.managementTip}</p>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Diet Focus</h4>
                      <p className="text-slate-300 text-[13px] leading-relaxed">{result.guide.diet}</p>
                    </motion.div>
                  </motion.div>
                </div>

                {/* CTA row */}
                <div className="px-5 py-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/discover?treatment=${encodeURIComponent(result.tip.treatmentTag)}`}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                      color: '#0f172a',
                      boxShadow: '0 0 18px rgba(212,175,55,0.3)',
                    }}
                  >
                    Book Treatment →
                  </Link>
                  <motion.button
                    onClick={handleExport}
                    disabled={exporting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: exporting ? '#64748b' : '#F5E6C4',
                      cursor: exporting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <FileDown size={15} />
                    {exporting ? 'Exporting…' : 'Export PDF'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// tiny inline icon to avoid import overhead
function Sparkle() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}
