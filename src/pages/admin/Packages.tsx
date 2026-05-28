import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass, Pencil, Plus, RefreshCw, Star, Trash2, Upload, X, ImagePlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Package {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number | null;
  destinations: string[];
  inclusions: string[];
  exclusions: string[];
  images: string[];
  is_featured: boolean;
  is_custom: boolean;
  created_at: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  difficulty?: string;
  max_seats?: number;
  seats_booked?: number;
}

const emptyPackage = {
  name: '',
  description: '',
  duration_days: '5',
  price: '',
  destinations_text: '',
  inclusions_text: '',
  exclusions_text: '',
  image_url: '',
  is_featured: true,
  is_custom: false,
  start_date: '',
  end_date: '',
  location: 'Uttarakhand, India',
  difficulty: 'moderate',
  max_seats: '15',
  seats_booked: '0',
};

export default function Packages() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPackage);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages_2025_10_14_17_34')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages((data || []) as Package[]);
    } catch (err: any) {
      toast({
        title: 'Error loading packages',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyPackage);
    setDeleteConfirm(null);
    setDialogOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name || '',
      description: pkg.description || '',
      duration_days: String(pkg.duration_days ?? 5),
      price: pkg.price ? String(pkg.price) : '',
      destinations_text: Array.isArray(pkg.destinations) ? pkg.destinations.join('\n') : '',
      inclusions_text: Array.isArray(pkg.inclusions) ? pkg.inclusions.join('\n') : '',
      exclusions_text: Array.isArray(pkg.exclusions) ? pkg.exclusions.join('\n') : '',
      image_url: Array.isArray(pkg.images) && pkg.images.length > 0 ? pkg.images[0] : '',
      is_featured: Boolean(pkg.is_featured),
      is_custom: Boolean(pkg.is_custom),
      start_date: pkg.start_date || '',
      end_date: pkg.end_date || '',
      location: pkg.location || '',
      difficulty: pkg.difficulty || 'moderate',
      max_seats: pkg.max_seats?.toString() || '15',
      seats_booked: pkg.seats_booked?.toString() || '0',
    });
    setDeleteConfirm(null);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.duration_days) {
      toast({ title: 'Validation error', description: 'Name and Duration are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      duration_days: parseInt(form.duration_days) || 5,
      price: form.price ? parseFloat(form.price) : null,
      destinations: form.destinations_text.split('\n').map(d => d.trim()).filter(Boolean),
      inclusions: form.inclusions_text.split('\n').map(i => i.trim()).filter(Boolean),
      exclusions: form.exclusions_text.split('\n').map(ex => ex.trim()).filter(Boolean),
      images: form.image_url ? [form.image_url] : [],
      is_featured: form.is_featured,
      is_custom: form.is_custom,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      location: form.location,
      difficulty: form.difficulty,
      max_seats: parseInt(form.max_seats) || 15,
      seats_booked: parseInt(form.seats_booked) || 0,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('packages_2025_10_14_17_34')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Package updated successfully' });
      } else {
        const { error } = await supabase
          .from('packages_2025_10_14_17_34')
          .insert([payload]);
        if (error) throw error;
        toast({ title: 'Package added successfully' });
      }

      setDialogOpen(false);
      fetchPackages();
    } catch (err: any) {
      toast({ title: 'Error saving package', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('packages_2025_10_14_17_34')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPackages(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Package deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error deleting package', description: err.message, variant: 'destructive' });
    }
    setDeleteConfirm(null);
  };

  const toggleFeatured = async (pkg: Package) => {
    const nextValue = !pkg.is_featured;
    try {
      const { error } = await supabase
        .from('packages_2025_10_14_17_34')
        .update({ is_featured: nextValue })
        .eq('id', pkg.id);

      if (error) throw error;
      setPackages(prev => prev.map(item => (
        item.id === pkg.id ? { ...item, is_featured: nextValue } : item
      )));
      toast({ title: nextValue ? 'Package featured' : 'Package unfeatured' });
    } catch (err: any) {
      toast({ title: 'Error toggling featured status', description: err.message, variant: 'destructive' });
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
    const filePath = `packages/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    try {
      const { error } = await supabase.storage
        .from('service-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: 'Image uploaded successfully' });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Could not upload image.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-serif">Manage Curated Experiences</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the tour and travel packages shown in the Curated Experiences section of the homepage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPackages} className="border-white/10 w-fit">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={openNew} className="gap-2 w-fit">
            <Plus className="w-4 h-4" /> Add Package
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading packages...</div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1a24] border border-white/5 rounded-xl">
          <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No packages found. Create your first curated travel experience!</p>
          <Button className="mt-4 gap-2" onClick={openNew}>
            <Plus className="w-4 h-4" /> Add Package
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const image = Array.isArray(pkg.images) && pkg.images.length > 0 ? pkg.images[0] : null;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-white/5">
                    {image ? (
                      <img src={image} alt={pkg.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Compass className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded-full font-semibold shadow-md">
                        {pkg.duration_days} Days
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-serif font-bold text-white text-lg line-clamp-1">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description || 'No description set.'}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-primary font-bold text-lg">
                        {pkg.price ? `₹${pkg.price.toLocaleString()}` : 'Price TBD'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pkg.is_custom ? 'Custom' : 'Standard'}
                      </span>
                    </div>

                    {Array.isArray(pkg.destinations) && pkg.destinations.length > 0 && (
                      <div className="text-xs text-muted-foreground pt-1 truncate">
                        <strong>Destinations: </strong> {pkg.destinations.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 mt-auto">
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs gap-1.5"
                      onClick={() => toggleFeatured(pkg)}
                    >
                      <Star className={`w-3.5 h-3.5 ${pkg.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      {pkg.is_featured ? 'Featured' : 'Feature'}
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(pkg)}>
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-white" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-400 hover:bg-red-400/10" onClick={() => setDeleteConfirm(pkg.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {deleteConfirm === pkg.id && (
                    <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex flex-col gap-2">
                      <p className="text-xs text-red-400">Delete package "{pkg.name}"?</p>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="destructive" className="h-7 text-xs px-3" onClick={() => handleDelete(pkg.id)}>Delete</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-3 border border-white/10" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#13131a] border-white/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Package' : 'Add Package'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Label className="text-sm mb-1 block">Package Name *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Duration (Days) *</Label>
                <Input type="number" min="1" value={form.duration_days} onChange={e => setForm(p => ({ ...p, duration_days: e.target.value }))} required className="bg-white/5 border-white/10" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Price (₹)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 25000" className="bg-white/5 border-white/10" />
              </div>
              <div className="flex items-end gap-6 pb-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch checked={form.is_featured} onCheckedChange={checked => setForm(p => ({ ...p, is_featured: checked }))} />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Switch checked={form.is_custom} onCheckedChange={checked => setForm(p => ({ ...p, is_custom: checked }))} />
                  <span className="text-sm">Custom Package</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Location</Label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Uttarakhand, India" className="bg-white/5 border-white/10" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Start Date</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">End Date</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <Label className="text-sm mb-1 block">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="bg-white/5 border-white/10" />
            </div>

            <div>
              <Label className="text-sm mb-1 block">Package Image</Label>
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
                <div className="relative h-32 rounded-lg border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                  {form.image_url ? (
                    <>
                      <img src={form.image_url} alt="Package preview" className="w-full h-full object-cover" />
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
                      id="package-image-upload"
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
                      onClick={() => document.getElementById('package-image-upload')?.click()}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Destinations (one per line)</Label>
                <Textarea value={form.destinations_text} onChange={e => setForm(p => ({ ...p, destinations_text: e.target.value }))} rows={4} placeholder="Sankri&#10;Kedarkantha Summit" className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Inclusions (one per line)</Label>
                <Textarea value={form.inclusions_text} onChange={e => setForm(p => ({ ...p, inclusions_text: e.target.value }))} rows={4} placeholder="Accommodation&#10;All meals&#10;Guide" className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Exclusions (one per line)</Label>
                <Textarea value={form.exclusions_text} onChange={e => setForm(p => ({ ...p, exclusions_text: e.target.value }))} rows={4} placeholder="Tips&#10;Alcoholic beverages" className="bg-white/5 border-white/10" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={saving || uploadingImage}>
                {saving ? 'Saving...' : (editingId ? 'Update Package' : 'Add Package')}
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
