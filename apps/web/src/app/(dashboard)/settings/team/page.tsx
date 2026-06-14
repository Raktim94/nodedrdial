'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { formatRelative, getInitials, roleLabel } from '@/lib/utils';
import { Users, Plus, UserMinus, UserCheck, Loader2, X, Mail } from 'lucide-react';
import { toast } from 'sonner';

const roles = ['org_owner', 'manager', 'agent'];

export default function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ firstName: '', lastName: '', email: '', role: 'agent' });
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list() });

  const inviteMutation = useMutation({
    mutationFn: usersApi.invite,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowInvite(false); toast.success('Invitation sent'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Invite failed'),
  });

  const deactivateMutation = useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deactivated'); },
  });

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Team Management</h2>
          <p className="text-sm text-muted-foreground">{users?.meta?.total || 0} team members</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (users?.data || []).length === 0 ? (
            <div className="text-center py-12"><Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">No team members</p></div>
          ) : (
            (users?.data || []).map((user: any) => (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-accent transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hidden sm:block">{roleLabel(user.role)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full hidden md:block ${user.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-muted-foreground hidden lg:block">{user.lastLoginAt ? formatRelative(user.lastLoginAt) : 'Never'}</span>
                  <button onClick={() => deactivateMutation.mutate(user.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Deactivate">
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                  <input value={invite.firstName} onChange={(e) => setInvite((i) => ({ ...i, firstName: e.target.value }))} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                  <input value={invite.lastName} onChange={(e) => setInvite((i) => ({ ...i, lastName: e.target.value }))} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input type="email" value={invite.email} onChange={(e) => setInvite((i) => ({ ...i, email: e.target.value }))} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <select value={invite.role} onChange={(e) => setInvite((i) => ({ ...i, role: e.target.value }))} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {roles.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent text-sm transition-colors">Cancel</button>
                <button onClick={() => inviteMutation.mutate(invite)} disabled={inviteMutation.isPending || !invite.email} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors">
                  {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
