import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Pencil, Plus, RefreshCw, Star, Trash2, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  trek: string;
  rating: number;
  created_at: string;
}

const emptyTestimonial = {
  name: '',
  text: '',
  trek: '',
  rating: '5',
};

export default function Testimonials() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTestimonial);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials((data || []) as Testimonial[]);
    } catch (err: any) {
      toast({
        title: 'Error loading testimonials',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyTestimonial);
    setDeleteConfirm(null);
    setDialogOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name || '',
      text: testimonial.text || '',
      trek: testimonial.trek || '',
      rating: String(testimonial.rating ?? 5),
    });
    setDeleteConfirm(null);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.text || !form.trek) {
      toast({ title: 'Validation error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      text: form.text,
      trek: form.trek,
      rating: parseInt(form.rating) || 5,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('testimonials')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Testimonial updated successfully' });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([payload]);
        if (error) throw error;
        toast({ title: 'Testimonial added successfully' });
      }

      setDialogOpen(false);
      fetchTestimonials();
    } catch (err: any) {
      toast({ title: 'Error saving testimonial', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTestimonials(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Testimonial deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error deleting testimonial', description: err.message, variant: 'destructive' });
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-serif">Manage Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, edit, and delete reviews displayed in the Testimonials carousel on the home page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTestimonials} className="border-white/10 w-fit">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={openNew} className="gap-2 w-fit">
            <Plus className="w-4 h-4" /> Add Review
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading testimonials...</div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a24] border border-white/5 rounded-xl">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No testimonials found. Add your first client review!</p>
          <Button className="mt-4 gap-2" onClick={openNew}>
            <Plus className="w-4 h-4" /> Add Review
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a24] border border-white/5 rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] md:text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    {item.trek}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed mb-6">
                  "{item.text}"
                </p>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="flex items-center justify-between">
                  <div className="font-serif font-bold text-white text-base">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(item)}>
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-white" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-400 hover:bg-red-400/10" onClick={() => setDeleteConfirm(item.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {deleteConfirm === item.id && (
                  <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex flex-col gap-2">
                    <p className="text-xs text-red-400">Delete this review by {item.name}?</p>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="destructive" className="h-7 text-xs px-3" onClick={() => handleDelete(item.id)}>Delete</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-3 border border-white/10" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-[#13131a] border-white/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div>
              <Label className="text-sm mb-1 block">Client Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Priya Sharma" className="bg-white/5 border-white/10" />
            </div>

            <div>
              <Label className="text-sm mb-1 block">Trek / Category *</Label>
              <Input value={form.trek} onChange={e => setForm(p => ({ ...p, trek: e.target.value }))} required placeholder="e.g. VALLEY OF FLOWERS" className="bg-white/5 border-white/10" />
            </div>

            <div>
              <Label className="text-sm mb-1 block">Rating *</Label>
              <Select value={form.rating} onValueChange={val => setForm(p => ({ ...p, rating: val }))}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select Rating" />
                </SelectTrigger>
                <SelectContent className="bg-[#000000] border-white/10">
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-1 block">Review Text *</Label>
              <Textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} required rows={4} placeholder="Write the testimonial review details here..." className="bg-white/5 border-white/10" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Saving...' : (editingId ? 'Update Testimonial' : 'Add Testimonial')}
              </Button>
              <Button type="button" variant="outline" className="border-white/10" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
