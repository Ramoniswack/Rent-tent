'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import NotificationCenter from './NotificationCenter';
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
    <>
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
                  {/* Notification Center */}
                  <NotificationCenter />
                  
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
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-[#0f231d] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-[#059467] rounded-lg flex items-center justify-center text-white">
                <Plane className="w-5 h-5" />
              </div>
              <h2 className="text-slate-900 dark:text-white text-lg font-bold">Menu</h2>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
              {displayNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-[#059467] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="flex flex-col gap-2">
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'Profile'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    router.push('/account');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    router.push('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold text-[#059467] bg-[#059467]/10 hover:bg-[#059467]/20 transition-colors text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    router.push('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#059467] hover:bg-[#047854] transition-colors text-center shadow-lg shadow-[#059467]/20"
                >
                  Join Now
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Header;
