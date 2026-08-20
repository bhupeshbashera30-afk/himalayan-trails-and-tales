import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Mountain, MapPin, Calendar, Users, ArrowRight,
  CheckCircle2, Clock, ShieldCheck, Phone, Mail, Award, Check, Sparkles, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import TrekRegistrationForm from '@/components/TrekRegistrationForm';
import { getFirstImage } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  highlights?: string;
}

interface TrekDetail {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date?: string | null;
  end_date?: string | null;
  price: number | null;
  difficulty: string;
  max_seats: number;
  seats_booked: number;
  images: string[];
  highlights: string[];
  itinerary?: ItineraryItem[];
  duration_days?: number;
  inclusions?: string[];
  exclusions?: string[];
  isPackage?: boolean;
}

const difficultyConfig: Record<string, { label: string; color: string; bg: string }> = {
  easy: { label: 'Easy Trek', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  moderate: { label: 'Moderate Trek', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  hard: { label: 'Challenging Trek', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
};

export default function TrekDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trek, setTrek] = useState<TrekDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'overview' | 'inclusions'>('itinerary');
  const [regFormOpen, setRegFormOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(1);

  useEffect(() => {
    if (id) {
      fetchTrekDetails(id);
    }
  }, [id]);

  const fetchTrekDetails = async (trekId: string) => {
    setLoading(true);
    try {
      // 1. Check treks table first
      const { data: trekData, error: trekErr } = await supabase
        .from('treks')
        .select('*')
        .eq('id', trekId)
        .maybeSingle();

      if (trekData) {
        setTrek({
          ...trekData,
          isPackage: false,
          images: Array.isArray(trekData.images) ? trekData.images : [],
          highlights: Array.isArray(trekData.highlights) ? trekData.highlights : [],
          itinerary: Array.isArray(trekData.itinerary) ? trekData.itinerary : [],
        });
        setLoading(false);
        return;
      }

      // 2. Fallback to packages table
      const { data: pkgData } = await supabase
        .from('packages_2025_10_14_17_34')
        .select('*')
        .eq('id', trekId)
        .maybeSingle();

      if (pkgData) {
        setTrek({
          id: pkgData.id,
          name: pkgData.name,
          description: pkgData.description,
          location: pkgData.location || 'Uttarakhand Himalayas',
          start_date: pkgData.start_date || null,
          end_date: pkgData.end_date || null,
          price: pkgData.price,
          difficulty: pkgData.difficulty || 'moderate',
          max_seats: pkgData.max_seats || 20,
          seats_booked: pkgData.seats_booked || 0,
          images: Array.isArray(pkgData.images) ? pkgData.images : [],
          highlights: Array.isArray(pkgData.inclusions) ? pkgData.inclusions : [],
          itinerary: Array.isArray(pkgData.itinerary) ? pkgData.itinerary : [],
          duration_days: pkgData.duration_days,
          inclusions: Array.isArray(pkgData.inclusions) ? pkgData.inclusions : [],
          exclusions: Array.isArray(pkgData.exclusions) ? pkgData.exclusions : [],
          isPackage: true,
        });
      } else {
        toast({ title: 'Trek Not Found', description: 'The requested trek or package could not be found.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Error loading trek:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading trek details & itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <Mountain className="w-16 h-16 text-muted-foreground mx-auto opacity-30" />
          <h2 className="text-2xl font-serif font-bold text-white">Trek Not Found</h2>
          <p className="text-muted-foreground text-sm">We couldn't find the trek you're looking for. It may have been updated or removed.</p>
          <Button onClick={() => navigate('/')} className="pulse-glow gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Homepage
          </Button>
        </div>
      </div>
    );
  }

  const diff = difficultyConfig[trek.difficulty || 'moderate'] || difficultyConfig.moderate;
  const maxSeats = trek.max_seats || 20;
  const seatsBooked = trek.seats_booked || 0;
  const seatsLeft = Math.max(0, maxSeats - seatsBooked);
  const seatsPercent = Math.min(100, Math.round((seatsBooked / maxSeats) * 100));
  const mainImage = getFirstImage(trek.images, 1200) || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80';

  // Format itinerary days or fallback
  const itineraryDays: ItineraryItem[] = (trek.itinerary && trek.itinerary.length > 0)
    ? trek.itinerary
    : [
        {
          day: 1,
          title: `Arrival & Base Camp Gathering`,
          description: `Meet the Pahadi mountain guides, complete registration formalities, and attend safety orientation briefing. Overnight stay in scenic mountain camps.`,
          highlights: `Orientation, Mountain Gear Check, Traditional Pahadi Dinner`
        },
        {
          day: 2,
          title: `Acclimatization & Scenic Trail Ascent`,
          description: `Begin early morning ascent through pine forests and mountain streams. Practice altitude breathing and enjoy panoramic Himalayan views.`,
          highlights: `Pine Forest Trail, Himalayan Stream Crossing, High Vantage Viewpoint`
        },
        {
          day: 3,
          title: `Summit Darshan & High Altitude Experience`,
          description: `Reach the central viewpoint for breathtaking views of sacred peaks. Ample time for photography, meditation, and quiet reflection.`,
          highlights: `Peak Darshan, Sacred Ridge Walk, Sunset Photography`
        },
        {
          day: 4,
          title: `Descent & Celebration Evening`,
          description: `Leisurely descent back towards base village. Evening bonfire with traditional Pahadi folklore and music.`,
          highlights: `Alpine Flora Tour, Bonfire & Folklore Night, Certificate Distribution`
        }
      ];

  return (
    <div className="min-h-screen bg-[#0d0d12] text-foreground selection:bg-primary selection:text-white">
      {/* Top Header */}
      <nav className="sticky top-0 z-40 bg-[#0d0d12]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Treks</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-white hidden sm:inline-block">
              Himalayan Trails <span className="text-primary">&</span> Tales
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => setRegFormOpen(true)}
            className="pulse-glow text-xs sm:text-sm"
          >
            Register Interest
          </Button>
        </div>
      </nav>

      {/* Main Banner Hero */}
      <section className="relative min-h-[50vh] lg:min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={mainImage}
            alt={trek.name}
            className="w-full h-full object-cover filter brightness-[0.65]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pb-10 pt-20 w-full">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${diff.bg} ${diff.color} border px-3 py-1 font-medium capitalize text-xs`}>
                {diff.label}
              </Badge>
              {trek.location && (
                <Badge variant="outline" className="border-white/20 bg-black/40 text-white gap-1 text-xs">
                  <MapPin className="w-3 h-3 text-primary" />
                  {trek.location}
                </Badge>
              )}
              {trek.start_date && (
                <Badge variant="outline" className="border-white/20 bg-black/40 text-white gap-1 text-xs">
                  <Calendar className="w-3 h-3 text-primary" />
                  Starts: {new Date(trek.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Badge>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {trek.name}
            </h1>

            <p className="text-gray-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-2xl">
              {trek.description}
            </p>
          </div>
        </div>
      </section>

      {/* Details & Sidebar Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Itinerary & Overview */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tab Controls */}
            <div className="flex border-b border-white/10 gap-6">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`pb-3 text-sm font-semibold transition-all relative ${
                  activeTab === 'itinerary' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Trip Itinerary ({itineraryDays.length} Days)
                </span>
                {activeTab === 'itinerary' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-semibold transition-all relative ${
                  activeTab === 'overview' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Highlights & Overview
                </span>
                {activeTab === 'overview' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('inclusions')}
                className={`pb-3 text-sm font-semibold transition-all relative ${
                  activeTab === 'inclusions' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Inclusions & Notes
                </span>
                {activeTab === 'inclusions' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            </div>

            {/* TAB 1: ITINERARY */}
            {activeTab === 'itinerary' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-serif text-2xl font-bold text-white">Day-by-Day Itinerary</h2>
                  <span className="text-xs text-muted-foreground">Click any day to view details</span>
                </div>

                <div className="space-y-3">
                  {itineraryDays.map((item, idx) => {
                    const isOpen = activeDay === item.day || activeDay === idx + 1;
                    return (
                      <div
                        key={idx}
                        className={`border rounded-2xl transition-all overflow-hidden ${
                          isOpen ? 'bg-[#161622] border-primary/40 shadow-lg' : 'bg-[#12121a] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <button
                          onClick={() => setActiveDay(isOpen ? null : (item.day || idx + 1))}
                          className="w-full p-4 text-left flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                              D{item.day || idx + 1}
                            </div>
                            <div>
                              <div className="text-xs text-primary font-medium uppercase tracking-wider">Day {item.day || idx + 1}</div>
                              <h3 className="font-semibold text-white text-base truncate">{item.title}</h3>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full flex-shrink-0">
                            {isOpen ? 'Close' : 'View'}
                          </span>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-5 pt-1 border-t border-white/5 space-y-3 text-sm text-gray-300"
                            >
                              <p className="leading-relaxed">{item.description}</p>
                              {item.highlights && (
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-xs text-primary flex items-start gap-2">
                                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-semibold">Day Highlights: </span>
                                    {item.highlights}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 2: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif text-xl font-bold text-white">Trek Overview</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    {trek.description}
                  </p>
                </div>

                {trek.highlights && trek.highlights.length > 0 && (
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" /> Key Highlights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {trek.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5 text-sm text-gray-200">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: INCLUSIONS */}
            {activeTab === 'inclusions' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Included */}
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h4 className="font-semibold text-white text-base flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" /> What's Included
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">✓ Experienced local mountain guides & porters</li>
                      <li className="flex items-center gap-2">✓ All vegetarian meals during the trek</li>
                      <li className="flex items-center gap-2">✓ Quality camping tents & sleeping bags</li>
                      <li className="flex items-center gap-2">✓ Inner Line permits & forest entry fees</li>
                      <li className="flex items-center gap-2">✓ First-aid kit & emergency support</li>
                    </ul>
                  </div>

                  {/* Requirements */}
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h4 className="font-semibold text-white text-base flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" /> Essential Guidelines
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">• Valid Government ID Proof (Aadhaar / Passport)</li>
                      <li className="flex items-center gap-2">• Sturdy high-ankle trekking shoes</li>
                      <li className="flex items-center gap-2">• Warm thermal layers & rain jacket</li>
                      <li className="flex items-center gap-2">• Personal medicine refill pack</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column: Sticky Pricing & Registration Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#14141f] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
              
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">Trek Price</span>
                  <div className="text-3xl font-extrabold text-white">
                    {trek.price ? `₹${trek.price.toLocaleString()}` : 'Price on Request'}
                  </div>
                </div>
                <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-medium">
                  Per Person
                </span>
              </div>

              {/* Seats availability */}
              <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between text-xs text-gray-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> Seats Available
                  </span>
                  <span className="text-primary font-bold">{seatsLeft} of {maxSeats}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-500"
                    style={{ width: `${seatsPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => setRegFormOpen(true)}
                disabled={seatsLeft <= 0}
                className="w-full pulse-glow py-6 text-base font-bold rounded-xl gap-2"
              >
                {seatsLeft <= 0 ? 'Fully Booked' : 'Register Interest Now'}
                <ArrowRight className="w-5 h-5" />
              </Button>

              <div className="pt-2 border-t border-white/10 space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span>Instant confirmation & 24/7 Pahadi support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>Need help? Call +91 8630113945</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Trek Registration Modal */}
      {trek && (
        <TrekRegistrationForm
          trek={{
            id: trek.id,
            name: trek.name,
            location: trek.location,
            start_date: trek.start_date || undefined,
            end_date: trek.end_date || undefined,
            price: trek.price,
            difficulty: trek.difficulty,
            max_seats: trek.max_seats,
            seats_booked: trek.seats_booked,
            isPackage: trek.isPackage,
          }}
          open={regFormOpen}
          onClose={() => setRegFormOpen(false)}
        />
      )}
    </div>
  );
}
