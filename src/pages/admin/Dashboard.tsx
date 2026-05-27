import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, MessageSquare, Mountain, Users, TrendingUp,
  TrendingDown, ArrowRight, CheckCircle, Clock, XCircle, Tent
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalBookings: number;
  totalEnquiries: number;
  activeTreks: number;
  totalRegistrations: number;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  travel_dates: string;
  status: string;
  created_at: string;
}

interface Enquiry {
  id: string;
  name: string;
  email: string;
  special_requirements: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: <Clock className="w-3 h-3" /> },
  confirmed: { color: 'text-green-400', bg: 'bg-green-400/10', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { color: 'text-red-400', bg: 'bg-red-400/10', icon: <XCircle className="w-3 h-3" /> },
  new: { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: <Clock className="w-3 h-3" /> },
  contacted: { color: 'text-green-400', bg: 'bg-green-400/10', icon: <CheckCircle className="w-3 h-3" /> },
};

function StatCard({ title, value, icon, color, subtitle }: {
  title: string; value: number | string; icon: React.ReactNode; color: string; subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a24] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
      {subtitle && <div className="text-xs text-green-400 mt-1">{subtitle}</div>}
    </motion.div>
  );
}

// Generate mock chart data for last 14 days
function generateChartData() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      bookings: Math.floor(Math.random() * 8) + 1,
      enquiries: Math.floor(Math.random() * 15) + 3,
    };
  });
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalBookings: 0, totalEnquiries: 0, activeTreks: 0, totalRegistrations: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [chartData] = useState(generateChartData());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, enquiriesRes, treksRes, regsRes] = await Promise.all([
        supabase.from('bookings_2025_10_14_17_34').select('id, name, email, travel_dates, status, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
        supabase.from('contact_submissions_2025_10_14_17_34').select('id, name, email, special_requirements, status, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
        supabase.from('treks').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('trek_registrations').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalBookings: bookingsRes.count || 0,
        totalEnquiries: enquiriesRes.count || 0,
        activeTreks: treksRes.count || 0,
        totalRegistrations: regsRes.count || 0,
      });

      if (bookingsRes.data) setRecentBookings(bookingsRes.data as Booking[]);
      if (enquiriesRes.data) setRecentEnquiries(enquiriesRes.data as Enquiry[]);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const dateRange = `${new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, Admin! 🏔️</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with Himaale Himalayan Trails &amp; Tales.</p>
        </div>
        <div className="text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-lg px-3 py-2 hidden sm:block">
          📅 {dateRange}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={<BookOpen className="w-5 h-5 text-blue-400" />}
          color="bg-blue-400/10"
          subtitle="All time"
        />
        <StatCard
          title="Total Enquiries"
          value={stats.totalEnquiries}
          icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
          color="bg-purple-400/10"
          subtitle="All time"
        />
        <StatCard
          title="Active Treks"
          value={stats.activeTreks}
          icon={<Tent className="w-5 h-5 text-green-400" />}
          color="bg-green-400/10"
          subtitle="Currently active"
        />
        <StatCard
          title="Trek Registrations"
          value={stats.totalRegistrations}
          icon={<Users className="w-5 h-5 text-orange-400" />}
          color="bg-orange-400/10"
          subtitle="Interest received"
        />
      </div>

      {/* Chart + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-[#1a1a24] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">Activity Overview</h2>
            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-lg">Last 14 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="enqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#999' }}
              />
              <Area type="monotone" dataKey="bookings" stroke="#22c55e" fill="url(#bookGrad)" strokeWidth={2} name="Bookings" />
              <Area type="monotone" dataKey="enquiries" stroke="#6366f1" fill="url(#enqGrad)" strokeWidth={2} name="Enquiries" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-1 bg-green-400 rounded" /> Bookings
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-1 bg-indigo-400 rounded" /> Enquiries
            </div>
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[#1a1a24] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Bookings</h2>
            <a href="/admin/bookings" className="text-xs text-primary hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No bookings yet</p>
            ) : (
              recentBookings.map((b) => {
                const sc = statusConfig[b.status] || statusConfig.pending;
                return (
                  <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{b.email}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${sc.color} ${sc.bg}`}>
                      {sc.icon}
                      <span className="capitalize">{b.status}</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Enquiries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1a1a24] border border-white/5 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Enquiries</h2>
          <a href="/admin/enquiries" className="text-xs text-primary hover:underline">View All</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-white/5">
                <th className="pb-3 text-left font-medium">Name</th>
                <th className="pb-3 text-left font-medium">Email</th>
                <th className="pb-3 text-left font-medium hidden md:table-cell">Message</th>
                <th className="pb-3 text-left font-medium">Date</th>
                <th className="pb-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentEnquiries.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">No enquiries yet</td></tr>
              ) : (
                recentEnquiries.map((e) => {
                  const sc = statusConfig[e.status] || statusConfig.new;
                  return (
                    <tr key={e.id} className="text-sm hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium text-white">{e.name}</td>
                      <td className="py-3 text-muted-foreground">{e.email}</td>
                      <td className="py-3 text-muted-foreground hidden md:table-cell max-w-xs">
                        <span className="truncate block">{e.special_requirements || '—'}</span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${sc.color} ${sc.bg}`}>
                          {sc.icon}
                          <span className="capitalize">{e.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
