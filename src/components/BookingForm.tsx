import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

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
}

interface BookingFormProps {
  selectedPackage: Package;
  onClose: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ selectedPackage, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    guest_name: user?.user_metadata?.full_name || '',
    guest_email: user?.email || '',
    guest_phone: '',
    travel_date: '',
    group_size: 1,
    budget_range: '',
    special_requests: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return selectedPackage.price * bookingData.group_size;
  };

  const handleSubmitBooking = async () => {
    try {
      const { error } = await supabase
        .from('bookings_2025_10_14_17_34')
        .insert([{
          user_id: user?.id || null,
          package_id: selectedPackage.id,
          ...bookingData,
          total_amount: calculateTotal(),
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Booking Submitted!",
        description: "We'll contact you within 24 hours to confirm your booking details.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNum ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">
                {step === 1 && "Travel Details"}
                {step === 2 && "Personal Information"}
                {step === 3 && "Review & Confirm"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "When would you like to travel?"}
                {step === 2 && "Tell us about yourself"}
                {step === 3 && "Review your booking details"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="travel_date">Preferred Travel Date</Label>
                      <Input
                        id="travel_date"
                        type="date"
                        value={bookingData.travel_date}
                        onChange={(e) => handleInputChange('travel_date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="group_size">Group Size</Label>
                      <Select 
                        value={bookingData.group_size.toString()} 
                        onValueChange={(value) => handleInputChange('group_size', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'Person' : 'People'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budget_range">Budget Preference</Label>
                    <Select 
                      value={bookingData.budget_range} 
                      onValueChange={(value) => handleInputChange('budget_range', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Package</SelectItem>
                        <SelectItem value="premium">Premium Upgrade</SelectItem>
                        <SelectItem value="luxury">Luxury Experience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="special_requests">Special Requests</Label>
                    <Textarea
                      id="special_requests"
                      placeholder="Any dietary restrictions, accessibility needs, or special occasions..."
                      value={bookingData.special_requests}
                      onChange={(e) => handleInputChange('special_requests', e.target.value)}
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guest_name">Full Name</Label>
                      <Input
                        id="guest_name"
                        value={bookingData.guest_name}
                        onChange={(e) => handleInputChange('guest_name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="guest_email">Email Address</Label>
                      <Input
                        id="guest_email"
                        type="email"
                        value={bookingData.guest_email}
                        onChange={(e) => handleInputChange('guest_email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guest_phone">Phone Number</Label>
                    <Input
                      id="guest_phone"
                      value={bookingData.guest_phone}
                      onChange={(e) => handleInputChange('guest_phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="font-semibold">Booking Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Travel Date:</span>
                        <div className="font-medium">{bookingData.travel_date}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Group Size:</span>
                        <div className="font-medium">{bookingData.group_size} {bookingData.group_size === 1 ? 'Person' : 'People'}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact:</span>
                        <div className="font-medium">{bookingData.guest_name}</div>
                        <div className="text-xs text-muted-foreground">{bookingData.guest_email}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <div className="font-medium">{bookingData.guest_phone}</div>
                      </div>
                    </div>

                    {bookingData.special_requests && (
                      <div>
                        <span className="text-muted-foreground text-sm">Special Requests:</span>
                        <div className="text-sm mt-1 p-2 bg-muted rounded">{bookingData.special_requests}</div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Package Price (per person)</span>
                      <span>₹{selectedPackage.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of People</span>
                      <span>×{bookingData.group_size}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                {step < 3 ? (
                  <Button onClick={nextStep}>
                    Next Step
                  </Button>
                ) : (
                  <Button onClick={handleSubmitBooking} className="pulse-glow">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="font-serif">{selectedPackage.name}</CardTitle>
              <CardDescription>{selectedPackage.duration_days} Days Experience</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <img 
                src={selectedPackage.images[0]} 
                alt={selectedPackage.name}
                className="w-full h-32 object-cover rounded-lg"
              />

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Includes:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedPackage.inclusions.map((inclusion, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {inclusion}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Price</span>
                    <span>₹{selectedPackage.price.toLocaleString()}</span>
                  </div>
                  {step > 0 && bookingData.group_size > 1 && (
                    <div className="flex justify-between text-sm">
                      <span>× {bookingData.group_size} people</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};