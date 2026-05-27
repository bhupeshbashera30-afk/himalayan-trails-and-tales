import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Search, RefreshCw, Users, Mail, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface TrekReg {
  id: string;
  trek_id: string;
  trek_name: string;
  name: string;
  email: string;
  phone: string;
  num_people: number;
  message: string;
  status: string;
  created_at: string;
}

export default function TrekRegistrations() {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<TrekReg[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchRegistrations(); }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('trek_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRegistrations(data as TrekReg[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('trek_registrations').update({ status }).eq('id', id);
    if (!error) {
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast({ title: 'Status updated' });
    }
  };

  const statusColor: Record<string, string> = {
    new: 'text-blue-400 bg-blue-400/10',
    contacted: 'text-green-400 bg-green-400/10',
    confirmed: 'text-emerald-400 bg-emerald-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
  };

  const filtered = registrations.filter(r => {
    const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.trek_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trek Registrations</h1>
          <p className="text-muted-foreground text-sm mt-1">{registrations.length} interest registrations</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRegistrations} className="border-white/10">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or trek..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white/5 border-white/10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a24] border border-white/5 rounded-2xl">
            <Map className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No trek registrations found</p>
          </div>
        ) : (
          filtered.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden"
            >
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Map className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{r.name}</span>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{r.trek_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor[r.status] || 'text-gray-400 bg-gray-400/10'}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    <span>{r.email}</span>
                    <span>· {r.num_people} {r.num_people === 1 ? 'person' : 'people'}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block flex-shrink-0">
                  {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {expanded === r.id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs mb-0.5">Phone</div>
                      <div>{r.phone || '—'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-0.5">People</div>
                      <div>{r.num_people}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-0.5">Trek</div>
                      <div className="text-primary">{r.trek_name}</div>
                    </div>
                  </div>

                  {r.message && (
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Message</div>
                      <p className="text-sm bg-white/5 rounded-lg p-3">{r.message}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1 flex-wrap">
                    <Button size="sm" variant="outline" className="border-white/10 gap-2" onClick={() => window.location.href = `mailto:${r.email}`}>
                      <Mail className="w-3.5 h-3.5" /> Email
                    </Button>
                    {r.phone && (
                      <Button size="sm" variant="outline" className="border-white/10 gap-2" onClick={() => window.location.href = `tel:${r.phone}`}>
                        <Phone className="w-3.5 h-3.5" /> Call
                      </Button>
                    )}
                    <Select value={r.status} onValueChange={(val) => updateStatus(r.id, val)}>
                      <SelectTrigger className="h-8 text-xs w-32 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
