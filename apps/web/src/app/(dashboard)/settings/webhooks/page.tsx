'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhooksApi } from '@/lib/api';
import { toast } from 'sonner';
import { Webhook, Plus, Trash2, TestTube2, X, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const EVENT_OPTIONS = [
  'message.received',
  'message.delivered',
  'message.failed',
  'call.completed',
  'call.failed',
  'campaign.completed',
  'contact.created',
];

export default function WebhooksPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', events: [] as string[] });

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: webhooksApi.list,
  });

  const createMutation = useMutation({
    mutationFn: webhooksApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['webhooks'] });
      setShowCreate(false);
      setForm({ name: '', url: '', events: [] });
      toast.success('Webhook created');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create webhook'),
  });

  const deleteMutation = useMutation({
    mutationFn: webhooksApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['webhooks'] }); toast.success('Webhook deleted'); },
  });

  const testMutation = useMutation({
    mutationFn: webhooksApi.test,
    onSuccess: () => toast.success('Test event sent'),
    onError: () => toast.error('Test failed'),
  });

  const toggleEvent = (event: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter((e) => e !== event) : [...f.events, event],
    }));
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Webhooks</h2>
          <p className="text-sm text-muted-foreground">Receive real-time event notifications at your endpoints</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Webhook
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (webhooks || []).length === 0 ? (
          <div className="text-center py-12">
            <Webhook className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No webhooks configured</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(webhooks || []).map((wh: any) => (
              <div key={wh.id} className="p-5 hover:bg-accent transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">{wh.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${wh.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {wh.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">{wh.url}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(wh.events || []).map((e: string) => (
                        <span key={e} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => testMutation.mutate(wh.id)}
                      disabled={testMutation.isPending}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Send test event"
                    >
                      <TestTube2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(wh.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">Add Webhook</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="My Webhook"
                  className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Endpoint URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://your-server.com/webhooks"
                  className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Events</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {EVENT_OPTIONS.map((event) => (
                    <label key={event} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => toggleEvent(event)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          form.events.includes(event)
                            ? 'bg-primary border-primary'
                            : 'border-input bg-muted group-hover:border-primary'
                        }`}
                      >
                        {form.events.includes(event) && (
                          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm text-foreground font-mono">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent text-sm transition-colors">Cancel</button>
                <button
                  onClick={() => createMutation.mutate(form)}
                  disabled={createMutation.isPending || !form.name || !form.url || form.events.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Webhook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
