'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, X, Loader2 } from 'lucide-react';

export default function ApiKeysPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: apiKeysApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () => apiKeysApi.create({ name }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      setShowCreate(false);
      setName('');
      setNewKey(data.key);
      toast.success('API key created');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create key'),
  });

  const revokeMutation = useMutation({
    mutationFn: apiKeysApi.revoke,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Key revoked'); },
  });

  const copyKey = () => {
    navigator.clipboard.writeText(newKey);
    toast.success('Key copied to clipboard');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">API Keys</h2>
          <p className="text-sm text-muted-foreground">Authenticate API requests from external systems</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Key
        </button>
      </div>

      {/* Newly created key banner */}
      {newKey && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4">
          <p className="text-sm font-medium text-success mb-2">Save your API key — it won't be shown again</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-background/50 px-3 py-2 rounded-lg text-foreground overflow-auto">
              {showKey ? newKey : '•'.repeat(Math.min(newKey.length, 40))}
            </code>
            <button onClick={() => setShowKey(!showKey)} className="p-2 text-muted-foreground hover:text-foreground">
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={copyKey} className="flex items-center gap-1 px-3 py-2 bg-success text-white rounded-lg text-xs font-medium hover:bg-success/90 transition-colors">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
          <button onClick={() => setNewKey('')} className="mt-2 text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (keys || []).length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No API keys yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Prefix</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Created</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Last Used</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(keys || []).map((key: any) => (
                <tr key={key.id} className="hover:bg-accent transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground">{key.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{key.keyPrefix}...</code>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground hidden lg:table-cell">{formatDate(key.createdAt)}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => revokeMutation.mutate(key.id)}
                      disabled={revokeMutation.isPending}
                      className="flex items-center gap-1.5 ml-auto text-xs px-3 py-1.5 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Revoke
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
          <div className="bg-card rounded-xl border border-border w-full max-w-sm p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Create API Key</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Key Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Integration"
                  autoFocus
                  className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent text-sm transition-colors">Cancel</button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !name}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Generate Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
