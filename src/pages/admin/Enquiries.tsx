import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, RefreshCw, Search, Trash2 } from 'lucide-react';
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

function normalizeEnquiryStatus(status?: string | null) {
  if (status === 'new') return 'pending';
  if (status === 'closed') return 'cancelled';
  return status || 'pending';
}

const statusColor: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  contacted: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default function Enquiries() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions_2025_10_14_17_34')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      setEnquiries(data as Enquiry[]);
    }

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

  const deleteEnquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;

    const { error } = await supabase
      .from('contact_submissions_2025_10_14_17_34')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete enquiry error:', error);
      toast({ title: 'Delete Failed', description: error.message || 'Permission denied by database RLS policy', variant: 'destructive' });
    } else {
      setEnquiries(prev => prev.filter(e => e.id !== id));
      toast({ title: 'Enquiry Deleted', description: 'The enquiry record has been removed.' });
    }
  };

  const filtered = enquiries.filter(enquiry => {
    const matchSearch = !search
      || enquiry.name?.toLowerCase().includes(search.toLowerCase())
      || enquiry.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || normalizeEnquiryStatus(enquiry.status) === statusFilter;
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
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No enquiries found</div>
        ) : (
          filtered.map((enquiry) => {
            const currentStatus = normalizeEnquiryStatus(enquiry.status);

            return (
              <motion.div
                key={enquiry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1a1a24] border border-white/5 rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpanded(expanded === enquiry.id ? null : enquiry.id)}
                >
                  <div className="w-10 h-10 bg-purple-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{enquiry.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor[currentStatus] || 'text-gray-400 bg-gray-400/10'}`}>
                        {currentStatus}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{enquiry.email} · {enquiry.phone || 'No phone'}</div>
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block flex-shrink-0">
                    {new Date(enquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {expanded === enquiry.id && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      {enquiry.travel_dates && (
                        <div>
                          <div className="text-muted-foreground text-xs mb-0.5">Travel Dates</div>
                          <div>{enquiry.travel_dates}</div>
                        </div>
                      )}
                      {enquiry.group_size && (
                        <div>
                          <div className="text-muted-foreground text-xs mb-0.5">Group Size</div>
                          <div>{enquiry.group_size} people</div>
                        </div>
                      )}
                      {enquiry.budget_range && (
                        <div>
                          <div className="text-muted-foreground text-xs mb-0.5">Budget Range</div>
                          <div>{enquiry.budget_range}</div>
                        </div>
                      )}
                    </div>

                    {enquiry.service_interests && Array.isArray(enquiry.service_interests) && enquiry.service_interests.length > 0 && (
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Interested In</div>
                        <div className="flex flex-wrap gap-1">
                          {enquiry.service_interests.map((interest, index) => (
                            <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {enquiry.special_requirements && (
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Message</div>
                        <p className="text-sm bg-white/5 rounded-lg p-3">{enquiry.special_requirements}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1 items-center justify-between">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-white/10 gap-2" onClick={() => window.location.href = `mailto:${enquiry.email}`}>
                          <Mail className="w-3.5 h-3.5" /> Reply via Email
                        </Button>
                        <Select value={currentStatus} onValueChange={(value) => updateStatus(enquiry.id, value)}>
                          <SelectTrigger className="h-8 text-xs w-36 bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEnquiry(enquiry.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
