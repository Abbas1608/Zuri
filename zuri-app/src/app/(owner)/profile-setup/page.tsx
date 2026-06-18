'use client';

import { useState } from 'react';
import { Upload, Clock, Tag, ChevronRight, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

const STYLE_TAGS = ['Balayage', 'Bridal', 'Keratin', 'Nails', 'HD Makeup', 'Skin', 'Anti-Frizz', 'Waxing', 'Extensions'];
const STEPS = ['Basic Info', 'Hours & Tags', 'Services', 'Photos'];

interface Service {
  name: string;
  price: string;
  duration: string;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', address: '', contact: '', about: '' });
  const [hours, setHours] = useState({ mon_fri: '10:00–20:00', saturday: '10:00–20:00', sunday: '11:00–18:00' });
  const [services, setServices] = useState<Service[]>([
    { name: '', price: '', duration: '' }
  ]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const addService = () => setServices(prev => [...prev, { name: '', price: '', duration: '' }]);
  const removeService = (idx: number) => setServices(prev => prev.filter((_, i) => i !== idx));
  const updateService = (idx: number, field: keyof Service, value: string) => {
    setServices(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('salon-images')
        .upload(path, file);
      if (!uploadError && data) {
        const { data: urlData } = supabase.storage.from('salon-images').getPublicUrl(data.path);
        urls.push(urlData.publicUrl);
      }
    }
    setUploadedImages(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const handleGoLive = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    // Check if salon already exists for this owner
    const { data: existingSalon } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    const salonPayload = {
      owner_id: user.id,
      name: form.name,
      address: form.address,
      about: form.about,
      contact_info: { phone: form.contact },
      style_tags: selectedTags,
      operating_hours: hours,
      images: uploadedImages,
      rating: 0,
    };

    let salonId: string | null = existingSalon?.id ?? null;

    if (existingSalon) {
      // Update existing salon
      const { error: updateError } = await supabase
        .from('salons')
        .update(salonPayload)
        .eq('id', existingSalon.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      // Insert new salon
      const { data: newSalon, error: insertError } = await supabase
        .from('salons')
        .insert(salonPayload)
        .select('id')
        .single();
      if (insertError) { setError(insertError.message); setSaving(false); return; }
      salonId = newSalon.id;
    }

    // Insert services (delete old ones first if updating)
    if (salonId) {
      if (existingSalon) {
        await supabase.from('services').delete().eq('salon_id', salonId);
      }
      const validServices = services.filter(s => s.name && s.price);
      if (validServices.length > 0) {
        await supabase.from('services').insert(
          validServices.map(s => ({
            salon_id: salonId,
            name: s.name,
            price: parseFloat(s.price),
            duration: s.duration || '1h',
          }))
        );
      }
    }

    setSaving(false);
    router.push('/dashboard');
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-white">Salon Profile Setup</h1>
        <p className="text-slate-400 mt-1 text-sm">Complete your profile to go live on Zuri.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 flex-wrap">
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

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        {/* Step 0: Basic Info */}
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

        {/* Step 1: Hours & Tags */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white font-medium text-lg flex items-center gap-2 mb-4"><Clock size={16} className="text-amber-400" /> Operating Hours</h2>
              {(['mon_fri', 'saturday', 'sunday'] as const).map(day => (
                <div key={day} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <span className="text-slate-300 text-sm w-24 capitalize">{day.replace('_', '–')}</span>
                  <input
                    value={hours[day]}
                    onChange={e => setHours({ ...hours, [day]: e.target.value })}
                    placeholder="10:00–20:00"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/60 w-36"
                  />
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

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-white font-medium text-lg">Your Services</h2>
            {services.map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs uppercase tracking-wider">Service {idx + 1}</span>
                  {services.length > 1 && (
                    <button onClick={() => removeService(idx)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <input value={s.name} onChange={e => updateService(idx, 'name', e.target.value)}
                      placeholder="Service name (e.g. Balayage)"
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/60" />
                  </div>
                  <input value={s.price} onChange={e => updateService(idx, 'price', e.target.value)}
                    placeholder="Price (₹)" type="number"
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/60" />
                  <input value={s.duration} onChange={e => updateService(idx, 'duration', e.target.value)}
                    placeholder="Duration (e.g. 2h)"
                    className="col-span-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/60" />
                </div>
              </div>
            ))}
            <button onClick={addService}
              className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-amber-500/40 rounded-xl text-amber-400 text-sm hover:bg-amber-500/10 transition-all w-full justify-center">
              <Plus size={16} /> Add Service
            </button>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-white font-medium text-lg">Upload Salon Photos</h2>
            <label className="block border-2 border-dashed border-white/20 hover:border-amber-500/50 rounded-2xl p-12 text-center cursor-pointer transition-all group">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-500/20 transition-colors">
                {uploading ? <Loader2 size={22} className="text-amber-400 animate-spin" /> : <Upload size={22} className="text-amber-400" />}
              </div>
              <p className="text-white font-medium">{uploading ? 'Uploading…' : 'Drag & drop your salon photos'}</p>
              <p className="text-slate-400 text-sm mt-1">JPG, PNG — up to 20 images, 5MB each</p>
              <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files)} />
            </label>
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {uploadedImages.map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                <div className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-slate-500 text-xs">+ Add</div>
              </div>
            )}
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
          <button onClick={() => setStep(step + 1)}
            disabled={step === 0 && !form.name}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleGoLive}
            disabled={saving}
            className="flex-1 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Going Live…' : 'Go Live on Zuri 🚀'}
          </button>
        )}
      </div>
    </div>
  );
}
