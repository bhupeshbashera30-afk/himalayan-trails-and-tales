import React, { useState, useEffect } from 'react';
import { getFirstImage } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Copy, Check, ChevronDown, Mountain, Utensils, Bed, Heart,
  Star, Calendar, Users, Mail, MapPin, ArrowRight, Clock, AlertTriangle
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

export default function Index() {
  const [isCopied, setIsCopied] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const phoneNumber = "+918630113945";

  const handleSmartContact = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setShowMobileMenu(true);
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phoneNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    setShowMobileMenu(false);
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [treks, setTreks] = useState<Trek[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState<Trek | null>(null);
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
    return () => window.removeEventListener('scroll', handleScroll);
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

  const openTrekRegistration = (trek: Trek) => {
    setSelectedTrek(trek);
    setTrekFormOpen(true);
  };

  // Get first destination image for a category (for mobile grid)
  const getCategoryImage = (categoryId: string) => {
    const dests = getDestinationsByCategory(categoryId);
    if (dests.length > 0) {
      const img = getFirstImage(dests[0].images);
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
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="font-serif text-2xl font-bold gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Himalayan Trails &amp; Tales
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
                                  src={getFirstImage(destination.images)}
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
                <Button className="pulse-glow hidden md:inline-flex">Plan Your Journey</Button>
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            className="font-serif text-6xl md:text-8xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover Pahadi Spirit
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
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
                    <Button size="lg" className="w-full gap-2" onClick={() => window.location.href = `tel:${phoneNumber}`}>
                      <Phone className="w-4 h-4" />
                      Call Now ({phoneNumber})
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
              className="md:hidden mt-16 w-full max-w-sm mx-auto pb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6 font-semibold">Explore Categories</p>
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
      <section className="py-20 px-6 bg-gradient-to-r from-card via-background to-card">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
              <Mountain className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Upcoming Adventures</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Upcoming Treks
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <div className="glass rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative overflow-hidden h-56">
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
                        <div className="absolute top-4 left-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${diff.color} ${diff.bg} backdrop-blur-sm border border-white/10`}>
                            {diff.label}
                          </span>
                        </div>

                        {/* Seats indicator */}
                        {seatsLeft <= 5 && seatsLeft > 0 && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-orange-400 bg-orange-400/20 backdrop-blur-sm border border-orange-400/20">
                              <AlertTriangle className="w-3 h-3" />
                              Only {seatsLeft} left!
                            </span>
                          </div>
                        )}

                        {/* Price overlay */}
                        {trek.price && (
                          <div className="absolute bottom-4 right-4">
                            <div className="bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg">
                              <span className="text-xs">From</span>
                              <div className="font-bold text-sm">₹{trek.price.toLocaleString()}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-serif text-xl font-bold mb-1">{trek.name}</h3>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{trek.location}</span>
                        </div>

                        {/* Dates */}
                        {trek.start_date && (
                          <div className="flex items-center gap-1.5 text-sm mb-3">
                            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="text-foreground font-medium">
                              {formatDate(trek.start_date)}
                              {trek.end_date && ` — ${formatDate(trek.end_date)}`}
                            </span>
                          </div>
                        )}

                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                          {trek.description}
                        </p>

                        {/* Highlights */}
                        {Array.isArray(trek.highlights) && trek.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {trek.highlights.slice(0, 2).map((h: string, i: number) => (
                              <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Seats progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {seatsLeft} of {trek.max_seats} seats available
                            </span>
                            <span>{seatsPercent}% full</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div
                              className="bg-primary rounded-full h-1.5 transition-all duration-500"
                              style={{ width: `${seatsPercent}%` }}
                            />
                          </div>
                        </div>

                        <Button
                          className="w-full pulse-glow mt-auto"
                          onClick={() => openTrekRegistration(trek)}
                          disabled={seatsLeft <= 0}
                        >
                          {seatsLeft <= 0 ? 'Fully Booked' : 'Register Interest'}
                          {seatsLeft > 0 && <ArrowRight className="w-4 h-4 ml-2" />}
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
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Curated Experiences
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpicked packages that showcase the best of Pahadi culture, adventure, and serenity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-2xl transition-all duration-500 overflow-glass">
                  <div className="relative overflow-hidden">
                    <img
                      src={getFirstImage(pkg.images)}
                      alt={pkg.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground">
                        {pkg.duration_days} Days
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="font-serif text-xl">{pkg.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">{pkg.price ? `₹${pkg.price.toLocaleString()}` : ""}</span>
                        <span className="text-sm text-muted-foreground">per person</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Includes:</div>
                        <div className="flex flex-wrap gap-1">
                          {pkg.inclusions.slice(0, 3).map((inclusion, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{inclusion}</Badge>
                          ))}
                          {pkg.inclusions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{pkg.inclusions.length - 3} more</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Showcase - Desktop only (mobile is in Hero) */}
      <section className="py-20 px-6 bg-gradient-to-r from-card via-background to-card">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Explore Every Facet
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From authentic flavors to thrilling adventures, discover what makes the Pahadi experience truly special
            </p>
          </motion.div>

          {/* Desktop: icon-based cards */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Mountain;
              const categoryDestinations = getDestinationsByCategory(category.id);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="group hover:shadow-2xl transition-all duration-500 glass h-full">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="font-serif text-xl">{category.name}</CardTitle>
                      <CardDescription className="text-sm">{category.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        {categoryDestinations.slice(0, 3).map((destination) => (
                          <div key={destination.id} className="flex items-center space-x-3">
                            <img
                              src={getFirstImage(destination.images)}
                              alt={destination.name}
                              decoding="async"
                              loading="lazy"
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover bg-white/10 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{destination.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{destination.location}</div>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{destination.rating}</span>
                            </div>
                          </div>
                        ))}

                        <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate(`/category/${category.slug}`)}>
                          Explore {category.name}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile: image grid (visible only on mobile, categories also shown in Hero) */}
          <div className="md:hidden grid grid-cols-2 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => navigate(`/category/${category.slug}`)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
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
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="font-serif text-2xl font-bold gradient-text mb-4">
                Himalayan Trails &amp; Tales
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
                <Button variant="outline" size="sm" onClick={() => window.location.href = "mailto:himalayantrailtales@gmail.com"}>
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
                  <span>Haldwani, Uttarakhand</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 8630113945</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>himalayantrailtales@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Himalayan Trails &amp; Tales. All rights reserved. Crafted with ❤️ for mountain lovers.</p>
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
