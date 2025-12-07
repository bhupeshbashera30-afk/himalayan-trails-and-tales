import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mountain, Utensils, Bed, Heart, Star, Calendar, Users, Phone, Mail, MapPin } from 'lucide-react';
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
  price_range: string;
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
  price: number;
  destinations: string[];
  inclusions: string[];
  exclusions: string[];
  images: string[];
  is_featured: boolean;
}

const iconMap = {
  utensils: Utensils,
  bed: Bed,
  mountain: Mountain,
  heart: Heart,
};

export default function Index() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
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
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    travel_dates: '',
    group_size: 1,
    budget_range: '',
    package_id: '',
    special_requirements: ''
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('bookings_2025_10_14_17_34').insert([bookingForm]);
      toast({
        title: "Booking Submitted!",
        description: "We'll confirm your booking within 24 hours."
      });
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        travel_dates: '',
        group_size: 1,
        budget_range: '',
        package_id: '',
        special_requirements: ''
      });
      setBookingDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit booking."
      });
    }
  };

  useEffect(() => {
    fetchData();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('bookings_2025_10_14_17_34').insert([<Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 glass">
                <Phone className="w-5 h-5 mr-2" />
                Speak with Expert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact Our Experts</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input placeholder="Name" value={contactForm.name} onChange={(e) => setContactForm(prev => ({...prev, name: e.target.value}))} required />
                <Input placeholder="Email" type="email" value={contactForm.email} onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))} required />
                <Input placeholder="Phone" value={contactForm.phone} onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))} />
                <Textarea placeholder="Your question..." value={contactForm.special_requirements} onChange={(e) => setContactForm(prev => ({...prev, special_requirements: e.target.value}))} rows={4} />
                <Button type="submit" className="w-full">Send</Button>
              </form>
            </DialogContent>
          </Dialog>
]);
      toast({ title: "Booking Submitted!", description: "We'll confirm within 24 hours." });
      setBookingForm({ name: '', email: '', phone: '', travel_dates: '', group_size: 1, budget_range: '', package_id: '', special_requirements: '' });
      setBookingDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit booking.", variant: "destructive" });
    }
  };

  const handleShowContact = (type: string) => {
    if (type === 'email') {
      navigator.clipboard.writeText('Himalayantrailesandtales@gmail.com');
      toast({ title: "Email Copied!", description: "Himalayantrailesandtales@gmail.com" });
    } else if (type === 'phone') {
      navigator.clipboard.writeText('+91 8630113945');
      toast({ title: "Phone Copied!", description: "+91 8630113945" });
    }
  };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, destinationsRes, packagesRes] = await Promise.all([
        supabase.from('categories_2025_10_14_17_34').select('*'),
        supabase.from('destinations_2025_10_14_17_34').select('*'),
        supabase.from('packages_2025_10_14_17_34').select('*').eq('is_featured', true)
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (destinationsRes.data) setDestinations(destinationsRes.data);
      if (packagesRes.data) setPackages(packagesRes.data);
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

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours to discuss your travel plans.",
      });

      setContactForm({
        name: '',
        email: '',
        phone: '',
        travel_dates: '',
        group_size: 1,
        budget_range: '',
        service_interests: [],
        special_requirements: ''
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
              Himalayan Trails & Tales
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
                          className="absolute top-full left-0 mt-2 w-80 glass rounded-xl p-4 shadow-2xl"
                        >
                          <div className="space-y-3">
                            <div className="text-sm text-muted-foreground mb-3">
                              {category.description}
                            </div>
                            {getDestinationsByCategory(category.id).slice(0, 3).map((destination) => (
                              <div key={destination.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <img 
                                  src={destination.images[0]} 
                                  alt={destination.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{destination.name}</div>
                                  <div className="text-xs text-muted-foreground">{destination.location}</div>
                                  <div className="text-xs text-primary font-medium">{destination.price_range}</div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{destination.rating}</span>
                                </div>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full mt-2">
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
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="travel_dates">Preferred Travel Dates</Label>
                      <Input
                        id="travel_dates"
                        placeholder="e.g., March 15-20, 2024"
                        value={contactForm.travel_dates}
                        onChange={(e) => setContactForm(prev => ({ ...prev, travel_dates: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="group_size">Group Size</Label>
                      <Select value={contactForm.group_size.toString()} onValueChange={(value) => setContactForm(prev => ({ ...prev, group_size: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
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

                  <Button type="submit" className="w-full">
                    Send My Travel Request
                  </Button>
                </form>
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
            Discover the
            <br />
            <span className="float">Pahadi Spirit</span>
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
            <Button size="lg" className="text-lg px-8 py-6 pulse-glow">
              <Calendar className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 glass"
           onClick={() => {
                  navigator.clipboard.writeText('+91 8630113945');
                  toast({ title: "Phone Copied!", description: "+91 8630113945" });
                }}>
            <Phone className="w-5 h-5 mr-2" />
            Speak with Expert
            </Button>
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary-glow/20 rounded-full blur-xl float" style={{ animationDelay: '4s' }} />
      </section>

      {/* About Section - Himalayas & Uttarakhand */}
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
              The Majestic Himalayas
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the crown jewel of India - Uttarakhand, where ancient traditions meet breathtaking landscapes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" 
                alt="Himalayan Peaks"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="font-serif text-3xl font-bold">The Roof of the World</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Himalayas, meaning "abode of snow" in Sanskrit, stretch across five countries and house the world's highest peaks. 
                This magnificent mountain range is not just a geographical wonder but a spiritual sanctuary that has inspired countless souls 
                for millennia.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From the towering peaks of Nanda Devi to the serene valleys of Garhwal, the Himalayas offer an unparalleled experience 
                of natural beauty, adventure, and spiritual awakening. Every trail tells a story, every peak holds a legend.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-primary">7,817m</div>
                  <div className="text-sm text-muted-foreground">Nanda Devi Peak</div>
                </div>
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-primary">2,400km</div>
                  <div className="text-sm text-muted-foreground">Mountain Range Length</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Uttarakhand Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6 order-2 lg:order-1"
            >
              <h3 className="font-serif text-3xl font-bold">Uttarakhand - Dev Bhoomi</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Known as "Dev Bhoomi" (Land of Gods), Uttarakhand is the spiritual heart of India. This enchanting state is home to 
                the sacred Char Dham pilgrimage sites, pristine hill stations, and some of the most spectacular trekking routes in the world.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From the yoga capital Rishikesh to the queen of hills Mussoorie, from the spiritual Haridwar to the adventure hub 
                Auli, Uttarakhand offers diverse experiences that cater to every traveler's soul.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Sacred Pilgrimage Sites</h4>
                    <p className="text-sm text-muted-foreground">Kedarnath, Badrinath, Gangotri, and Yamunotri - the revered Char Dham</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Adventure Paradise</h4>
                    <p className="text-sm text-muted-foreground">World-class trekking, river rafting, skiing, and mountaineering</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Rich Cultural Heritage</h4>
                    <p className="text-sm text-muted-foreground">Ancient temples, traditional festivals, and warm Pahadi hospitality</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Biodiversity Hotspot</h4>
                    <p className="text-sm text-muted-foreground">Home to rare flora, fauna, and pristine national parks</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="/images/kedarnath_temple_1.jpeg"
                  alt="Kedarnath Temple"
                  className="w-full h-48 object-cover rounded-xl shadow-lg"
                />
                <img 
                  src="/images/nanda_devi_peak_20251206_153656.png"
                  alt="Nanda Devi Peak"
                  className="w-full h-48 object-cover rounded-xl shadow-lg mt-8"
                />
                <img 
                  src="/images/river_rafting_1.jpeg" 
                  alt="River Rafting in Rishikesh"
                  className="w-full h-48 object-cover rounded-xl shadow-lg -mt-8"
                />
                <img 
                  src="/images/paragliding_1.jpeg" 
                  alt="Paragliding Adventure"
                  className="w-full h-48 object-cover rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>

          {/* Historical Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h3 className="font-serif text-3xl font-bold mb-4 gradient-text">Rich Historical Heritage</h3>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Uttarakhand's history spans millennia, from ancient Vedic civilizations to modern statehood
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="glass p-6 rounded-xl">
                <h4 className="font-serif text-xl font-bold mb-3">Ancient Era (Vedic Period)</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Known as "Kedarkhand" and "Manaskhand" in ancient texts, this region finds mention in the Skanda Purana and Mahabharata. 
                  The Pandavas are believed to have traveled through these mountains on their final journey to heaven.
                </p>
              </div>

              <div className="glass p-6 rounded-xl">
                <h4 className="font-serif text-xl font-bold mb-3">Medieval Period (8th-18th Century)</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The Katyuri dynasty (7th-11th century) established the first major kingdom. Later, the Chand dynasty ruled Kumaon 
                  while the Panwar dynasty controlled Garhwal, creating a rich tapestry of hill culture and architecture.
                </p>
              </div>

              <div className="glass p-6 rounded-xl">
                <h4 className="font-serif text-xl font-bold mb-3">British Era (1815-1947)</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  After the Anglo-Nepalese War, the British established hill stations like Mussoorie, Nainital, and Almora. 
                  The region became a summer retreat for British officials and contributed significantly to India's freedom struggle.
                </p>
              </div>

              <div className="glass p-6 rounded-xl">
                <h4 className="font-serif text-xl font-bold mb-3">Modern Uttarakhand (2000-Present)</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Carved out from Uttar Pradesh on November 9, 2000, Uttarakhand became India's 27th state. The movement for statehood 
                  was driven by the unique cultural identity and development needs of the hill regions.
                </p>
              </div>

              <div className="glass p-6 rounded-xl">
                <h4 className="font-serif text-xl font-bold mb-3">Cultural Legacy</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Home to 108 ancient temples, traditional folk dances like Langvir Nritya, and festivals such as Nanda Devi Raj Jat. 
                  The region preserves age-old traditions of wood carving, woolen crafts, and organic farming practices.
                </p>
              </div>

              <div className="glass p-6 rounded-xl">
                <h4 className="font-serif text-xl font-bold mb-3">Spiritual Significance</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Birthplace of the Ganges and Yamuna rivers, home to ancient ashrams where sages meditated. Rishikesh is known as the 
                  "Yoga Capital of the World," attracting spiritual seekers from across the globe for centuries.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Statistics Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <div className="text-center p-6 glass rounded-xl">
              <div className="text-3xl font-bold text-primary mb-2">13</div>
              <div className="text-sm text-muted-foreground">Districts</div>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="text-3xl font-bold text-primary mb-2">53,483</div>
              <div className="text-sm text-muted-foreground">Sq Km Area</div>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="text-3xl font-bold text-primary mb-2">12</div>
              <div className="text-sm text-muted-foreground">National Parks</div>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="text-3xl font-bold text-primary mb-2">7,817m</div>
              <div className="text-sm text-muted-foreground">Nanda Devi Peak</div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <h3 className="font-serif text-2xl font-bold mb-4">Ready to Explore the Divine Land?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join us on an unforgettable journey through the mystical Himalayas and experience the magic of Uttarakhand's 
              pristine beauty, rich culture, and spiritual essence.
            </p>
            <Button size="lg" className="pulse-glow">
              <Mountain className="w-5 h-5 mr-2" />
              Start Your Himalayan Adventure
            </Button>
          </motion.div>
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
                <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden glass">
                  <div className="relative overflow-hidden">
                    <img 
                      src={pkg.images[0]} 
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
                        <span className="text-2xl font-bold text-primary">₹{pkg.price.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">per person</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Includes:</div>
                        <div className="flex flex-wrap gap-1">
                          {pkg.inclusions.slice(0, 3).map((inclusion, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {inclusion}
                            </Badge>
                          ))}
                          {pkg.inclusions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{pkg.inclusions.length - 3} more
                            </Badge>
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

      {/* Categories Showcase */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {categoryDestinations.slice(0, 4).map((destination) => (
                          <div key={destination.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <img 
                              src={destination.images[0]} 
                              alt={destination.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{destination.name}</div>
                              <div className="text-xs text-muted-foreground">{destination.location}</div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{destination.rating}</span>
                            </div>
                          </div>
                        ))}
                        
                        <Button variant="outline" size="sm" className="w-full mt-4">
                          Explore {category.name}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="font-serif text-2xl font-bold gradient-text mb-4">
                Himalayan Trails & Tails
              </div>
              <p className="text-muted-foreground mb-4">
                Your gateway to authentic Pahadi experiences, connecting you with the heart and soul of the Himalayas.
              </p>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText('+91 8630113945');
                    toast({ title: "Phone Copied!", description: "+91 8630113945" });
                  }}
                >     
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                  </Button>

                <Button variant="outline" size="sm"
                  onClick={() => window.location.href = "mailto:Himalayantrailesandtales@gmail.com"}>
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
                <div>Contact</div>
              </div>
            </div>
            
          
            
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Haldwani , Uttarakhand</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 8630113945</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Himalayantrailesandtales@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Himalayan Trails & Tales. All rights reserved. Crafted with ❤️ for mountain lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}