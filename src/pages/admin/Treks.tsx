import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Trash2, RefreshCw, Mountain, Calendar,
  Users, MapPin, X, Check, ToggleLeft, ToggleRight, ImagePlus, Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  highlights?: string;
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
  itinerary?: ItineraryItem[];
  itinerary_pdf?: string | null;
  is_upcoming: boolean;
  is_active: boolean;
  created_at: string;
}

const emptyTrek = {
  name: '', description: '', location: '', start_date: '', end_date: '',
  price: '', difficulty: 'moderate', max_seats: '20', seats_booked: '0',
  image_url: '', highlights_text: '', is_upcoming: true, is_active: true,
  itinerary: [] as ItineraryItem[],
  itinerary_pdf: '',
};

export default function Treks() {
  const { toast } = useToast();
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTrek);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    fetchTreks();

    // Subscribe to real-time changes on the "treks" table
    const treksChannel = supabase
      .channel('treks-realtime-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'treks' },
        async (payload) => {
          // Re-fetch treks when any change occurs
          const { data } = await supabase
            .from('treks')
            .select('*')
            .order('start_date', { ascending: true });
          if (data) setTreks(data as Trek[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(treksChannel);
    };
  }, []);

  const fetchTreks = async () => {
    setLoading(true);
    const { data } = await supabase.from('treks').select('*').order('start_date', { ascending: true });
    if (data) setTreks(data as Trek[]);
    setLoading(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyTrek);
    setDialogOpen(true);
  };

  const openEdit = (trek: Trek) => {
    setEditingId(trek.id);
    setForm({
      name: trek.name || '',
      description: trek.description || '',
      location: trek.location || '',
      start_date: trek.start_date || '',
      end_date: trek.end_date || '',
      price: trek.price?.toString() || '',
      difficulty: trek.difficulty || 'moderate',
      max_seats: trek.max_seats?.toString() || '20',
      seats_booked: trek.seats_booked?.toString() || '0',
      image_url: Array.isArray(trek.images) && trek.images.length > 0 ? trek.images[0] : '',
      highlights_text: Array.isArray(trek.highlights) ? trek.highlights.join('\n') : '',
      is_upcoming: trek.is_upcoming ?? true,
      is_active: trek.is_active ?? true,
      itinerary: Array.isArray(trek.itinerary) ? trek.itinerary : [],
      itinerary_pdf: trek.itinerary_pdf || '',
    });
    setDialogOpen(true);
  };

  const addItineraryDay = () => {
    setForm(prev => {
      const nextDay = (prev.itinerary?.length || 0) + 1;
      return {
        ...prev,
        itinerary: [
          ...(prev.itinerary || []),
          { day: nextDay, title: `Day ${nextDay} Trail`, description: '', highlights: '' }
        ]
      };
    });
  };

  const removeItineraryDay = (index: number) => {
    setForm(prev => ({
      ...prev,
      itinerary: (prev.itinerary || [])
        .filter((_, i) => i !== index)
        .map((item, idx) => ({ ...item, day: idx + 1 }))
    }));
  };

  const updateItineraryDay = (index: number, key: keyof ItineraryItem, value: any) => {
    setForm(prev => ({
      ...prev,
      itinerary: (prev.itinerary || []).map((item, idx) => 
        idx === index ? { ...item, [key]: value } : item
      )
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const highlights = form.highlights_text.split('\n').map(h => h.trim()).filter(Boolean);
    const images = form.image_url ? [form.image_url] : [];

    const fullPayload: any = {
      name: form.name,
      description: form.description,
      location: form.location,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      price: form.price ? parseFloat(form.price) : null,
      difficulty: form.difficulty,
      max_seats: parseInt(form.max_seats) || 20,
      seats_booked: parseInt(form.seats_booked) || 0,
      images,
      highlights,
      itinerary: form.itinerary || [],
      itinerary_pdf: form.itinerary_pdf || null,
      is_upcoming: form.is_upcoming,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('treks').update(fullPayload).eq('id', editingId);
        if (error) {
          // If database lacks new columns yet, save basic trek info without crashing
          if (error.message?.includes('schema cache') || error.message?.includes('column')) {
            const { itinerary, itinerary_pdf, ...fallbackPayload } = fullPayload;
            const { error: fbErr } = await supabase.from('treks').update(fallbackPayload).eq('id', editingId);
            if (fbErr) throw fbErr;
            toast({ title: 'Trek updated!', description: 'Note: Run Supabase SQL migration to persist custom itinerary fields.' });
          } else {
            throw error;
          }
        } else {
          toast({ title: 'Trek updated!' });
        }
      } else {
        const { error } = await supabase.from('treks').insert([fullPayload]);
        if (error) {
          if (error.message?.includes('schema cache') || error.message?.includes('column')) {
            const { itinerary, itinerary_pdf, ...fallbackPayload } = fullPayload;
            const { error: fbErr } = await supabase.from('treks').insert([fallbackPayload]);
            if (fbErr) throw fbErr;
            toast({ title: 'Trek created!', description: 'Note: Run Supabase SQL migration to persist custom itinerary fields.' });
          } else {
            throw error;
          }
        } else {
          toast({ title: 'Trek created!' });
        }
      }
      setDialogOpen(false);
      fetchTreks();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('treks').delete().eq('id', id);
    if (!error) {
      setTreks(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Trek deleted' });
    }
    setDeleteConfirm(null);
  };

  const toggleActive = async (trek: Trek) => {
    const { error } = await supabase.from('treks').update({ is_active: !trek.is_active }).eq('id', trek.id);
    if (!error) {
      setTreks(prev => prev.map(t => t.id === trek.id ? { ...t, is_active: !t.is_active } : t));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please choose an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Please upload an image under 5 MB.', variant: 'destructive' });
      return;
    }

    setUploadingImage(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = (form.name || 'trek').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '') || 'trek';
    const filePath = `${safeName}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    try {
      const { error } = await supabase.storage
        .from('trek-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('trek-images')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: 'Image uploaded', description: 'The trek image is ready.' });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Could not upload image to Supabase Storage.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast({ title: 'Invalid file', description: 'Please select a PDF document file.', variant: 'destructive' });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload a PDF under 20 MB.', variant: 'destructive' });
      return;
    }

    setUploadingPdf(true);
    const safeName = (form.name || 'trek').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '') || 'trek';
    const filePath = `itineraries/${safeName}/${Date.now()}-${crypto.randomUUID()}.pdf`;

    try {
      const { data, error } = await supabase.storage
        .from('trek-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('trek-images')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, itinerary_pdf: urlData.publicUrl }));
      toast({ title: 'PDF Uploaded!', description: 'Official PDF itinerary linked successfully.' });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Could not upload PDF itinerary.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Treks</h1>
          <p className="text-muted-foreground text-sm mt-1">{treks.length} total treks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTreks} className="border-white/10">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> Add Trek
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading treks...</div>
      ) : treks.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a24] border border-white/5 rounded-2xl">
          <Mountain className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No treks yet. Add your first trek!</p>
          <Button className="mt-4 gap-2" onClick={openNew}><Plus className="w-4 h-4" /> Add Trek</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {treks.map((trek) => {
            const seatsLeft = trek.max_seats - trek.seats_booked;
            const trekImg = Array.isArray(trek.images) && trek.images.length > 0 ? trek.images[0] : null;
            return (
              <motion.div
                key={trek.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#1a1a24] border rounded-xl overflow-hidden ${trek.is_active ? 'border-white/5' : 'border-white/5 opacity-60'}`}
              >
                <div className="flex gap-4 p-4">
                  {trekImg ? (
                    <img src={trekImg} alt={trek.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mountain className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white truncate">{trek.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" /> {trek.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          trek.difficulty === 'easy' ? 'text-green-400 bg-green-400/10' :
                          trek.difficulty === 'hard' ? 'text-red-400 bg-red-400/10' :
                          'text-yellow-400 bg-yellow-400/10'
                        }`}>
                          {trek.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      {trek.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(trek.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {seatsLeft}/{trek.max_seats} seats left
                      </span>
                      {trek.price && (
                        <span className="text-primary font-medium">₹{trek.price.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1.5" onClick={() => openEdit(trek)}>
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs gap-1.5"
                        onClick={() => toggleActive(trek)}
                      >
                        {trek.is_active ? (
                          <><ToggleRight className="w-3 h-3 text-green-400" /> Active</>
                        ) : (
                          <><ToggleLeft className="w-3 h-3 text-muted-foreground" /> Inactive</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs gap-1.5 text-red-400 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => setDeleteConfirm(trek.id)}
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Delete confirmation */}
                {deleteConfirm === trek.id && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3 flex items-center gap-3">
                    <p className="text-sm text-red-400 flex-1">Delete "{trek.name}"? This cannot be undone.</p>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDelete(trek.id)}>
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-[#13131a] border-white/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Trek' : 'Add New Trek'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div>
              <Label className="text-sm mb-1 block">Trek Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Kedarkantha Trek" required className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Trek description..." className="bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Location</Label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Sankri, Uttarakhand" className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Difficulty</Label>
                <Select value={form.difficulty} onValueChange={val => setForm(p => ({ ...p, difficulty: val }))}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Start Date</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">End Date</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Price (₹)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="8500" className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Max Seats</Label>
                <Input type="number" value={form.max_seats} onChange={e => setForm(p => ({ ...p, max_seats: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Seats Booked</Label>
                <Input type="number" value={form.seats_booked} onChange={e => setForm(p => ({ ...p, seats_booked: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1 block">Trek Image</Label>
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
                <div className="relative h-32 rounded-lg border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                  {form.image_url ? (
                    <>
                      <img src={form.image_url} alt="Trek preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImagePlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <div className="text-xs">No image</div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <input
                      id="trek-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                        e.currentTarget.value = '';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/10 gap-2"
                      disabled={uploadingImage}
                      onClick={() => document.getElementById('trek-image-upload')?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </div>
                  <Input
                    value={form.image_url}
                    onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                    placeholder="Or paste image URL..."
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>

            {/* PDF Itinerary File Upload */}
            <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02] space-y-3">
              <Label className="text-sm font-semibold text-white block">Official PDF Itinerary Document</Label>
              <p className="text-xs text-muted-foreground">Upload a PDF itinerary to display directly on the trek page</p>
              
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <input
                  id="trek-pdf-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePdfUpload(file);
                    e.currentTarget.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 gap-2 text-xs flex-shrink-0"
                  disabled={uploadingPdf}
                  onClick={() => document.getElementById('trek-pdf-upload')?.click()}
                >
                  <Upload className="w-4 h-4 text-red-400" />
                  {uploadingPdf ? 'Uploading PDF...' : 'Upload PDF Document'}
                </Button>
                <Input
                  value={form.itinerary_pdf || ''}
                  onChange={e => setForm(p => ({ ...p, itinerary_pdf: e.target.value }))}
                  placeholder="Or paste PDF Document URL..."
                  className="bg-white/5 border-white/10 text-xs flex-1"
                />
              </div>

              {form.itinerary_pdf && (
                <div className="text-xs text-green-400 flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5" /> PDF Linked: <span className="underline truncate max-w-xs">{form.itinerary_pdf}</span>
                </div>
              )}
            </div>
            {/* Trip Itinerary Builder */}
            <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold text-white">Trip Itinerary (Day-by-Day)</Label>
                  <p className="text-xs text-muted-foreground">Add day titles & descriptions for the itinerary page</p>
                </div>
                <Button type="button" size="sm" variant="outline" className="border-white/10 gap-1 text-xs" onClick={addItineraryDay}>
                  <Plus className="w-3.5 h-3.5" /> Add Day
                </Button>
              </div>

              {(!form.itinerary || form.itinerary.length === 0) ? (
                <div className="text-xs text-center py-4 text-muted-foreground border border-dashed border-white/10 rounded-lg">
                  No custom itinerary days added yet. Click "Add Day" above to customize the day-by-day itinerary.
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {form.itinerary.map((item, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-primary">Day {item.day || idx + 1}</span>
                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-red-400 hover:bg-red-400/10" onClick={() => removeItineraryDay(idx)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Day Title (e.g. Arrival & Base Camp)"
                        value={item.title || ''}
                        onChange={e => updateItineraryDay(idx, 'title', e.target.value)}
                        className="bg-black/20 border-white/10 h-8 text-xs"
                      />
                      <Textarea
                        placeholder="Day Description..."
                        value={item.description || ''}
                        onChange={e => updateItineraryDay(idx, 'description', e.target.value)}
                        rows={2}
                        className="bg-black/20 border-white/10 text-xs"
                      />
                      <Input
                        placeholder="Key Highlights (optional)..."
                        value={item.highlights || ''}
                        onChange={e => updateItineraryDay(idx, 'highlights', e.target.value)}
                        className="bg-black/20 border-white/10 h-7 text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 block">Highlights (one per line)</Label>
              <Textarea value={form.highlights_text} onChange={e => setForm(p => ({ ...p, highlights_text: e.target.value }))} rows={3} placeholder="Summit views at 12,500 ft&#10;Snow-covered trails&#10;Camping under stars" className="bg-white/5 border-white/10" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                <span className="text-sm">Active (visible on website)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_upcoming} onChange={e => setForm(p => ({ ...p, is_upcoming: e.target.checked }))} className="rounded" />
                <span className="text-sm">Upcoming Trek</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={saving || uploadingImage}>
                {saving ? 'Saving...' : (editingId ? 'Update Trek' : 'Add Trek')}
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
