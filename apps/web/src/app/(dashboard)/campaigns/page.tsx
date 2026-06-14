'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, aiApi, twilioApi } from '@/lib/api';
import { formatDate, formatRelative, cn } from '@/lib/utils';
import { Megaphone, Plus, Play, Pause, X, Loader2, Sparkles, BarChart3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-400/10 text-blue-400',
  running: 'bg-yellow-400/10 text-yellow-400',
  completed: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
  paused: 'bg-orange-400/10 text-orange-400',
};

export default function CampaignsPage() {
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const qc = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.list({ limit: 50 }),
  });

  const { data: phoneNumbers } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: twilioApi.phoneNumbers,
  });

  const createMutation = useMutation({
    mutationFn: campaignsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); setShowForm(false); toast.success('Campaign created'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const launchMutation = useMutation({
    mutationFn: campaignsApi.launch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaign launched!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to launch'),
  });

  const pauseMutation = useMutation({
    mutationFn: campaignsApi.pause,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaign paused'); },
  });

  const deleteMutation = useMutation({
    mutationFn: campaignsApi.cancel,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaign cancelled'); },
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const handleGenerateAI = async () => {
    const values = watch();
    if (!values.aiProduct) { toast.error('Enter a product name first'); return; }
    setGenerating(true);
    try {
      const message = await aiApi.generateCampaign({ productName: values.aiProduct, offer: values.aiOffer || 'special offer', tone: values.aiTone || 'professional' });
      setValue('message', message);
    } catch { toast.error('AI generation failed'); }
    finally { setGenerating(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Campaigns</h2>
          <p className="text-sm text-muted-foreground">{campaigns?.meta?.total || 0} total campaigns</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Campaign Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : (campaigns?.data || []).length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No campaigns yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first SMS campaign to reach your contacts</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {(campaigns?.data || []).map((camp: any) => (
            <div key={camp.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground">{camp.name}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', statusColors[camp.status] || 'bg-muted text-muted-foreground')}>
                      {camp.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{camp.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {camp.status === 'draft' && (
                    <button onClick={() => launchMutation.mutate(camp.id)} disabled={launchMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-lg hover:bg-success/20 text-sm font-medium transition-colors">
                      <Play className="w-3.5 h-3.5" /> Launch
                    </button>
                  )}
                  {camp.status === 'running' && (
                    <button onClick={() => pauseMutation.mutate(camp.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 text-sm font-medium transition-colors">
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                  )}
                  {(camp.status === 'draft' || camp.status === 'paused') && (
                    <button onClick={() => deleteMutation.mutate(camp.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress */}
              {camp.totalContacts > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{camp.sentCount} sent</span>
                    <span>{camp.totalContacts} total</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.round((camp.sentCount / camp.totalContacts) * 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>From: {camp.fromNumber}</span>
                {camp.scheduledAt && <span>Scheduled: {formatDate(camp.scheduledAt)}</span>}
                <span>Created: {formatRelative(camp.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg p-6 animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">New Campaign</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Campaign Name *</label>
                <input {...register('name', { required: true })} placeholder="Summer Sale 2025" className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">From Number *</label>
                <select {...register('fromNumber', { required: true })} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {(phoneNumbers || []).map((n: any) => <option key={n.id} value={n.phoneNumber}>{n.phoneNumber}</option>)}
                </select>
              </div>

              {/* AI Generator */}
              <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="w-4 h-4" /> AI Message Generator
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input {...register('aiProduct')} placeholder="Product name" className="px-3 py-2 bg-muted border border-input rounded-lg text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                  <input {...register('aiOffer')} placeholder="Offer (e.g. 20% off)" className="px-3 py-2 bg-muted border border-input rounded-lg text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <select {...register('aiTone')} className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button type="button" onClick={handleGenerateAI} disabled={generating} className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium">
                  {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Generate Message
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground">Message *</label>
                  <span className="text-xs text-muted-foreground">{watch('message')?.length || 0}/160</span>
                </div>
                <textarea {...register('message', { required: true })} rows={4} placeholder="Your SMS message. Use {firstName}, {lastName}, {company} for personalization." className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Schedule (optional)</label>
                <input {...register('scheduledAt')} type="datetime-local" className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors flex items-center gap-2">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
