'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, MessageCircle, Package, Map } from 'lucide-react';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Match', path: '/match' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Package, label: 'Gear', path: '/gear' },
    { icon: Map, label: 'Map', path: '/map' }
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  // Don't show on login/register pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                active
                  ? 'text-[#059467]'
                  : 'text-slate-500 hover:text-slate-700 active:scale-95'
              }`}
            >
              <div className={`relative ${active ? 'scale-110' : ''}`}>
                <item.icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#059467] rounded-full" />
                )}
              </div>
              <span className={`text-xs font-semibold ${active ? 'text-[#059467]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
