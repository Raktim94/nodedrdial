'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { twilioApi } from '@/lib/api';
import { toast } from 'sonner';
import { Phone, CheckCircle2, XCircle, RefreshCw, Eye, EyeOff, Loader2, Sync } from 'lucide-react';

export default function TwilioSettingsPage() {
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [creds, setCreds] = useState({ accountSid: '', authToken: '', apiKey: '', apiSecret: '', twimlAppSid: '' });
  const qc = useQueryClient();

  const { data: status } = useQuery({ queryKey: ['twilio-status'], queryFn: twilioApi.status });
  const { data: phoneNumbers } = useQuery({ queryKey: ['phone-numbers'], queryFn: twilioApi.phoneNumbers });
  const { data: usage } = useQuery({ queryKey: ['twilio-usage'], queryFn: twilioApi.usage, enabled: status?.isVerified });

  const saveMutation = useMutation({
    mutationFn: twilioApi.saveCredentials,
    onSuccess: () => { toast.success('Credentials saved'); qc.invalidateQueries({ queryKey: ['twilio-status'] }); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const testMutation = useMutation({
    mutationFn: twilioApi.test,
    onSuccess: (d) => { toast.success(`Connected: ${d.accountName}`); qc.invalidateQueries({ queryKey: ['twilio-status'] }); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Connection failed'),
  });

  const syncMutation = useMutation({
    mutationFn: twilioApi.syncPhoneNumbers,
    onSuccess: (nums) => { toast.success(`Synced ${nums.length} phone numbers`); qc.invalidateQueries({ queryKey: ['phone-numbers'] }); },
    onError: () => toast.error('Sync failed'),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${status?.isVerified ? 'bg-success/5 border-success/20' : 'bg-muted border-border'}`}>
        {status?.isVerified ? <CheckCircle2 className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
        <div>
          <p className="text-sm font-medium text-foreground">
            {status?.isVerified ? `Connected: ${status.accountName}` : status?.configured ? 'Configured but not verified' : 'Not configured'}
          </p>
          {status?.lastCheckedAt && <p className="text-xs text-muted-foreground">Last checked: {new Date(status.lastCheckedAt).toLocaleString()}</p>}
        </div>
        {status?.configured && (
          <button onClick={() => testMutation.mutate()} disabled={testMutation.isPending} className="ml-auto flex items-center gap-1.5 text-sm text-primary hover:underline">
            {testMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Test
          </button>
        )}
      </div>

      {/* Credentials Form */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-1">Twilio Credentials</h3>
        <p className="text-sm text-muted-foreground mb-5">Credentials are encrypted at rest using AES-256-GCM.</p>

        <div className="space-y-4">
          <Field label="Account SID" value={creds.accountSid} onChange={(v) => setCreds((c) => ({ ...c, accountSid: v }))} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          <Field label="Auth Token" type={showToken ? 'text' : 'password'} value={creds.authToken} onChange={(v) => setCreds((c) => ({ ...c, authToken: v }))} placeholder="Your auth token" suffix={
            <button type="button" onClick={() => setShowToken(!showToken)} className="text-muted-foreground hover:text-foreground">
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          } />

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 font-medium">For Browser Calling (optional)</p>
            <div className="space-y-3">
              <Field label="API Key SID" value={creds.apiKey} onChange={(v) => setCreds((c) => ({ ...c, apiKey: v }))} placeholder="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <Field label="API Secret" type={showSecret ? 'text' : 'password'} value={creds.apiSecret} onChange={(v) => setCreds((c) => ({ ...c, apiSecret: v }))} placeholder="API key secret" suffix={
                <button type="button" onClick={() => setShowSecret(!showSecret)} className="text-muted-foreground hover:text-foreground">
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              } />
              <Field label="TwiML App SID" value={creds.twimlAppSid} onChange={(v) => setCreds((c) => ({ ...c, twimlAppSid: v }))} placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => saveMutation.mutate(creds)} disabled={saveMutation.isPending || !creds.accountSid || !creds.authToken} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors">
            {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save Credentials
          </button>
          {status?.configured && (
            <button onClick={() => testMutation.mutate()} disabled={testMutation.isPending} className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent text-sm transition-colors">
              {testMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Test Connection
            </button>
          )}
        </div>
      </div>

      {/* Phone Numbers */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Phone Numbers</h3>
          <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Sync from Twilio
          </button>
        </div>
        <div className="space-y-2">
          {(phoneNumbers || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No phone numbers synced yet. Click Sync to import from Twilio.</p>
          ) : (
            (phoneNumbers || []).map((n: any) => (
              <div key={n.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.phoneNumber}</p>
                  {n.friendlyName && <p className="text-xs text-muted-foreground">{n.friendlyName}</p>}
                </div>
                <div className="flex gap-2">
                  {n.capabilities?.sms && <span className="text-xs bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded">SMS</span>}
                  {n.capabilities?.voice && <span className="text-xs bg-green-400/10 text-green-400 px-2 py-0.5 rounded">Voice</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Usage */}
      {usage?.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">This Month&apos;s Usage</h3>
          <div className="space-y-2">
            {usage.slice(0, 5).map((u: any) => (
              <div key={u.category} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground capitalize">{u.category}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">{u.count}</span>
                  {u.price && <span className="text-xs text-muted-foreground ml-2">{u.priceUnit}{u.price}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', suffix }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm font-mono"
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    </div>
  );
}
