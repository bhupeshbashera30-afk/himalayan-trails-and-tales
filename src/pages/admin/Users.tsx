import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles_2025_10_14_17_34')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data as UserProfile[]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} registered users</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="border-white/10">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="bg-[#1a1a24] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-white/5 bg-white/5">
                <th className="px-5 py-3.5 text-left font-medium">User</th>
                <th className="px-5 py-3.5 text-left font-medium hidden md:table-cell">Phone</th>
                <th className="px-5 py-3.5 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={3} className="py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground">No registered users yet</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/5 transition-colors text-sm">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                          {(u.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">{u.full_name || 'Unnamed User'}</div>
                          <div className="text-xs text-muted-foreground font-mono">{u.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">{u.phone || '—'}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
