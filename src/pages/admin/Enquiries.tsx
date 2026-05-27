import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, RefreshCw, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  travel_dates: string;
  group_size: number;
  budget_range: string;
  service_interests: string[];
  special_requirements: string;
  status: string;
  created_at: string;
}

export default function Enquiries() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchEnquiries(); }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contact_submissions_2025_10_14_17_34')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEnquiries(data as Enquiry[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('contact_submissions_2025_10_14_17_34')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      toast({ title: 'Status updated', description: `Enquiry marked as ${status}` });
    }
  };

  const statusColor: Record<string, string> = {
    new: 'text-blue-400 bg-blue-400/10',
    contacted: 'text-green-400 bg-green-400/10',
    closed: 'text-gray-400 bg-gray-400/10',
  };

  const filtered = enquiries.filter(e => {
    const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Enquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">{enquiries.length} contact submissions</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEnquiries} className="border-white/10">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white/5 border-white/10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No enquiries found</div>
        ) : (
          filtered.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden"
            >
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              >
                <div className="w-10 h-10 bg-purple-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{e.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor[e.status] || 'text-gray-400 bg-gray-400/10'}`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{e.email} · {e.phone || 'No phone'}</div>
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block flex-shrink-0">
                  {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {expanded === e.id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    {e.travel_dates && (
                      <div>
                        <div className="text-muted-foreground text-xs mb-0.5">Travel Dates</div>
                        <div>{e.travel_dates}</div>
                      </div>
                    )}
                    {e.group_size && (
                      <div>
                        <div className="text-muted-foreground text-xs mb-0.5">Group Size</div>
                        <div>{e.group_size} people</div>
                      </div>
                    )}
                    {e.budget_range && (
                      <div>
                        <div className="text-muted-foreground text-xs mb-0.5">Budget Range</div>
                        <div>{e.budget_range}</div>
                      </div>
                    )}
                  </div>

                  {e.service_interests && Array.isArray(e.service_interests) && e.service_interests.length > 0 && (
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Interested In</div>
                      <div className="flex flex-wrap gap-1">
                        {e.service_interests.map((s, i) => (
                          <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {e.special_requirements && (
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Message</div>
                      <p className="text-sm bg-white/5 rounded-lg p-3">{e.special_requirements}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="border-white/10 gap-2" onClick={() => window.location.href = `mailto:${e.email}`}>
                      <Mail className="w-3.5 h-3.5" /> Reply via Email
                    </Button>
                    <Select value={e.status} onValueChange={(val) => updateStatus(e.id, val)}>
                      <SelectTrigger className="h-8 text-xs w-32 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
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
