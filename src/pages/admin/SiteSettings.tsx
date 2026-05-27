import React, { useState } from 'react';
import { Settings, Phone, Mail, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function SiteSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    siteName: 'Himalayan Trails & Tales',
    tagline: 'Discover Pahadi Spirit',
    phone: '+91 8630113945',
    email: 'himalayantrailtales@gmail.com',
    address: 'Haldwani, Uttarakhand',
    instagram: '',
    facebook: '',
    youtube: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In future, save to Supabase site_settings table
    toast({ title: 'Settings saved!', description: 'Site settings updated successfully.' });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Site Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your website's basic information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" /> Basic Information
          </h2>
          <div>
            <Label className="text-sm mb-1 block">Site Name</Label>
            <Input value={form.siteName} onChange={e => setForm(p => ({ ...p, siteName: e.target.value }))} className="bg-white/5 border-white/10" />
          </div>
          <div>
            <Label className="text-sm mb-1 block">Tagline</Label>
            <Input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} className="bg-white/5 border-white/10" />
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
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-sm mb-1 block flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div>
            <Label className="text-sm mb-1 block flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Address</Label>
            <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="bg-white/5 border-white/10" />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Social Media Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm mb-1 block">Instagram URL</Label>
              <Input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="https://instagram.com/..." className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Facebook URL</Label>
              <Input value={form.facebook} onChange={e => setForm(p => ({ ...p, facebook: e.target.value }))} placeholder="https://facebook.com/..." className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-sm mb-1 block">YouTube URL</Label>
              <Input value={form.youtube} onChange={e => setForm(p => ({ ...p, youtube: e.target.value }))} placeholder="https://youtube.com/..." className="bg-white/5 border-white/10" />
            </div>
          </div>
        </div>

        <Button type="submit" className="gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </form>
    </div>
  );
}
