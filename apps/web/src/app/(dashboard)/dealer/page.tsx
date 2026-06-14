'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealerApi } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import { toast } from 'sonner';
import { Building2, Plus, Users, BarChart3, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function DealerPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', contactEmail: '', contactPhone: '' });

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['dealer-orgs'],
    queryFn: dealerApi.organizations,
  });

  const { data: stats } = useQuery({
    queryKey: ['dealer-stats'],
    queryFn: dealerApi.stats,
  });

  const createMutation = useMutation({
    mutationFn: dealerApi.createOrganization,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealer-orgs'] });
      setShowCreate(false);
      setForm({ name: '', slug: '', contactEmail: '', contactPhone: '' });
      toast.success('Organization created');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      dealerApi.toggleOrganization(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealer-orgs'] });
      toast.success('Organization updated');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Dealer Portal</h2>
            <p className="text-sm text-muted-foreground">Manage organizations under your dealership</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Organization
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Organizations', value: stats?.totalOrgs || 0, icon: Building2, color: 'text-primary' },
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-success' },
          { label: 'Messages Sent', value: stats?.totalMessages || 0, icon: BarChart3, color: 'text-warning' },
          { label: 'Active Orgs', value: stats?.activeOrgs || 0, icon: CheckCircle2, color: 'text-success' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Organizations Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Organizations</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (orgs || []).length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No organizations yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Create your first organization
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Organization</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Users</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Created</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(orgs || []).map((org: any) => (
                <tr key={org.id} className="hover:bg-accent transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">
                    {org._count?.users || 0} users
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {formatRelative(org.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        org.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {org.isActive ? (
                        <><CheckCircle2 className="w-3 h-3" /> Active</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Suspended</>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggleMutation.mutate({ id: org.id, isActive: !org.isActive })}
                      disabled={toggleMutation.isPending}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        org.isActive
                          ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                          : 'border-success/30 text-success hover:bg-success/10'
                      }`}
                    >
                      {org.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">New Organization</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Organization Name</label>
                <input
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setForm((f) => ({ ...f, name, slug }));
                  }}
                  placeholder="Acme Corp"
                  className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="acme-corp"
                  className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  placeholder="admin@acmecorp.com"
                  className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Contact Phone (optional)</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createMutation.mutate(form)}
                  disabled={createMutation.isPending || !form.name || !form.slug || !form.contactEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
