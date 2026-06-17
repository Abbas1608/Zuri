import Link from 'next/link';
import { LayoutDashboard, CalendarDays, Star, Settings } from 'lucide-react';

const navItems = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/owner/reviews', label: 'Reviews', icon: Star },
  { href: '/owner/profile-setup', label: 'Profile', icon: Settings },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 glass-panel border-r border-white/10 flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/" className="font-serif text-2xl text-white">Zuri</Link>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Owner Portal</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
              <item.icon size={17} className="group-hover:text-amber-400 transition-colors" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-6 pb-6">
          <div className="glass-panel rounded-xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-sm font-semibold">S</div>
            <div>
              <p className="text-white text-xs font-medium">Silk & Stone</p>
              <p className="text-slate-500 text-xs">Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
