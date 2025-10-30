import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Phone, Mail } from 'lucide-react';
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

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState<Category | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  useEffect(() => {
    fetchCategoryData();
  }, [slug]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories_2025_10_14_17_34')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!categoryData) {
        toast({
          title: "Category not found",
          description: "The requested category does not exist.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setCategory(categoryData);

      const { data: destinationsData, error: destinationsError } = await supabase
        .from('destinations_2025_10_14_17_34')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (destinationsError) throw destinationsError;
      setDestinations(destinationsData || []);
    } catch (error) {
      console.error('Error fetching category data:', error);
      toast({
        title: "Error",
        description: "Failed to load category data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (destination: Destination) => {
    toast({
      title: "Booking Request",
      description: `We'll contact you soon to arrange your visit to ${destination.name}!`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 gradient-text">
            {category.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {category.description}
          </p>
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
                    src={destination.images[0]}
                    alt={destination.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {destination.is_featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-black/50 px-2 py-1 rounded">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="font-serif text-xl">{destination.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-1 text-sm">
                    <MapPin className="w-3 h-3" />
                    <span>{destination.location}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {destination.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {destination.features.slice(0, 3).map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-auto space-y-2">
                    <div className="text-lg font-bold text-primary">
                      {destination.price_range}
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSelectedDestination(destination)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          {selectedDestination && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="font-serif text-2xl">
                                  {selectedDestination.name}
                                </DialogTitle>
                                <DialogDescription className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{selectedDestination.location}</span>
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6">
                                <img
                                  src={selectedDestination.images[0]}
                                  alt={selectedDestination.name}
                                  className="w-full h-64 object-cover rounded-lg"
                                />

                                <div>
                                  <h3 className="font-semibold mb-2">About</h3>
                                  <p className="text-muted-foreground">
                                    {selectedDestination.description}
                                  </p>
                                </div>

                                <div>
                                  <h3 className="font-semibold mb-2">Features</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedDestination.features.map((feature, i) => (
                                      <Badge key={i} variant="secondary">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-semibold mb-2">Price Range</h3>
                                  <p className="text-2xl font-bold text-primary">
                                    {selectedDestination.price_range}
                                  </p>
                                </div>

                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                  <h3 className="font-semibold">Contact Us to Book</h3>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Phone className="w-4 h-4" />
                                    <span>+91 8630113945</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Mail className="w-4 h-4" />
                                    <span>Himalayantrailesandtales@gmail.com</span>
                                  </div>
                                </div>

                                <Button
                                  className="w-full"
                                  onClick={() => {
                                    handleBooking(selectedDestination);
                                  }}
                                >
                                  Request Booking
                                </Button>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        className="flex-1"
                        onClick={() => handleBooking(destination)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {destinations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              No destinations available in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
