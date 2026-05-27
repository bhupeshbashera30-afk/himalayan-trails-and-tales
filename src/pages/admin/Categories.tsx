import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bed, Car, Heart, ImagePlus, Mountain, Pencil, Plus, RefreshCw, Star, Trash2, Upload, Utensils, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  created_at: string;
}

interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  location: string;
  price_range: string | null;
  images: string[];
  features: string[];
  rating: number;
  is_featured: boolean;
  created_at: string;
}

const iconMap = {
  utensils: Utensils,
  bed: Bed,
  mountain: Mountain,
  heart: Heart,
  car: Car,
};

const emptyService = {
  name: '',
  description: '',
  location: '',
  price_range: '',
  image_url: '',
  features_text: '',
  rating: '4.8',
  is_featured: false,
};

export default function Categories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) fetchServices(selectedCategoryId);
  }, [selectedCategoryId]);

  const selectedCategory = useMemo(
    () => categories.find(category => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories_2025_10_14_17_34')
      .select('*')
      .order('created_at');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const rows = (data || []) as Category[];
      setCategories(rows);
      setSelectedCategoryId(current => current || rows[0]?.id || null);
    }

    setLoading(false);
  };

  const fetchServices = async (categoryId = selectedCategoryId) => {
    if (!categoryId) return;
    setServicesLoading(true);
    const { data, error } = await supabase
      .from('destinations_2025_10_14_17_34')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setServices((data || []) as Service[]);
    }

    setServicesLoading(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyService);
    setDeleteConfirm(null);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name || '',
      description: service.description || '',
      location: service.location || '',
      price_range: service.price_range || '',
      image_url: Array.isArray(service.images) && service.images.length > 0 ? service.images[0] : '',
      features_text: Array.isArray(service.features) ? service.features.join('\n') : '',
      rating: String(service.rating ?? 4.8),
      is_featured: Boolean(service.is_featured),
    });
    setDeleteConfirm(null);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return;

    setSaving(true);
    const payload = {
      category_id: selectedCategoryId,
      name: form.name,
      description: form.description,
      location: form.location,
      price_range: form.price_range || null,
      images: form.image_url ? [form.image_url] : [],
      features: form.features_text.split('\n').map(feature => feature.trim()).filter(Boolean),
      rating: Number.parseFloat(form.rating) || 0,
      is_featured: form.is_featured,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('destinations_2025_10_14_17_34')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Service updated' });
      } else {
        const { error } = await supabase
          .from('destinations_2025_10_14_17_34')
          .insert([payload]);
        if (error) throw error;
        toast({ title: 'Service added' });
      }

      setDialogOpen(false);
      fetchServices();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('destinations_2025_10_14_17_34')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setServices(prev => prev.filter(service => service.id !== id));
      toast({ title: 'Service deleted' });
    }

    setDeleteConfirm(null);
  };

  const toggleFeatured = async (service: Service) => {
    const nextValue = !service.is_featured;
    const { error } = await supabase
      .from('destinations_2025_10_14_17_34')
      .update({ is_featured: nextValue })
      .eq('id', service.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setServices(prev => prev.map(item => (
        item.id === service.id ? { ...item, is_featured: nextValue } : item
      )));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!selectedCategory) return;
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
    const safeCategory = selectedCategory.slug.replace(/[^a-z0-9-]/g, '') || 'service';
    const filePath = `${safeCategory}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

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
      toast({ title: 'Image uploaded', description: 'The service image is ready.' });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Categories are fixed. Manage the services listed inside each one.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          fetchCategories();
          fetchServices();
        }} className="border-white/10 w-fit">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-4 h-fit">
          <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">
            Fixed Categories
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading categories...</div>
            ) : categories.map((category) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap] || Mountain;
              const selected = category.id === selectedCategoryId;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setDeleteConfirm(null);
                  }}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selected
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{category.name}</div>
                      <div className="text-xs text-primary/70 font-mono truncate">/{category.slug}</div>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {selectedCategory ? selectedCategory.name : 'Services'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {services.length} services in this category
              </p>
            </div>
            <Button onClick={openNew} disabled={!selectedCategoryId} className="gap-2 w-fit">
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          </div>

          {servicesLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 bg-[#1a1a24] border border-white/5 rounded-xl">
              <Mountain className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No services added in this category yet.</p>
              <Button className="mt-4 gap-2" onClick={openNew} disabled={!selectedCategoryId}>
                <Plus className="w-4 h-4" /> Add Service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {services.map((service) => {
                const image = Array.isArray(service.images) && service.images.length > 0 ? service.images[0] : null;

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden"
                  >
                    <div className="flex gap-4 p-4">
                      {image ? (
                        <img src={image} alt={service.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0 bg-white/5" />
                      ) : (
                        <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mountain className="w-8 h-8 text-primary/40" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white truncate">{service.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{service.location || 'No location set'}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-yellow-400 flex-shrink-0">
                            <Star className="w-3 h-3 fill-yellow-400" />
                            {service.rating || 0}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {service.description || 'No description added.'}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {Array.isArray(service.features) && service.features.slice(0, 3).map((feature, index) => (
                            <span key={`${service.id}-${feature}-${index}`} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs gap-1.5" onClick={() => openEdit(service)}>
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1.5"
                            onClick={() => toggleFeatured(service)}
                          >
                            <Star className={`w-3.5 h-3.5 ${service.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            {service.is_featured ? 'Featured' : 'Feature'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1.5 text-red-400 hover:text-red-400 hover:bg-red-400/10"
                            onClick={() => setDeleteConfirm(service.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    {deleteConfirm === service.id && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3 flex items-center gap-3">
                        <p className="text-sm text-red-400 flex-1">Delete "{service.name}"?</p>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(service.id)}>Delete</Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#13131a] border-white/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Service' : `Add Service${selectedCategory ? ` to ${selectedCategory.name}` : ''}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Service Name *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Location</Label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
            </div>

            <div>
              <Label className="text-sm mb-1 block">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="bg-white/5 border-white/10" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1 block">Price Range</Label>
                <Input value={form.price_range} onChange={e => setForm(p => ({ ...p, price_range: e.target.value }))} placeholder="e.g. From Rs 2,500" className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Rating</Label>
                <Input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
            </div>

            <div>
              <Label className="text-sm mb-1 block">Service Image</Label>
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
                <div className="relative h-32 rounded-lg border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                  {form.image_url ? (
                    <>
                      <img src={form.image_url} alt="Service preview" className="w-full h-full object-cover" />
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
                      id="service-image-upload"
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
                      disabled={uploadingImage || !selectedCategory}
                      onClick={() => document.getElementById('service-image-upload')?.click()}
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

            <div>
              <Label className="text-sm mb-1 block">Features (one per line)</Label>
              <Textarea value={form.features_text} onChange={e => setForm(p => ({ ...p, features_text: e.target.value }))} rows={4} placeholder="Local guide&#10;Pickup included&#10;Custom timing" className="bg-white/5 border-white/10" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={form.is_featured} onCheckedChange={checked => setForm(p => ({ ...p, is_featured: checked }))} />
              <span className="text-sm">Featured service</span>
            </label>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={saving || uploadingImage}>
                {saving ? 'Saving...' : (editingId ? 'Update Service' : 'Add Service')}
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
