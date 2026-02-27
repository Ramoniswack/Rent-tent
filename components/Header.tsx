'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
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
  Sun,
  Inbox,
  Settings,
  ChevronDown
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
  const { showConfirm, showToast } = useToast();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [logoText, setLogoText] = useState('NomadNotes');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch logo text from settings
  useEffect(() => {
    const fetchLogoText = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/site-settings/logoText`);
        if (response.ok) {
          const data = await response.json();
          if (data.value) setLogoText(data.value);
        }
      } catch (error) {
        console.error('Error fetching logo text:', error);
      }
    };
    fetchLogoText();
  }, []);

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

  // Handle click outside for desktop profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    { icon: <Home className="w-[18px] h-[18px]" />, label: 'Home', path: '/', private: false },
    { icon: <Backpack className="w-[18px] h-[18px]" />, label: 'Gear Rental', path: '/gear', private: false },
  ];

  const privateNavItems: NavItem[] = [
    { icon: <Home className="w-[18px] h-[18px]" />, label: 'Dashboard', path: '/dashboard', private: true },
    { icon: <Compass className="w-[18px] h-[18px]" />, label: 'Match', path: '/match', private: true },
    { icon: <Mail className="w-[18px] h-[18px]" />, label: 'Messages', path: '/messages', private: true },
    { icon: <Backpack className="w-[18px] h-[18px]" />, label: 'Gear Rental', path: '/gear', private: false },
    { icon: <MapIcon className="w-[18px] h-[18px]" />, label: 'Map', path: '/map', private: true },

  ];

  const adminNavItems = user?.isAdmin 
    ? []
    : [];

  const displayNavItems = user ? [...privateNavItems, ...adminNavItems] : navItems;

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    showConfirm({
      title: 'Logout Confirmation',
      message: 'Are you sure you want to logout? You will need to sign in again to access your account.',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: () => {
        logout();
        showToast('Successfully logged out', 'success');
        router.push('/login');
        setMobileMenuOpen(false);
      },
      onCancel: () => {}
    });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-[#0f231d] backdrop-blur-xl border-b border-slate-200/50 dark:border-srder-slate-800/50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            
            {/* Mobile Menu Button & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <button
                onClick={() => router.push(user ? '/dashboard' : '/')}
                className="flex items-center gap-2.5 group"
              >
                <div className="size-8 bg-gradient-to-br from-[#059467] to-[#047854] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#059467]/20 group-hover:scale-105 transition-all duration-300">
                  <Plane className="w-5 h-5 -rotate-12" />
                </div>
                <h1 className="text-slate-900 dark:text-white text-xl font-black tracking-tight">
                  {logoText}
                </h1>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {displayNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-[#059467]/10 dark:bg-emerald-500/10 text-[#059467] dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <NotificationCenter />
                  
                  {/* Desktop Profile Dropdown */}
                  <div className="hidden lg:block relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all focus:outline-none"
                    >
                      <div className="relative size-8 rounded-full overflow-hidden bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center shadow-sm">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name || 'User'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                 
                          <button onClick={() => handleNavigation('/rentals/dashboard')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <Inbox className="w-4 h-4 text-slate-400" /> My Rentals
                          </button>
                      
                          <button onClick={() => handleNavigation(`/seller/${user.username}`)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <Backpack className="w-4 h-4 text-slate-400" /> Gears Dashboard
                          </button>
                                   <button onClick={() => handleNavigation('/account')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                          </button>
                          <button onClick={toggleTheme} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-2.5">
                              {isDarkMode ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-slate-400" />}
                              <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                            </div>
                            <div className={`w-8 h-4 rounded-full transition-colors relative ${isDarkMode ? 'bg-[#059467]' : 'bg-slate-200 dark:bg-slate-600'}`}>
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isDarkMode ? 'left-[18px]' : 'left-0.5'}`} />
                            </div>
                          </button>
                            {user.isAdmin && (
                            <button onClick={() => handleNavigation('/admin')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                              <Shield className="w-4 h-4 text-slate-400" /> Admin
                            </button>
                          )}
                          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button onClick={toggleTheme} className="hidden lg:block p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </button>
                  <div className="hidden lg:flex items-center gap-2.5">
                    <button onClick={() => router.push('/login')} className="px-5 py-2 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      Log In
                    </button>
                    <button onClick={() => router.push('/register')} className="px-5 py-2 rounded-full text-sm font-bold text-white bg-[#059467] hover:bg-[#047854] shadow-md shadow-[#059467]/20 transition-all hover:-translate-y-0.5">
                      Join Now
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 h-[100dvh] w-[280px] sm:w-[320px] bg-white dark:bg-slate-900 shadow-2xl z-[70] transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:hidden flex flex-col ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header / Close */}
        <div className="flex items-center justify-between p-4 sm:p-5">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <div className="size-8 bg-[#059467] rounded-lg flex items-center justify-center text-white">
              <Plane className="w-5 h-5 -rotate-12" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{logoText}</span>
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Area (Top instead of Bottom) */}
        {user && (
          <div className="px-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#059467] to-[#047854] flex items-center justify-center shadow-sm border-2 border-white dark:border-slate-700">
                  <span className="text-white font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="flex flex-col gap-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Menu</p>
            {displayNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.path)
                    ? 'bg-[#059467]/10 text-[#059467] dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`${isActive(item.path) ? 'text-[#059467] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer (Settings & Auth) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
          {user ? (
            <div className="flex flex-col gap-1">
              <button onClick={() => handleNavigation('/account')} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </button>
              <button onClick={() => handleNavigation('/rentals/dashboard')} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Inbox className="w-4 h-4 text-slate-400" />
                <span>My Rentals</span>
              </button>
              {user.isAdmin && (
                <button onClick={() => handleNavigation('/admin')} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Admin</span>
                </button>
              )}
              <button onClick={() => handleNavigation(`/seller/${user.username}`)} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Backpack className="w-4 h-4 text-slate-400" />
                <span>Gears Dashboard</span>
              </button>
              <button onClick={toggleTheme} className="flex items-center justify-between w-full px-3 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-slate-400" />}
                  <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>Toggle Theme</span>
              </button>
              <button onClick={() => handleNavigation('/login')} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-[#059467] bg-[#059467]/10 active:bg-[#059467]/20 transition-colors text-center">
                Log In
              </button>
              <button onClick={() => handleNavigation('/register')} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#059467] active:bg-[#047854] transition-colors text-center shadow-md shadow-[#059467]/20">
                Join {logoText}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Header;