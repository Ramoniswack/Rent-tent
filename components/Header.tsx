'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import {
  Home,
  Compass,
  Mail,
  Backpack,
  Map as MapIcon,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Plane,
  Moon,
  Sun
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  private: boolean;
}

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const navItems: NavItem[] = [
    { icon: <Home className="w-4 h-4" />, label: 'Home', path: '/', private: false },
    { icon: <Backpack className="w-4 h-4" />, label: 'Gear Rental', path: '/gear', private: false },
  ];

  const privateNavItems: NavItem[] = [
    { icon: <Home className="w-4 h-4" />, label: 'Dashboard', path: '/dashboard', private: true },
    { icon: <Compass className="w-4 h-4" />, label: 'Match', path: '/match', private: true },
    { icon: <Mail className="w-4 h-4" />, label: 'Messages', path: '/messages', private: true },
    { icon: <Backpack className="w-4 h-4" />, label: 'Gear Rental', path: '/gear', private: false },
    { icon: <MapIcon className="w-4 h-4" />, label: 'Map', path: '/map', private: true },
  ];

  // Add admin link if user is admin
  const adminNavItems = user?.isAdmin 
    ? [{ icon: <Shield className="w-4 h-4" />, label: 'Admin', path: '/admin', private: true }]
    : [];

  // Show different nav items based on authentication
  const displayNavItems = user 
    ? [...privateNavItems, ...adminNavItems]
    : navItems;

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f231d]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => router.push(user ? '/dashboard' : '/')}
            className="flex items-center gap-3 group"
          >
            <div className="size-8 bg-[#059467] rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Plane className="w-5 h-5" />
            </div>
            <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
              NomadNotes
            </h1>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {displayNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-[#059467] text-white shadow-md shadow-[#059467]/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <>
                {/* User Menu - Desktop */}
                {/* <div className="hidden lg:flex items-center gap-3">
                  <button
                    onClick={() => router.push('/account')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Account</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div> */}

                {/* Profile Picture */}
                <button
                  onClick={() => router.push('/account')}
                  className="relative size-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-[#059467] transition-colors overflow-hidden group"
                  title={user.name || user.email}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#059467]/0 group-hover:bg-[#059467]/10 transition-colors"></div>
                </button>
              </>
            ) : (
              <>
                {/* Auth Buttons - Desktop */}
                <div className="hidden lg:flex items-center gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="px-5 py-2 rounded-full text-sm font-bold text-[#059467] bg-[#059467]/10 hover:bg-[#059467]/20 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="px-5 py-2 rounded-full text-sm font-bold text-white bg-[#059467] hover:bg-[#047854] shadow-lg shadow-[#059467]/20 transition-all"
                  >
                    Join Now
                  </button>
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <nav className="flex flex-col gap-2">
              {displayNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-[#059467] text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Mobile Auth/User Actions */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        router.push('/account');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Account</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        router.push('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-xl text-sm font-bold text-[#059467] bg-[#059467]/10 hover:bg-[#059467]/20 transition-colors text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        router.push('/register');
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#059467] hover:bg-[#047854] transition-colors text-center"
                    >
                      Join Now
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
