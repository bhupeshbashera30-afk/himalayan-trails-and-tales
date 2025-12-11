import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Calendar, Users, MapPin, Mountain, Utensils, Bed, Heart, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

const iconMap: { [key: string]: any } = {
  utensils: Utensils,
  bed: Bed,
  mountain: Mountain,
  heart: Heart,
  car: Car,
};

// Helper function to safely get the first image from destination
const getFirstImage = (images: string | string[] | null): string => {
  if (!images) return '';
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '';
    } catch {
      return images;
    }
  }
  return Array.isArray(images) && images.length > 0 ? images[0] : '';
};


export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    travel_dates: '',
    group_size: 1,
    special_requirements: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategoryData();
  }, [slug]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const { data: categoryData } = await supabase
        .from('categories_2025_10_14_17_34')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (categoryData) {
        setCategory(categoryData);
        const { data: destinationData } = await supabase
          .from('destinations_2025_10_14_17_34')
          .select('*')
          .eq('category_id', categoryData.id);

        if (destinationData) {
          setDestinations(destinationData);
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      toast({
        title: "Error",
        description: "Failed to load category data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('bookings_2025_10_14_17_34')
        .insert([{
          ...bookingForm,
          destination_id: selectedDestination?.id,
          category_id: category?.id
        }]);

      if (error) throw error;

      toast({
        title: "Booking Request Sent!",
        description: "We'll contact you shortly to confirm your booking.",
      });

      setBookingForm({
        name: '',
        email: '',
        phone: '',
        travel_dates: '',
        group_size: 1,
        special_requirements: ''
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-card">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Mountain;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card pt-20">
      <div className="container mx-auto px-6 py-8">
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-primary hover:text-primary-glow transition-colors mb-8"
          whileHover={{ x: -5 }}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold gradient-text">
                {category.name}
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                {category.description}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden glass h-full flex flex-col">
                <div className="relative overflow-hidden">
                  <img
                    src={getFirstImage(destination.images)}
                    alt={destination.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{destination.rating}</span>
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="font-serif text-2xl">{destination.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.location}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground mb-4 flex-1">
                    {destination.description}
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {destination.features.slice(0, 3).map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {destination.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{destination.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-lg font-bold text-primary">
                      {destination.price_range}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full group-hover:bg-primary-glow transition-colors"
                          onClick={() => setSelectedDestination(destination)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl">Book {destination.name}</DialogTitle>
                          <DialogDescription>
                            Fill in your details to book this amazing experience
                          </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleBooking} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Full Name *</label>
                              <input
                                type="text"
                                className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background"
                                value={bookingForm.name}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email *</label>
                              <input
                                type="email"
                                className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background"
                                value={bookingForm.email}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Phone Number</label>
                              <input
                                type="tel"
                                className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background"
                                value={bookingForm.phone}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Travel Dates *</label>
                              <input
                                type="text"
                                placeholder="e.g., Dec 15-20, 2024"
                                className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background"
                                value={bookingForm.travel_dates}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, travel_dates: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Group Size</label>
                            <select
                              className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background"
                              value={bookingForm.group_size}
                              onChange={(e) => setBookingForm(prev => ({ ...prev, group_size: parseInt(e.target.value) }))}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>
                                  {num} {num === 1 ? 'Person' : 'People'}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Special Requirements</label>
                            <textarea
                              className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background"
                              rows={3}
                              placeholder="Any special requests or requirements..."
                              value={bookingForm.special_requirements}
                              onChange={(e) => setBookingForm(prev => ({ ...prev, special_requirements: e.target.value }))}
                            />
                          </div>

                          <Button type="submit" className="w-full">
                            Confirm Booking
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {destinations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No destinations found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
