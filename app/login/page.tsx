'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Mail, Eye, EyeOff, ArrowRight, Compass, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, status } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.push('/dashboard');
    }
  }, [status, user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      // Store token
      localStorage.setItem('token', response.token);
      
      // Update auth context
      login(response.token, response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] flex flex-col">
      <Header />

      {/* Main Wrapper */}
      <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden py-12">
        {/* Background Gradients & Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f5f8f7] to-[#f1f5f9] dark:from-[#0f231d] dark:to-[#05100d] z-0"></div>
        
        {/* Topographic Pattern */}
        <div 
          className="absolute inset-0 opacity-50 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        ></div>

        {/* Login Card */}
        <div className="relative w-full max-w-[480px] bg-white dark:bg-[#152e26] rounded-2xl shadow-2xl p-12 z-10 mx-4 border border-white/50 dark:border-white/5">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="size-12 bg-[#0f231d]/5 dark:bg-white/10 rounded-full flex items-center justify-center mb-5 text-[#0f231d] dark:text-white">
              <Compass className="w-7 h-7" />
            </div>
            <h1 className="text-[#0f231d] dark:text-white text-2xl font-bold leading-tight tracking-tight mb-2">
              Welcome Back, Explorer
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Log in to access your itineraries and gear.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" 
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="email"
                  name="email"
                  placeholder="nomad@example.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                className="text-[#0f231d] dark:text-gray-200 text-sm font-medium pl-1" 
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full h-12 px-4 pr-12 rounded-2xl bg-white dark:bg-[#0f231d] border border-slate-200 dark:border-[#2a453b] text-[#0f231d] dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#059467] focus:ring-4 focus:ring-[#059467]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="password"
                  name="password"
                  placeholder="•••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-slate-400 hover:text-[#059467] transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Utility Row: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  className="appearance-none w-5 h-5 rounded-md border-2 border-slate-200 dark:border-[#2a453b] checked:bg-[#059467] checked:border-[#059467] focus:ring-2 focus:ring-[#059467]/20 transition-all duration-200 cursor-pointer relative
                  checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-white checked:after:text-sm checked:after:font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-[#059467] transition-colors select-none">
                  Remember me
                </span>
              </label>
              <a 
                className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-[#059467] transition-colors" 
                href="#"
              >
                Forgot Password?
              </a>
            </div>

            {/* Primary CTA */}
            <button
              className="w-full h-12 mt-4 bg-[#059467] hover:bg-[#047a55] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#059467]/20 hover:shadow-[#059467]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login to NomadNotes</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-[#059467] font-bold hover:underline decoration-2 underline-offset-4"
                disabled={loading}
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
