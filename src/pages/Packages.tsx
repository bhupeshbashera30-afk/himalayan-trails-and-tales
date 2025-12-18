import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface Package {
  id: string;
  name: string;
  description: string;
  location: string;
  price_range: string | null;
  images: string[];
  features: string[];
  category_id: string;
  rating: number;
  duration_days: number;
  difficulty: string;
}

export default function Packages() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPackages(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to load packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">All Packages</h1>
          <p className="text-lg text-muted-foreground">
            Explore all our curated Himalayan adventure packages
          </p>
        </motion.div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-8">
            {error}
          </div>
        )}

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No packages available</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/package/${pkg.id}`)}>
                  {pkg.images && pkg.images.length > 0 && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={pkg.images[0]} 
                        alt={pkg.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4" />
                      {pkg.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pkg.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {pkg.features && pkg.features.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {pkg.duration_days}d
                        </span>
                      </div>
                      {pkg.price_range && (
                        <span className="font-semibold text-primary">
                          {pkg.price_range}
                        </span>
                      )}
                    </div>

                    <Button className="w-full mt-4" onClick={() => navigate(`/package/${pkg.id}`)}>View Details</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
