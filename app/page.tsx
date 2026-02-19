'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  MapPin,
  Backpack,
  DollarSign,
  Calendar,
  WifiOff,
  Users,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: MapPin,
      title: 'Trip Planning',
      description: 'Visualise your route and organize stays effortlessly.'
    },
    {
      icon: Backpack,
      title: 'Gear Rental',
      description: 'Travel light and rent quality gear at your destination.'
    },
    {
      icon: DollarSign,
      title: 'Budget Tracking',
      description: 'Track expenses with multi-currency support.'
    },
    {
      icon: Calendar,
      title: 'Itinerary Builder',
      description: 'Create detailed day-by-day travel plans.'
    },
    {
      icon: WifiOff,
      title: 'Offline Mode',
      description: 'Access maps and bookings without internet.'
    },
    {
      icon: Users,
      title: 'Community Hub',
      description: 'Connect with digital nomads worldwide.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f8f7]">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full min-h-[600px] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
            alt="Mountains"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0f231d]/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Plan Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                Adventure
              </span>
            </h1>
            <p className="text-xl text-slate-100 mb-8 leading-relaxed">
              The all-in-one workspace for digital nomads to plan trips, track budgets, and rent premium gear anywhere in the world.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-[#059467] hover:bg-[#047a55] text-white text-lg font-bold px-8 py-4 rounded-full transition-all shadow-xl flex items-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/features')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg font-bold px-8 py-4 rounded-full transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#0f231d] mb-4">
            Built for the Modern Explorer
          </h2>
          <p className="text-slate-500 text-lg">
            Everything you need to seamlessly transition from work to wanderlust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group border border-slate-100"
            >
              <div className="size-14 rounded-2xl bg-[#059467]/10 flex items-center justify-center text-[#059467] mb-6 group-hover:bg-[#059467] group-hover:text-white transition-colors">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-[#0f231d] text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-[#0f231d] rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            Ready to roam freely?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join thousands of nomads using NomadNotes to plan smarter and travel lighter.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="bg-[#059467] hover:bg-[#047a55] text-white text-lg font-bold px-8 py-4 rounded-full transition-all shadow-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
