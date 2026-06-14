'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatRelative, formatDate, roleLabel } from '@/lib/utils';
import { Shield, Users, Building2, HardDrive, Server, Cpu, Database, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { data: overview } = useQuery({ queryKey: ['admin-overview'], queryFn: adminApi.overview });
  const { data: orgs } = useQuery({ queryKey: ['admin-orgs'], queryFn: () => adminApi.organizations() });
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.users() });
  const qc = useQueryClient();

  const toggleOrgMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => adminApi.overview().then(() => fetch(`/api/admin/organizations/${id}/toggle`, { method: 'POST', body: JSON.stringify({ isActive }), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token')}` } })),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orgs'] }); toast.success('Organization updated'); },
  });

  const mem = overview?.system?.memory;
  const memPercent = mem ? Math.round((mem.heapUsed / mem.heapTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Super Admin Portal</h2>
          <p className="text-sm text-muted-foreground">System overview and management</p>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Users', value: overview?.totalUsers || 0, icon: Users },
          { label: 'Orgs', value: overview?.totalOrgs || 0, icon: Building2 },
          { label: 'Messages', value: overview?.totalMessages || 0, icon: Database },
          { label: 'Calls', value: overview?.totalCalls || 0, icon: Server },
          { label: 'Dealers', value: overview?.totalDealers || 0, icon: Shield },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xl font-bold text-foreground">{s.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> System Resources
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Memory (Heap)</span>
                <span className="text-foreground">{memPercent}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${memPercent > 80 ? 'bg-destructive' : memPercent > 60 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${memPercent}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uptime</span>
              <span className="text-foreground">{overview ? Math.floor(overview.system.uptime / 3600) + 'h ' + Math.floor((overview.system.uptime % 3600) / 60) + 'm' : '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform</span>
              <span className="text-foreground">{overview?.system?.platform} / Node {overview?.system?.nodeVersion}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Free Memory</span>
              <span className="text-foreground">{overview ? Math.round(overview.system.freeMemory / 1024 / 1024) + ' MB' : '—'}</span>
            </div>
          </div>
        </div>

        {/* Organizations */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" /> Organizations
          </h3>
          <div className="space-y-2">
            {(orgs || []).slice(0, 5).map((org: any) => (
              <div key={org.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium text-foreground">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(org.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${org.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {org.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">All Users</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">User</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Role</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Last Login</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(users || []).map((user: any) => (
              <tr key={user.id} className="hover:bg-accent transition-colors">
                <td className="px-5 py-3">
                  <p className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{roleLabel(user.role)}</span>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                  {user.lastLoginAt ? formatRelative(user.lastLoginAt) : 'Never'}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
