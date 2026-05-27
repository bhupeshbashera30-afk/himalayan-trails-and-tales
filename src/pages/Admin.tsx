import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mountain, LayoutDashboard, BookOpen, MessageSquare, CreditCard,
  Map, Tag, Image, Star, Users, UserCheck, Settings, BarChart2,
  Palette, LogOut, Bell, Search, ChevronDown, Menu, X, Tent
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const navSections = [
  {
    title: 'BOOKINGS',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/bookings', label: 'Bookings', icon: BookOpen },
      { path: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
    ],
  },
  {
    title: 'TREKS & CONTENT',
    items: [
      { path: '/admin/treks', label: 'Treks', icon: Tent },
      { path: '/admin/trek-registrations', label: 'Trek Registrations', icon: Map },
      { path: '/admin/categories', label: 'Categories', icon: Tag },
    ],
  },
  {
    title: 'USERS & TEAM',
    items: [
      { path: '/admin/users', label: 'Users', icon: Users },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { path: '/admin/site-settings', label: 'Site Settings', icon: Settings },
    ],
  },
];

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<{ email: string; full_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/admin');
      return;
    }

    const { data } = await supabase
      .from('admin_users')
      .select('is_admin, email, full_name')
      .eq('id', session.user.id)
      .single();

    if (!data?.is_admin) {
      navigate('/admin');
      return;
    }

    setAdminUser({ email: data.email || session.user.email || '', full_name: data.full_name });
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Signed out', description: 'You have been signed out of the admin panel.' });
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Mountain className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const initials = adminUser?.full_name
    ? adminUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : adminUser?.email?.slice(0, 2).toUpperCase() || 'AD';

  return (
    <div className="min-h-screen bg-[#0f0f14] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-[#13131a] border-r border-white/5 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
              <Mountain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">HIMAALE</div>
              <div className="text-xs text-muted-foreground">Himalayan Trails &amp; Tales</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider px-3 mb-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin user footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{adminUser?.full_name || 'Admin User'}</div>
              <div className="text-xs text-green-400">Super Admin</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-[#13131a] border-b border-white/5 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1 hidden sm:block">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search anything..."
                className="pl-9 bg-white/5 border-white/10 text-sm h-9"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {initials}
              </div>
              <span className="text-sm font-medium hidden sm:block">{adminUser?.full_name || 'Admin User'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
