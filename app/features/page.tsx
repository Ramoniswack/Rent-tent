'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  MapPin,
  Backpack,
  DollarSign,
  Calendar,
  WifiOff,
  Users,
  ArrowRight,
  PlayCircle,
  Star
} from 'lucide-react';

export default function FeaturesPage() {
  const router = useRouter();

  const features = [
    {
      icon: MapPin,
      title: 'Trip Planning',
      description: 'Visualise your route, pin locations, and organize stays effortlessly with our drag-and-drop itinerary builder.'
    },
    {
      icon: Backpack,
      title: 'Gear Rental',
      description: 'Travel light and rent high-quality gear at your destination. From laptops to tents, we have you covered.'
    },
    {
      icon: DollarSign,
      title: 'Budget Tracking',
      description: 'Keep track of your expenses in real-time with multi-currency support and automatic categorization.'
    },
    {
      icon: Calendar,
      title: 'Itinerary Builder',
      description: 'Create detailed day-by-day plans, sync with your calendar, and share with fellow travelers instantly.'
    },
    {
      icon: WifiOff,
      title: 'Offline Mode',
      description: 'Never get lost. Access your maps, bookings, and important documents even without an internet connection.'
    },
    {
      icon: Users,
      title: 'Community Hub',
      description: 'Connect with other digital nomads nearby, join local meetups, and find the best co-working spots.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Jenkins',
      role: 'Digital Nomad, 4 years',
      rating: 5,
      text: 'NomadNotes completely changed how I plan my trips. The gear rental feature saved me so much hassle on my last trip to Patagonia.',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      name: 'Marcus Chen',
      role: 'Travel Photographer',
      rating: 5,
      text: 'The offline mode is a lifesaver. I was hiking in remote areas of Japan and still had access to all my reservation details.',
      avatar: 'https://i.pravatar.cc/150?img=13'
    },
    {
      name: 'Elena Rodriguez',
      role: 'UX Designer',
      rating: 4.5,
      text: 'Finally, a tool that understands the needs of remote workers. The budget tracking helped me save enough for an extra month in Bali.',
      avatar: 'https://i.pravatar.cc/150?img=5'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f8f7]">
      <Header />

      {/* Hero Section */}
      <header className="relative w-full min-h-[800px] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
            alt="Mist covered mountains and forest landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0f231d]/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f231d]/30 via-transparent to-[#f5f8f7]"></div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-20 w-full grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 pt-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit">
              <span className="flex h-2 w-2 rounded-full bg-[#059467] animate-pulse"></span>
              <span className="text-white text-xs font-semibold tracking-wide uppercase">
                New Features 2.0 Live
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black text-white leading-[1.1] tracking-tight">
              Plan Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                Adventure
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-100 font-medium max-w-2xl leading-relaxed opacity-90">
              The all-in-one workspace for digital nomads to plan trips, track budgets, and rent premium gear anywhere in the world.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-[#059467] hover:bg-[#047a55] text-white text-base font-bold h-14 px-8 rounded-full transition-all duration-300 shadow-xl shadow-[#059467]/20 flex items-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-base font-bold h-14 px-8 rounded-full transition-all duration-300 flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Trusted by */}
            <div className="pt-12 border-t border-white/10 mt-8 w-full max-w-md">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">
                Trusted by nomads from
              </p>
              <div className="flex items-center gap-6 opacity-70 grayscale">
                <span className="text-white font-bold text-xl">Airbnb</span>
                <span className="text-white font-bold text-xl">Remote.com</span>
                <span className="text-white font-bold text-xl">NomadList</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 px-6 lg:px-20 max-w-[1440px] mx-auto bg-[#f5f8f7] relative z-10 -mt-20 rounded-t-[3rem]"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-[#0f231d] text-4xl md:text-[48px] font-black leading-tight tracking-tight mb-4">
              Built for the Modern Explorer
            </h2>
            <p className="text-slate-500 text-lg">
              Everything you need to seamlessly transition from work to wanderlust.
            </p>
          </div>
          <a
            href="#"
            className="text-[#059467] font-bold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all features
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-slate-100"
            >
              <div className="size-14 rounded-2xl bg-[#059467]/10 flex items-center justify-center text-[#059467] mb-6 group-hover:bg-[#059467] group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-[#0f231d] text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Large CTA Break */}
      <section className="py-12 px-6 lg:px-20 max-w-[1440px] mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-[#0f231d] h-[400px] flex items-center justify-center text-center px-4">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
            alt="Person planning travel"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Ready to roam freely?
            </h2>
            <p className="text-slate-300 text-lg">
              Join 50,000+ nomads using NomadNotes to plan smarter and travel lighter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-[#059467] hover:bg-[#047a55] text-white text-base font-bold h-12 px-8 rounded-full transition-all duration-300 shadow-lg shadow-[#059467]/20"
              >
                Start Your Free Trial
              </button>
              <button className="bg-transparent hover:bg-white/10 border border-white/30 text-white text-base font-bold h-12 px-8 rounded-full transition-all duration-300">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-20 max-w-[1440px] mx-auto bg-[#f5f8f7]">
        <div className="text-center mb-16">
          <h2 className="text-[#0f231d] text-3xl md:text-4xl font-bold mb-4">
            Loved by Travelers
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Don't just take our word for it. Here's what the community has to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
            >
              <div className="flex gap-1 text-[#f59e0b]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(testimonial.rating)
                        ? 'fill-current'
                        : i < testimonial.rating
                        ? 'fill-current opacity-50'
                        : ''
                    }`}
                  />
                ))}
              </div>
              <p className="text-[#0f231d] text-lg font-medium leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <div className="text-[#0f231d] font-bold text-sm">{testimonial.name}</div>
                  <div className="text-slate-500 text-xs">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
