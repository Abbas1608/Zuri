'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Star, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/reviews', label: 'Reviews', icon: Star },
  { href: '/profile-setup', label: 'Profile', icon: Settings },
];

function OwnerLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const userName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Owner';
  const userInitial = userName[0]?.toUpperCase() ?? 'O';

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 glass-panel border-r border-white/10 flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/" className="font-serif text-2xl text-white">Zuri</Link>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Owner Portal</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-amber-500/20 text-white border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <item.icon size={17} className={isActive ? 'text-amber-400' : 'group-hover:text-amber-400 transition-colors'} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-6 pb-6">
          <div className="glass-panel rounded-xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-sm font-semibold shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{userName}</p>
              <p className="text-slate-500 text-xs">Owner</p>
            </div>
            <button onClick={signOut} className="text-slate-500 hover:text-white transition-colors shrink-0" title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <OwnerLayoutContent>{children}</OwnerLayoutContent>
    </ProtectedRoute>
  );
}
