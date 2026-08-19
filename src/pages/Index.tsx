import React, { useState, useEffect, useRef } from 'react';
import { getFirstImage } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Copy, Check, ChevronDown, Mountain, Utensils, Bed, Heart,
  Star, Calendar, Users, Mail, MapPin, ArrowRight, Clock, AlertTriangle,
  Quote, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import TrekRegistrationForm from '@/components/TrekRegistrationForm';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  price_range: string | null;
  images: string[];
  features: string[];
  category_id: string;
  rating: number;
  is_featured: boolean;
}

interface Package {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price?: number;
  destinations: string[];
  inclusions: string[];
  exclusions: string[];
  images: string[];
  is_featured: boolean;
  start_date?: string;
  end_date?: string;
  location?: string;
  difficulty?: string;
  max_seats?: number;
  seats_booked?: number;
}

interface Trek {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  price: number;
  difficulty: string;
  max_seats: number;
  seats_booked: number;
  images: string[];
  highlights: string[];
  is_upcoming: boolean;
  is_active: boolean;
}

const iconMap = {
  utensils: Utensils,
  bed: Bed,
  mountain: Mountain,
  heart: Heart,
};

const difficultyConfig: Record<string, { color: string; bg: string; label: string }> = {
  easy: { color: 'text-green-400', bg: 'bg-green-400/20', label: 'Easy' },
  moderate: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', label: 'Moderate' },
  hard: { color: 'text-red-400', bg: 'bg-red-400/20', label: 'Hard' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDuration(startDate: string, endDate: string) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const nights = Math.max(0, days - 1);
  return { days, nights };
}

function getAltitude(highlights: string[]): string | null {
  if (!Array.isArray(highlights)) return null;
  for (const h of highlights) {
    const match = h.match(/(\d[\d,]*\.?\d*)\s*ft/i);
    if (match) return match[1] + ' ft.';
  }
  return null;
}

const staticTestimonials = [
  {
    id: 1,
    text: "Himalayan Trails & Tales turned my Valley of Flowers trek into something straight out of a dream. Every detail was perfect, from the local stays to the experienced guides.",
    rating: 5,
    name: "Priya Sharma",
    trek: "VALLEY OF FLOWERS"
  },
  {
    id: 2,
    text: "The Chopta Chandrashila trek was breathtaking. The sunset, the snow peaks, the camp setup under the stars, it felt like a dream. Truly unforgettable experience.",
    rating: 5,
    name: "Rohan & Ananya",
    trek: "CHOPTA CHANDRASHILA"
  },
  {
    id: 3,
    text: "Professional, creative, and so easy to travel with. Our group trip to Kedarkantha was absolutely stunning. The local organic food was a massive hit with everyone!",
    rating: 5,
    name: "Meera Kapoor",
    trek: "KEDARKANTHA TREK"
  },
  {
    id: 4,
    text: "I wanted the Har Ki Dun trek to be perfect and Himalayan Trails & Tales delivered beyond my expectations. The view of the peaks was the most beautiful setting imaginable.",
    rating: 5,
    name: "Vikram Patel",
    trek: "HAR KI DUN TREK"
  }
];

export default function Index() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const [isCopied, setIsCopied] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Himalayan Trails & Tales',
    tagline: 'Discover Pahadi Spirit',
    phone: '+91 8630113945',
    email: 'himalayantrailtales@gmail.com',
    address: 'Haldwani, Uttarakhand',
    instagram: '',
    facebook: '',
    youtube: '',
  });

  const cleanPhone = siteSettings.phone.replace(/\s+/g, '');

  const handleSmartContact = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setShowMobileMenu(true);
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cleanPhone);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    setShowMobileMenu(false);
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [treks, setTreks] = useState<Trek[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>(staticTestimonials);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState<any | null>(null);
  const [trekFormOpen, setTrekFormOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    travel_dates: '',
    group_size: 1,
    budget_range: '',
    service_interests: [] as string[],
    special_requirements: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showContactThankYou, setShowContactThankYou] = useState(false);

  useEffect(() => {
    fetchData();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Subscribe to real-time changes on the "treks" table
    const treksChannel = supabase
      .channel('treks-realtime-homepage')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'treks' },
        async (payload) => {
          // Re-fetch treks when any change occurs
          const { data } = await supabase
            .from('treks')
            .select('*')
            .eq('is_active', true)
            .order('start_date', { ascending: true });
          if (data) setTreks(data as Trek[]);
        }
      )
      .subscribe();

    // Subscribe to real-time changes on the "packages" table
    const packagesChannel = supabase
      .channel('packages-realtime-homepage')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'packages_2025_10_14_17_34' },
        async (payload) => {
          // Re-fetch packages when any change occurs
          const { data } = await supabase
            .from('packages_2025_10_14_17_34')
            .select('*')
            .eq('is_featured', true);
          if (data) setPackages(data as Package[]);
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      supabase.removeChannel(treksChannel);
      supabase.removeChannel(packagesChannel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, destinationsRes, packagesRes, treksRes] = await Promise.all([
        supabase.from('categories_2025_10_14_17_34').select('*'),
        supabase.from('destinations_2025_10_14_17_34').select('*'),
        supabase.from('packages_2025_10_14_17_34').select('*').eq('is_featured', true),
        supabase.from('treks').select('*').eq('is_active', true).order('start_date', { ascending: true }),
      ]);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (destinationsRes.data) setDestinations(destinationsRes.data);
      if (packagesRes.data) setPackages(packagesRes.data);
      if (treksRes.data) setTreks(treksRes.data as Trek[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        setTestimonials(data);
      } else if (error) {
        console.warn('Could not fetch testimonials from database, using fallback:', error.message);
      }
    } catch (err) {
      console.warn('Error fetching testimonials, using fallback:', err);
    }

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();
      
      if (!error && data) {
        setSiteSettings({
          siteName: data.site_name || 'Himalayan Trails & Tales',
          tagline: data.tagline || 'Discover Pahadi Spirit',
          phone: data.phone || '+91 8630113945',
          email: data.email || 'himalayantrailtales@gmail.com',
          address: data.address || 'Haldwani, Uttarakhand',
          instagram: data.instagram || '',
          facebook: data.facebook || '',
          youtube: data.youtube || '',
        });
      } else if (error) {
        console.warn('Could not fetch site settings from database, using fallback:', error.message);
      }
    } catch (err) {
      console.warn('Error fetching site settings, using fallback:', err);
    }
  };

  const getDestinationsByCategory = (categoryId: string) => {
    return destinations.filter(dest => dest.category_id === categoryId);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('contact_submissions_2025_10_14_17_34')
        .insert([contactForm]);
      if (error) throw error;

      setShowContactThankYou(true);
      setContactForm({
        name: '', email: '', phone: '', travel_dates: '',
        group_size: 1, budget_range: '', service_interests: [], special_requirements: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleServiceInterestChange = (service: string, checked: boolean) => {
    setContactForm(prev => ({
      ...prev,
      service_interests: checked
        ? [...prev.service_interests, service]
        : prev.service_interests.filter(s => s !== service)
    }));
  };

  const openTrekRegistration = (item: any, isPackage: boolean = false) => {
    setSelectedTrek({ ...item, isPackage });
    setTrekFormOpen(true);
  };

  // Get first destination image for a category (for mobile grid)
  const getCategoryImage = (categoryId: string) => {
    const dests = getDestinationsByCategory(categoryId);
    if (dests.length > 0) {
      const img = getFirstImage(dests[0].images, 600);
      if (img) return img;
    }
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'glass backdrop-blur-xl py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="font-serif text-2xl font-bold gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {siteSettings.siteName}
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Mountain;
                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(category.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-300 group">
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium">{category.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        activeDropdown === category.id ? 'rotate-180' : ''
                      }`} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === category.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-80 bg-card rounded-xl p-4 shadow-2xl"
                        >
                          <div className="space-y-3">
                            <div className="text-sm text-muted-foreground mb-3">
                              {category.description}
                            </div>
                            {getDestinationsByCategory(category.id).slice(0, 2).map((destination) => (
                              <div key={destination.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <img
                                  src={getFirstImage(destination.images, 100)}
                                  alt={destination.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{destination.name}</div>
                                  <div className="text-xs text-muted-foreground">{destination.location}</div>
                                  <div className="text-xs text-primary font-medium">{destination.price_range || ""}</div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{destination.rating}</span>
                                </div>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate(`/category/${category.slug}`)}>
                              View All {category.name}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="pulse-glow">Plan Your Journey</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Let's Plan Your Perfect Pahadi Adventure</DialogTitle>
                  <DialogDescription>
                    Tell us about your travel preferences and we'll create a customized experience just for you.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={contactForm.name} onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={contactForm.email} onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={contactForm.phone} onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="travel_dates">Preferred Travel Dates</Label>
                      <DatePicker
                        id="travel_dates"
                        value={contactForm.travel_dates}
                        onChange={(val) => setContactForm(prev => ({ ...prev, travel_dates: val }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="group_size">Group Size</Label>
                      <Select value={contactForm.group_size.toString()} onValueChange={(value) => setContactForm(prev => ({ ...prev, group_size: parseInt(value) }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Person' : 'People'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget Range</Label>
                      <Select value={contactForm.budget_range} onValueChange={(value) => setContactForm(prev => ({ ...prev, budget_range: value }))}>
                        <SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-10k">Under ₹10,000</SelectItem>
                          <SelectItem value="10k-25k">₹10,000 - ₹25,000</SelectItem>
                          <SelectItem value="25k-50k">₹25,000 - ₹50,000</SelectItem>
                          <SelectItem value="50k-100k">₹50,000 - ₹1,00,000</SelectItem>
                          <SelectItem value="above-100k">Above ₹1,00,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Service Interests</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.slug}
                            checked={contactForm.service_interests.includes(category.name)}
                            onCheckedChange={(checked) => handleServiceInterestChange(category.name, checked as boolean)}
                          />
                          <Label htmlFor={category.slug} className="text-sm">{category.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="special_requirements">Special Requirements or Requests</Label>
                    <Textarea
                      id="special_requirements"
                      placeholder="Any specific preferences, dietary restrictions, accessibility needs, or special occasions..."
                      value={contactForm.special_requirements}
                      onChange={(e) => setContactForm(prev => ({ ...prev, special_requirements: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full">Send My Travel Request</Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Thank You Dialog for Contact Form */}
            <Dialog open={showContactThankYou} onOpenChange={setShowContactThankYou}>
              <DialogContent className="max-w-md text-center">
                <DialogHeader>
                  <DialogTitle className="font-serif text-3xl text-primary">THANK YOU FOR CHOOSING US!</DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-lg mt-4">WE WILL GET BACK TO YOU SOON</DialogDescription>
                <div className="mt-8">
                  <Button onClick={() => setShowContactThankYou(false)} className="w-full">Close</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start md:items-center justify-center overflow-hidden pt-28 md:pt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background opacity-90" />
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
            alt="Himalayan Mountains"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <motion.h1
            className="font-serif text-4xl sm:text-5xl md:text-8xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {siteSettings.tagline}
          </motion.h1>

          <motion.p
            className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Where authentic cuisine meets adventure, comfortable stays blend with spiritual journeys,
            and every moment becomes a cherished memory in the heart of the Himalayas.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <>
              <div className="flex gap-4">
                <motion.div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 glass min-w-[200px]"
                    onClick={handleSmartContact}
                  >
                    {isCopied ? (
                      <Check className="w-5 h-5 mr-2 text-green-500" />
                    ) : (
                      <Phone className="w-5 h-5 mr-2" />
                    )}
                    {isCopied ? "Number Copied!" : "Speak with Expert"}
                  </Button>
                </motion.div>
              </div>

              {/* Mobile Popup Menu */}
              <Dialog open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <DialogContent className="sm:max-w-md bg-white text-black">
                  <DialogHeader>
                    <DialogTitle>Contact Expert</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <Button size="lg" className="w-full gap-2" onClick={() => window.location.href = `tel:${cleanPhone}`}>
                      <Phone className="w-4 h-4" />
                      Call Now ({siteSettings.phone})
                    </Button>
                    <Button variant="secondary" size="lg" className="w-full gap-2" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4" />
                      Copy Number Only
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          </motion.div>

          {/* Mobile Categories - 2-column grid below Speak with Expert */}
          {categories.length > 0 && (
            <motion.div
              className="md:hidden mt-10 w-full max-w-sm mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-semibold">Explore Categories</p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => navigate(`/category/${category.slug}`)}
                    className="relative rounded-2xl overflow-hidden aspect-square group shadow-lg"
                  >
                    <img
                      src={getCategoryImage(category.id)}
                      alt={category.name}
                      className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                      <span className="text-white text-sm font-semibold text-left leading-tight">{category.name}</span>
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ml-2">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary-glow/20 rounded-full blur-xl float" style={{ animationDelay: '4s' }} />
      </section>

      {/* ============================================================ */}
      {/* UPCOMING TREKS SECTION */}
      {/* ============================================================ */}
      <section className="py-10 md:py-20 px-2 md:px-6 bg-gradient-to-r from-card via-background to-card">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-8 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <Mountain className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Upcoming Adventures</span>
            </div>
            <h2 className="font-serif text-2xl md:text-5xl font-bold mb-2 md:mb-4 gradient-text">
              Upcoming Treks
            </h2>
            <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join us on our next Himalayan adventure — register your interest and we'll handle the rest
            </p>
          </motion.div>

          {treks.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl">
              <Mountain className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground text-lg">No upcoming treks at the moment</p>
              <p className="text-muted-foreground text-sm mt-2">Check back soon or contact us for custom trek planning</p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={handleSmartContact}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Us for Custom Treks
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-8">
              {treks.map((trek, index) => {
                const seatsLeft = trek.max_seats - trek.seats_booked;
                const seatsPercent = Math.round((trek.seats_booked / trek.max_seats) * 100);
                const diff = difficultyConfig[trek.difficulty] || difficultyConfig.moderate;
                const trekImage = Array.isArray(trek.images) && trek.images.length > 0
                  ? trek.images[0]
                  : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';

                return (
                  <motion.div
                    key={trek.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="glass rounded-2xl md:rounded-2xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative overflow-hidden h-32 md:h-56">
                        <img
                          src={trekImage}
                          alt={trek.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Difficulty Badge */}
                        <div className="absolute top-2 left-2 md:top-4 md:left-4">
                          <span className={`inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${diff.color} ${diff.bg} backdrop-blur-sm border border-white/10`}>
                            {diff.label}
                          </span>
                        </div>

                        {/* Seats indicator */}
                        {seatsLeft <= 5 && seatsLeft > 0 && (
                          <div className="absolute top-2 right-2 md:top-4 md:right-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold text-orange-400 bg-orange-400/20 backdrop-blur-sm border border-orange-400/20">
                              <AlertTriangle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              Only {seatsLeft} left!
                            </span>
                          </div>
                        )}

                        {/* Price overlay */}
                        {trek.price && (
                          <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
                            <div className="bg-primary/90 backdrop-blur-sm text-white px-2 py-0.5 md:px-3 md:py-1 rounded-lg">
                              <span className="text-[10px] md:text-xs">From</span>
                              <div className="font-bold text-xs md:text-sm">₹{trek.price.toLocaleString()}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 md:p-5 flex flex-col flex-1">
                        <h3 className="font-serif text-sm md:text-xl font-bold mb-1.5 md:mb-2 line-clamp-2">{trek.name}</h3>

                        {/* Compact 2-column info grid */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 md:gap-y-1.5 mb-2 md:mb-3 text-[11px] md:text-sm">
                          {/* Location */}
                          <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                            <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary" />
                            <span className="truncate">{trek.location?.split(',')[0]}</span>
                          </div>
                          {/* Difficulty */}
                          <div className="flex items-center gap-1 min-w-0">
                            <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary rotate-[-45deg]" />
                            <span className={`${diff.color} truncate`}>{diff.label}</span>
                          </div>
                          {/* Duration */}
                          {(() => {
                            const dur = getDuration(trek.start_date, trek.end_date);
                            return dur ? (
                              <div className="flex items-center gap-1 text-muted-foreground col-span-2 md:col-span-1 min-w-0">
                                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary" />
                                <span className="truncate">{dur.days} Days, {dur.nights} Nights</span>
                              </div>
                            ) : null;
                          })()}
                          {/* Altitude */}
                          {(() => {
                            const alt = getAltitude(trek.highlights);
                            return alt ? (
                              <div className="flex items-center gap-1 text-muted-foreground col-span-2 md:col-span-1 min-w-0">
                                <Mountain className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary" />
                                <span className="truncate">{alt}</span>
                              </div>
                            ) : null;
                          })()}
                        </div>

                        {/* Seats progress */}
                        <div className="mb-2 md:mb-4">
                          <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground mb-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              {seatsLeft} of {trek.max_seats} seats available
                            </span>
                            <span>{seatsPercent}% full</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1 md:h-1.5">
                            <div
                              className="bg-primary rounded-full h-1 md:h-1.5 transition-all duration-500"
                              style={{ width: `${seatsPercent}%` }}
                            />
                          </div>
                        </div>

                        <Button
                          className="w-full pulse-glow mt-auto text-[11px] md:text-sm py-1.5 md:py-2 h-auto"
                          onClick={() => openTrekRegistration(trek)}
                          disabled={seatsLeft <= 0}
                        >
                          {seatsLeft <= 0 ? 'Fully Booked' : 'Register Interest'}
                          {seatsLeft > 0 && <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-10 md:py-20 px-2 md:px-6">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-8 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl md:text-5xl font-bold mb-2 md:mb-4 gradient-text">
              Curated Experiences
            </h2>
            <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpicked packages that showcase the best of Pahadi culture, adventure, and serenity
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-8">
            {packages.map((pkg, index) => {
              const diff = difficultyConfig[pkg.difficulty || 'moderate'] || difficultyConfig.moderate;
              const maxSeats = pkg.max_seats || 15;
              const seatsBooked = pkg.seats_booked || 0;
              const seatsLeft = maxSeats - seatsBooked;
              const seatsPercent = Math.round((seatsBooked / maxSeats) * 100);

              return (
                <motion.div
                  key={pkg.id}
                  className="flex"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-full bg-[#161622]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 flex flex-col group shadow-lg">
                    {/* Image container */}
                    <div className="relative h-32 md:h-52 overflow-hidden flex-shrink-0">
                      <img
                        src={getFirstImage(pkg.images, 600)}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Price Badge */}
                      {pkg.price && (
                        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg border border-white/10 flex items-center">
                          <div className="text-right">
                            <span className="text-[10px] md:text-xs">From</span>
                            <div className="font-bold text-xs md:text-sm">₹{pkg.price.toLocaleString()}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-5 flex flex-col flex-1">
                      <h3 className="font-serif text-sm md:text-xl font-bold mb-1.5 md:mb-2 line-clamp-2 text-white">{pkg.name}</h3>
                      <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-2 mb-2 md:mb-3">{pkg.description}</p>

                      {/* Compact 2-column info grid */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 md:gap-y-1.5 mb-2 md:mb-3 text-[11px] md:text-sm">
                        {/* Location */}
                        <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                          <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary" />
                          <span className="truncate">{pkg.location || 'Uttarakhand'}</span>
                        </div>
                        {/* Difficulty */}
                        <div className="flex items-center gap-1 min-w-0">
                          <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary rotate-[-45deg]" />
                          <span className={`${diff.color} truncate`}>{diff.label}</span>
                        </div>
                        {/* Duration */}
                        <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                          <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary" />
                          <span className="truncate">{pkg.duration_days} Days</span>
                        </div>
                        {/* Date Range (if set) */}
                        {pkg.start_date && (
                          <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-primary" />
                            <span className="truncate">{formatDate(pkg.start_date)}</span>
                          </div>
                        )}
                      </div>

                      {/* Seats progress */}
                      <div className="mb-2 md:mb-4">
                        <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground mb-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            {seatsLeft} of {maxSeats} seats available
                          </span>
                          <span>{seatsPercent}% full</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1 md:h-1.5">
                          <div
                            className="bg-primary rounded-full h-1 md:h-1.5 transition-all duration-500"
                            style={{ width: `${seatsPercent}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        className="w-full pulse-glow mt-auto text-[11px] md:text-sm py-1.5 md:py-2 h-auto"
                        onClick={() => openTrekRegistration(pkg, true)}
                        disabled={seatsLeft <= 0}
                      >
                        {seatsLeft <= 0 ? 'Fully Booked' : 'Register Interest'}
                        {seatsLeft > 0 && <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-r from-card via-background to-card overflow-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-2xl text-left"
            >
              <span className="text-xs font-semibold tracking-widest text-primary uppercase block mb-3">
                Testimonials
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                What our clients say.
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground">
                Every review is a story of trust, care, and moments made unforgettable.
              </p>
            </motion.div>

            {/* Desktop Navigation Buttons */}
            <div className="hidden md:flex space-x-3 mt-6 md:mt-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('left')}
                className="w-12 h-12 rounded-full border-primary/20 hover:border-primary hover:bg-primary/10 text-foreground transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('right')}
                className="w-12 h-12 rounded-full border-primary/20 hover:border-primary hover:bg-primary/10 text-foreground transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Testimonials Scroll Container */}
          <div className="relative animate-fade-in">
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 px-1"
              style={{ scrollBehavior: 'smooth' }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-shrink-0 w-[290px] md:w-[380px] snap-start"
                >
                  <Card className="h-full bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-500 rounded-2xl p-6 md:p-8 flex flex-col justify-between group shadow-xl">
                    <div className="text-left">
                      <Quote className="w-10 h-10 text-primary/20 group-hover:text-primary/40 transition-colors duration-300 mb-4" />
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed italic mb-6">
                        "{testimonial.text}"
                      </p>
                    </div>
                    <div className="text-left border-t border-white/5 pt-4">
                      <div className="flex space-x-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="font-serif font-bold text-base text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-[10px] md:text-xs tracking-wider text-primary font-semibold uppercase mt-0.5">
                        {testimonial.trek}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div>
              <div className="font-serif text-2xl font-bold gradient-text mb-4">
                {siteSettings.siteName}
              </div>
              <p className="text-muted-foreground mb-4">
                Your gateway to authentic Pahadi experiences, connecting you with the heart and soul of the Himalayas.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" onClick={handleSmartContact}>
                  {isCopied ? (
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <Phone className="w-4 h-4 mr-2" />
                  )}
                  {isCopied ? "Copied!" : "Call Us"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${siteSettings.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>About Us</div>
                <div>Our Services</div>
                <div>Travel Packages</div>
                <div>Upcoming Treks</div>
                <div>Contact</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Destination</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Uttarakhand</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{siteSettings.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{siteSettings.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{siteSettings.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 {siteSettings.siteName}. All rights reserved. Crafted with ❤️ for mountain lovers.</p>
          </div>
        </div>
      </footer>

      {/* Trek Registration Form Dialog */}
      {selectedTrek && (
        <TrekRegistrationForm
          trek={selectedTrek}
          open={trekFormOpen}
          onClose={() => {
            setTrekFormOpen(false);
            setSelectedTrek(null);
          }}
        />
      )}
    </div>
  );
}
