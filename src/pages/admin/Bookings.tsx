import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MapPin, RefreshCw, Search, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  destination_id?: string | null;
  category_id?: string | null;
  name?: string | null;
  guest_name?: string | null;
  email?: string | null;
  guest_email?: string | null;
  phone?: string | null;
  guest_phone?: string | null;
  travel_dates?: string | null;
  travel_date?: string | null;
  group_size: number;
  budget_range?: string | null;
  special_requirements?: string | null;
  special_requests?: string | null;
  status: string;
  created_at: string;
  destination?: BookingDestination | null;
  category?: BookingCategory | null;
}

interface BookingDestination {
  id: string;
  name?: string | null;
  location?: string | null;
}

interface BookingCategory {
  id: string;
  name?: string | null;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings_2025_10_14_17_34')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      const baseBookings = data as Booking[];
      const destinationIds = Array.from(new Set(baseBookings.map(b => b.destination_id).filter(Boolean))) as string[];
      const categoryIds = Array.from(new Set(baseBookings.map(b => b.category_id).filter(Boolean))) as string[];

      const [destinationsRes, categoriesRes] = await Promise.all([
        destinationIds.length > 0
          ? supabase.from('destinations_2025_10_14_17_34').select('id, name, location').in('id', destinationIds)
          : Promise.resolve({ data: [], error: null }),
        categoryIds.length > 0
          ? supabase.from('categories_2025_10_14_17_34').select('id, name').in('id', categoryIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (destinationsRes.error) {
        toast({ title: 'Error', description: destinationsRes.error.message, variant: 'destructive' });
      }
      if (categoriesRes.error) {
        toast({ title: 'Error', description: categoriesRes.error.message, variant: 'destructive' });
      }

      const destinationsById = new Map(
        ((destinationsRes.data || []) as BookingDestination[]).map(destination => [destination.id, destination])
      );
      const categoriesById = new Map(
        ((categoriesRes.data || []) as BookingCategory[]).map(category => [category.id, category])
      );

      setBookings(baseBookings.map((booking) => ({
        ...booking,
        destination: booking.destination_id ? destinationsById.get(booking.destination_id) || null : null,
        category: booking.category_id ? categoriesById.get(booking.category_id) || null : null,
      })));
    }

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

  const filtered = bookings.filter((booking) => {
    const customerName = (booking.guest_name || booking.name || '').toLowerCase();
    const customerEmail = (booking.guest_email || booking.email || '').toLowerCase();
    const bookedName = (booking.destination?.name || booking.category?.name || '').toLowerCase();
    const query = search.toLowerCase();

    const matchSearch = !search
      || customerName.includes(query)
      || customerEmail.includes(query)
      || bookedName.includes(query);
    const matchStatus = statusFilter === 'all' || booking.status === statusFilter;

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

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or booked service..."
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

      <div className="bg-[#1a1a24] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-white/5 bg-white/5">
                <th className="px-5 py-3.5 text-left font-medium">Customer</th>
                <th className="px-5 py-3.5 text-left font-medium hidden lg:table-cell">Booked</th>
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
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">No bookings found</td>
                </tr>
              ) : (
                filtered.map((booking) => {
                  const sc = statusConfig[booking.status] || statusConfig.pending;
                  const customerName = booking.guest_name || booking.name || 'Unknown customer';
                  const customerEmail = booking.guest_email || booking.email || 'No email';
                  const customerPhone = booking.guest_phone || booking.phone || '—';
                  const travelDate = booking.travel_dates || booking.travel_date || '—';
                  const bookedService = booking.destination?.name || 'Custom booking';
                  const bookedCategory = booking.category?.name || 'Uncategorized';
                  const notes = booking.special_requirements || booking.special_requests || '';
                  const isExpanded = expandedId === booking.id;

                  return (
                    <React.Fragment key={booking.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/5 transition-colors text-sm"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">{customerName}</div>
                          <div className="text-xs text-muted-foreground">{customerEmail}</div>
                          <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {isExpanded ? 'Hide details' : 'View details'}
                          </button>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <div className="font-medium text-white">{bookedService}</div>
                          <div className="text-xs text-muted-foreground">{bookedCategory}</div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{customerPhone}</td>
                        <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">{travelDate}</td>
                        <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">{booking.group_size || 1} pax</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${sc.color} ${sc.bg}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground text-xs">
                          {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-5 py-4">
                          <Select value={booking.status} onValueChange={(val) => updateStatus(booking.id, val)}>
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

                      {isExpanded && (
                        <tr className="bg-black/10">
                          <td colSpan={8} className="px-5 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Booked Service</div>
                                <div className="font-medium text-white">{bookedService}</div>
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Tag className="w-3.5 h-3.5" />
                                  {bookedCategory}
                                </div>
                                {booking.destination?.location && (
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {booking.destination.location}
                                  </div>
                                )}
                              </div>

                              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Travel Info</div>
                                <div className="text-white">{travelDate}</div>
                                <div className="text-xs text-muted-foreground mt-1">{booking.group_size || 1} pax</div>
                                {booking.budget_range && (
                                  <div className="text-xs text-muted-foreground mt-2">Budget: {booking.budget_range}</div>
                                )}
                              </div>

                              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Notes</div>
                                <div className="text-sm text-white">
                                  {notes || 'No special requirements shared.'}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
