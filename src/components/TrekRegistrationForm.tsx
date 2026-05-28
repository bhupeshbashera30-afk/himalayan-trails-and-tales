import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mountain, Users, Phone, Mail, MessageSquare, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RegistrationItem {
  id: string;
  name: string;
  location: string;
  start_date?: string;
  end_date?: string;
  price: number | null;
  difficulty: string;
  max_seats: number;
  seats_booked: number;
  isPackage?: boolean;
}

interface TrekRegistrationFormProps {
  trek: RegistrationItem;
  open: boolean;
  onClose: () => void;
}

export default function TrekRegistrationForm({ trek, open, onClose }: TrekRegistrationFormProps) {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    num_people: '1',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation checks
    if (!form.name.trim()) {
      toast({ title: 'Validation Error', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }
    if (!form.email.trim()) {
      toast({ title: 'Validation Error', description: 'Please enter your email address.', variant: 'destructive' });
      return;
    }
    if (!form.phone.trim()) {
      toast({ title: 'Validation Error', description: 'Please enter your phone number.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        trek_name: trek.name,
        name: form.name,
        email: form.email,
        phone: form.phone,
        num_people: parseInt(form.num_people),
        message: form.message,
        status: 'new',
      };

      if (trek.isPackage) {
        payload.package_id = trek.id;
        payload.trek_id = null;
      } else {
        payload.trek_id = trek.id;
        payload.package_id = null;
      }

      const { error } = await supabase.from('trek_registrations').insert([payload]);

      if (error) throw error;

      setShowSuccess(true);
      setForm({ name: '', email: '', phone: '', num_people: '1', message: '' });
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const seatsLeft = trek.max_seats - trek.seats_booked;
  const difficultyColor = {
    easy: 'text-green-400',
    moderate: 'text-yellow-400',
    hard: 'text-red-400',
  }[trek.difficulty] || 'text-yellow-400';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        {showSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 px-4"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary mb-3">You're Registered!</h3>
            <p className="text-muted-foreground mb-2">
              Thank you for your interest in <span className="text-foreground font-medium">{trek.name}</span>.
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              Our team will contact you within 24 hours with full details and next steps.
            </p>
            <Button onClick={handleClose} className="w-full pulse-glow">
              Close
            </Button>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{trek.isPackage ? 'Register for Package' : 'Register for Trek'}</DialogTitle>
            </DialogHeader>
 
            {/* Trek Summary */}
            <div className="glass rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mountain className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{trek.name}</div>
                  <div className="text-sm text-muted-foreground">{trek.location}</div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className={`text-xs font-medium capitalize ${difficultyColor}`}>
                      {trek.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {seatsLeft} seats left
                    </span>
                    {trek.price && (
                      <span className="text-xs font-medium text-primary">
                        ₹{Number(trek.price).toLocaleString()}/person
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reg-name" className="flex items-center gap-2 mb-1">
                  <Users className="w-3.5 h-3.5" /> Full Name *
                </Label>
                <Input
                  id="reg-name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reg-email" className="flex items-center gap-2 mb-1">
                    <Mail className="w-3.5 h-3.5" /> Email *
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-phone" className="flex items-center gap-2 mb-1">
                    <Phone className="w-3.5 h-3.5" /> Phone *
                  </Label>
                  <Input
                    id="reg-phone"
                    placeholder="+91 XXXXXXXXXX"
                    value={form.phone}
                    onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reg-people" className="flex items-center gap-2 mb-1">
                  <Users className="w-3.5 h-3.5" /> Number of People
                </Label>
                <Select
                  value={form.num_people}
                  onValueChange={(val) => setForm(p => ({ ...p, num_people: val }))}
                >
                  <SelectTrigger id="reg-people">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(seatsLeft, 10) }, (_, i) => i + 1).map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} {n === 1 ? 'Person' : 'People'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reg-message" className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Message (optional)
                </Label>
                <Textarea
                  id="reg-message"
                  placeholder="Any questions or special requirements..."
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full pulse-glow" disabled={loading}>
                {loading ? 'Submitting...' : 'Register My Interest'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
