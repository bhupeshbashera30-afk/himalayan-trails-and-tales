import React, { useEffect, useState } from 'react';
import { Settings, Phone, Mail, MapPin, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const defaultSettings = {
  siteName: 'Himalayan Trails & Tales',
  tagline: 'Discover Pahadi Spirit',
  phone: '+91 8630113945',
  email: 'himalayantrailtales@gmail.com',
  address: 'Haldwani, Uttarakhand',
  instagram: '',
  facebook: '',
  youtube: '',
};

export default function SiteSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setForm({
          siteName: data.site_name || defaultSettings.siteName,
          tagline: data.tagline || defaultSettings.tagline,
          phone: data.phone || defaultSettings.phone,
          email: data.email || defaultSettings.email,
          address: data.address || defaultSettings.address,
          instagram: data.instagram || defaultSettings.instagram,
          facebook: data.facebook || defaultSettings.facebook,
          youtube: data.youtube || defaultSettings.youtube,
        });
        setIsFallback(false);
      } else {
        // No data but table exists - seed it
        await seedDefaultSettings();
      }
    } catch (err: any) {
      if (err.message?.includes('relation "public.site_settings" does not exist') || err.code === 'PGRST116' || err.message?.includes('Could not find the table')) {
        setForm(defaultSettings);
        setIsFallback(true);
        toast({
          title: 'Using Local Fallback',
          description: 'Database table site_settings not found. Showing local site defaults.',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Error loading settings',
          description: err.message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultSettings = async () => {
    try {
      const { error } = await supabase.from('site_settings').insert([
        {
          id: 'default',
          site_name: defaultSettings.siteName,
          tagline: defaultSettings.tagline,
          phone: defaultSettings.phone,
          email: defaultSettings.email,
          address: defaultSettings.address,
          instagram: defaultSettings.instagram,
          facebook: defaultSettings.facebook,
          youtube: defaultSettings.youtube,
        }
      ]);
      if (error) throw error;
      setIsFallback(false);
    } catch (err: any) {
      console.warn('Failed to seed default settings:', err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFallback) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_name: form.siteName,
          tagline: form.tagline,
          phone: form.phone,
          email: form.email,
          address: form.address,
          instagram: form.instagram,
          facebook: form.facebook,
          youtube: form.youtube,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'default');

      if (error) throw error;
      toast({ title: 'Settings saved!', description: 'Site settings updated successfully in Supabase.' });
    } catch (err: any) {
      toast({
        title: 'Error saving settings',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-serif">Site Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your website's basic information and contact details.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSettings} className="border-white/10 w-fit">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {isFallback && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block mb-1">Database Table Missing</strong>
            The <code>site_settings</code> table was not found in your Supabase database schema. Showing local read-only default settings. 
            To enable saving site settings, please copy the contents of the SQL migration file 
            <code className="mx-1 px-1 bg-black/40 rounded border border-white/5">supabase/migrations/20260528145000_create_testimonials_table.sql</code> 
            and execute it in the SQL Editor on your Supabase dashboard.
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Basic Information
            </h2>
            <div>
              <Label className="text-sm mb-1 block">Site Name</Label>
              <Input value={form.siteName} onChange={e => setForm(p => ({ ...p, siteName: e.target.value }))} className="bg-white/5 border-white/10" disabled={isFallback} />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Tagline</Label>
              <Input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} className="bg-white/5 border-white/10" disabled={isFallback} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1 block flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Phone</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-white/5 border-white/10" disabled={isFallback} />
              </div>
              <div>
                <Label className="text-sm mb-1 block flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="bg-white/5 border-white/10" disabled={isFallback} />
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1 block flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Address</Label>
              <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="bg-white/5 border-white/10" disabled={isFallback} />
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white">Social Media Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm mb-1 block">Instagram URL</Label>
                <Input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="https://instagram.com/..." className="bg-white/5 border-white/10" disabled={isFallback} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Facebook URL</Label>
                <Input value={form.facebook} onChange={e => setForm(p => ({ ...p, facebook: e.target.value }))} placeholder="https://facebook.com/..." className="bg-white/5 border-white/10" disabled={isFallback} />
              </div>
              <div>
                <Label className="text-sm mb-1 block">YouTube URL</Label>
                <Input value={form.youtube} onChange={e => setForm(p => ({ ...p, youtube: e.target.value }))} placeholder="https://youtube.com/..." className="bg-white/5 border-white/10" disabled={isFallback} />
              </div>
            </div>
          </div>

          <Button type="submit" className="gap-2" disabled={saving || isFallback}>
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      )}
    </div>
  );
}
