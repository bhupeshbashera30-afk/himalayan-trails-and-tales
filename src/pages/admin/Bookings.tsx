import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, XCircle, Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  travel_dates: string;
  group_size: number;
  budget_range: string;
  special_requirements: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  confirmed: { color: 'text-green-400', bg: 'bg-green-400/10' },
  cancelled: { color: 'text-red-400', bg: 'bg-red-400/10' },
};

export default function Bookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings_2025_10_14_17_34')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings_2025_10_14_17_34')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      toast({ title: 'Status updated', description: `Booking marked as ${status}` });
    }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">{bookings.length} total bookings</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings} className="border-white/10">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Filters */}
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
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a24] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-white/5 bg-white/5">
                <th className="px-5 py-3.5 text-left font-medium">Customer</th>
                <th className="px-5 py-3.5 text-left font-medium hidden md:table-cell">Phone</th>
                <th className="px-5 py-3.5 text-left font-medium hidden lg:table-cell">Travel Dates</th>
                <th className="px-5 py-3.5 text-left font-medium hidden lg:table-cell">Group</th>
                <th className="px-5 py-3.5 text-left font-medium">Status</th>
                <th className="px-5 py-3.5 text-left font-medium">Date</th>
                <th className="px-5 py-3.5 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No bookings found</td></tr>
              ) : (
                filtered.map((b) => {
                  const sc = statusConfig[b.status] || statusConfig.pending;
                  return (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors text-sm"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{b.name}</div>
                        <div className="text-xs text-muted-foreground">{b.email}</div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{b.phone || '—'}</td>
                      <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">{b.travel_dates || '—'}</td>
                      <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">{b.group_size || 1} pax</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${sc.color} ${sc.bg}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-5 py-4">
                        <Select value={b.status} onValueChange={(val) => updateStatus(b.id, val)}>
                          <SelectTrigger className="h-7 text-xs w-28 bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
