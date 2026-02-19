'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { User, Mail, Lock, RotateCcw, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login, user, status } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.push('/dashboard');
    }
  }, [status, user, router]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Store token
      localStorage.setItem('token', response.token);
      
      // Update auth context
      login(response.token, response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
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

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const getStrengthLabel = () => {
    const labels = ['Weak', 'Fair', 'Medium', 'Strong'];
    return labels[passwordStrength - 1] || 'Weak';
  };

  const getStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-[#059467]', 'bg-green-600'];
    return colors[passwordStrength - 1] || 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] flex flex-col">
      <Header />

      {/* Main Wrapper */}
      <div className="relative flex-grow w-full flex items-center justify-center p-4 overflow-hidden py-12">
        {/* Background with Topographic Pattern */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(at 0% 0%, hsla(164,33%,96%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(164,33%,96%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(164,33%,96%,1) 0, transparent 50%)',
          }}
        >
          <div 
            className="absolute inset-0 opacity-100"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059467' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}
          ></div>
        </div>

        {/* Decorative Background Blobs */}
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#059467]/5 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>
        <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>

        {/* Registration Card */}
        <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-2xl p-10 z-10">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Logo */}
            <div className="mb-5 p-3 bg-[#e7f4f0] rounded-2xl">
              <Sparkles className="w-8 h-8 text-[#059467]" />
            </div>
            <h1 className="text-[24px] font-black leading-tight text-[#0f231d] tracking-tight mb-2">
              Join the Expedition
            </h1>
            <p className="text-[14px] font-medium text-slate-500 leading-relaxed max-w-[360px]">
              Start planning your next journey and managing your gear with the community.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0f231d] ml-1" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-5 h-5" />
                </span>
                <input
                  className="block w-full h-[52px] pl-11 pr-4 rounded-lg bg-white border border-slate-200 text-[#0f231d] placeholder:text-slate-400 focus:border-[#059467] focus:ring-1 focus:ring-[#059467] focus:ring-opacity-50 transition-colors shadow-sm text-sm"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0f231d] ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  className="block w-full h-[52px] pl-11 pr-4 rounded-lg bg-white border border-slate-200 text-[#0f231d] placeholder:text-slate-400 focus:border-[#059467] focus:ring-1 focus:ring-[#059467] focus:ring-opacity-50 transition-colors shadow-sm text-sm"
                  id="email"
                  name="email"
                  placeholder="explorer@nomadnotes.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0f231d] ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  className="block w-full h-[52px] pl-11 pr-12 rounded-lg bg-white border border-slate-200 text-[#0f231d] placeholder:text-slate-400 focus:border-[#059467] focus:ring-1 focus:ring-[#059467] focus:ring-opacity-50 transition-colors shadow-sm text-sm"
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#0f231d] transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {formData.password && (
                <div className="pt-2 px-1">
                  <div className="flex gap-2 h-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className="flex-1 bg-slate-100 rounded-full overflow-hidden h-full">
                        {passwordStrength >= level && (
                          <div className={`${getStrengthColor()} w-full h-full rounded-full transition-all`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className={`text-[11px] font-medium text-right ${passwordStrength >= 3 ? 'text-[#059467]' : 'text-orange-500'}`}>
                    {getStrengthLabel()} Strength
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0f231d] ml-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <RotateCcw className="w-5 h-5" />
                </span>
                <input
                  className="block w-full h-[52px] pl-11 pr-12 rounded-lg bg-white border border-slate-200 text-[#0f231d] placeholder:text-slate-400 focus:border-[#059467] focus:ring-1 focus:ring-[#059467] focus:ring-opacity-50 transition-colors shadow-sm text-sm"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#0f231d] transition-colors"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 pt-2 px-1">
              <div className="flex h-5 items-center">
                <input
                  className="h-5 w-5 rounded border-slate-300 text-[#059467] focus:ring-[#059467] cursor-pointer transition-colors
                  checked:bg-[#059467] checked:border-[#059467]"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="text-sm">
                <label className="font-medium text-slate-500" htmlFor="agreeToTerms">
                  I agree to the{' '}
                  <a className="text-[#0f231d] underline decoration-slate-300 underline-offset-2 hover:decoration-[#059467] transition-colors" href="#">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a className="text-[#0f231d] underline decoration-slate-300 underline-offset-2 hover:decoration-[#059467] transition-colors" href="#">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* CTA Button */}
            <button
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#059467] hover:bg-[#047854] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059467] mt-4 tracking-wide transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#059467]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Your Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-bold text-[#059467] hover:text-[#047854] transition-colors ml-1"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
