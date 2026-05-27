import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Mountain, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  created_at: string;
}

const emptyCategory = { name: '', slug: '', description: '', icon: 'mountain' };

export default function Categories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories_2025_10_14_17_34').select('*').order('created_at');
    if (data) setCategories(data as Category[]);
    setLoading(false);
  };

  const openNew = () => { setEditingId(null); setForm(emptyCategory); setDialogOpen(true); };
  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || 'mountain' });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('categories_2025_10_14_17_34').update(form).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Category updated!' });
      } else {
        const { error } = await supabase.from('categories_2025_10_14_17_34').insert([form]);
        if (error) throw error;
        toast({ title: 'Category created!' });
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('categories_2025_10_14_17_34').delete().eq('id', id);
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Category deleted' });
    }
    setDeleteConfirm(null);
  };

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setForm(p => ({
      ...p,
      name: val,
      slug: editingId ? p.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">{categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCategories} className="border-white/10"><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Add Category</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">Loading...</div>
        ) : categories.map((cat) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a24] border border-white/5 rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Mountain className="w-5 h-5 text-primary" />
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(cat)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-400 hover:bg-red-400/10" onClick={() => setDeleteConfirm(cat.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold text-white mb-1">{cat.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{cat.description}</p>
            <div className="text-xs text-primary/70 font-mono">/{cat.slug}</div>

            {deleteConfirm === cat.id && (
              <div className="mt-3 p-3 bg-red-400/5 border border-red-400/20 rounded-lg">
                <p className="text-xs text-red-400 mb-2">Delete this category? Destinations inside will also be removed.</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" className="h-6 text-xs" onClick={() => handleDelete(cat.id)}>Delete</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-[#13131a] border-white/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div>
              <Label className="text-sm mb-1 block">Category Name *</Label>
              <Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Adventure Alley" required className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Slug</Label>
              <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="adventure-alley" required className="bg-white/5 border-white/10 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Icon</Label>
              <Select value={form.icon} onValueChange={val => setForm(p => ({ ...p, icon: val }))}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mountain">Mountain</SelectItem>
                  <SelectItem value="utensils">Utensils (Food)</SelectItem>
                  <SelectItem value="bed">Bed (Stay)</SelectItem>
                  <SelectItem value="heart">Heart (Soul)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}</Button>
              <Button type="button" variant="outline" className="border-white/10" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
