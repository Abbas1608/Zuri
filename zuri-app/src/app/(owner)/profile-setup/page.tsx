'use client';

import { useState } from 'react';
import { Upload, Clock, Tag, ChevronRight, CheckCircle } from 'lucide-react';

const STYLE_TAGS = ['Balayage', 'Bridal', 'Keratin', 'Nails', 'HD Makeup', 'Skin', 'Anti-Frizz', 'Waxing', 'Extensions'];
const STEPS = ['Basic Info', 'Hours & Tags', 'Photos'];

export default function ProfileSetupPage() {
  const [step, setStep] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', address: '', contact: '', about: '' });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-white">Salon Profile Setup</h1>
        <p className="text-slate-400 mt-1 text-sm">Complete your profile to go live on Zuri.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'text-white' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-8 h-px mx-1 ${i < step ? 'bg-green-500' : 'bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-white font-medium text-lg">Basic Information</h2>
            {[
              { label: 'Salon Name', key: 'name', placeholder: 'e.g. Silk & Stone Studio' },
              { label: 'Address', key: 'address', placeholder: 'e.g. 12, Linking Road, Bandra West, Mumbai' },
              { label: 'Contact / WhatsApp', key: 'contact', placeholder: '+91 98XXX XXXXX' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm text-slate-400 mb-1.5">{field.label}</label>
                <input
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">About Your Salon</label>
              <textarea
                value={form.about}
                onChange={e => setForm({ ...form, about: e.target.value })}
                placeholder="Describe your salon's speciality and vibe..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white font-medium text-lg flex items-center gap-2 mb-4"><Clock size={16} className="text-amber-400" /> Operating Hours</h2>
              {['Mon–Fri', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <span className="text-slate-300 text-sm w-24">{day}</span>
                  <div className="flex gap-2 items-center">
                    <input type="time" defaultValue="10:00" className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/60" />
                    <span className="text-slate-500 text-xs">to</span>
                    <input type="time" defaultValue="20:00" className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/60" />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-white font-medium flex items-center gap-2 mb-3"><Tag size={15} className="text-amber-400" /> Style Tags</h3>
              <div className="flex flex-wrap gap-2">
                {STYLE_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${selectedTags.includes(tag) ? 'bg-amber-500 text-slate-900 border-amber-500 font-medium' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-white font-medium text-lg">Upload Salon Photos</h2>
            <label className="block border-2 border-dashed border-white/20 hover:border-amber-500/50 rounded-2xl p-12 text-center cursor-pointer transition-all group">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-500/20 transition-colors">
                <Upload size={22} className="text-amber-400" />
              </div>
              <p className="text-white font-medium">Drag & drop your salon photos</p>
              <p className="text-slate-400 text-sm mt-1">JPG, PNG — up to 20 images, 5MB each</p>
              <input type="file" multiple accept="image/*" className="hidden" />
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=150',
                'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=150'].map((src, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-slate-500 text-xs">+ Add</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 py-3 border border-white/20 text-slate-300 rounded-xl hover:border-white/40 transition-colors">
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition-all">
            Go Live on Zuri 🚀
          </button>
        )}
      </div>
    </div>
  );
}
