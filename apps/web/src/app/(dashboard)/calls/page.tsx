'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callsApi, twilioApi } from '@/lib/api';
import { useCallStore } from '@/lib/store';
import { formatRelative, formatDuration, formatPhone, cn } from '@/lib/utils';
import {
  Phone, PhoneCall, PhoneIncoming, PhoneOff, PhoneMissed,
  Mic, MicOff, Pause, Hash, Delete, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window { Twilio: any; }
}

export default function CallsPage() {
  const [showDialpad, setShowDialpad] = useState(false);
  const [dialNumber, setDialNumber] = useState('');
  const [device, setDevice] = useState<any>(null);
  const [deviceReady, setDeviceReady] = useState(false);
  const { activeCall, setActiveCall, clearCall, toggleMute, toggleHold } = useCallStore();
  const qc = useQueryClient();

  const { data: calls, isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: () => callsApi.list({ limit: 100 }),
  });

  const { data: phoneNumbers } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: twilioApi.phoneNumbers,
  });

  const makeCallMutation = useMutation({
    mutationFn: (data: any) => callsApi.make(data),
    onSuccess: (call) => {
      setActiveCall({ id: call.id, direction: 'outbound', status: 'queued', from: call.fromNumber, to: call.toNumber, isMuted: false, isOnHold: false, isRecording: false });
      qc.invalidateQueries({ queryKey: ['calls'] });
      setShowDialpad(false);
      setDialNumber('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Call failed'),
  });

  // Initialize Twilio Device
  useEffect(() => {
    let mounted = true;
    async function initDevice() {
      try {
        const { token } = await twilioApi.voiceToken();
        const { Device } = await import('@twilio/voice-sdk');
        const dev = new Device(token, { codecPreferences: ['opus', 'pcmu'] as any });
        dev.on('ready', () => { if (mounted) setDeviceReady(true); });
        dev.on('incoming', (conn: any) => {
          if (mounted) {
            setActiveCall({
              direction: 'inbound', status: 'ringing',
              from: conn.parameters.From, to: conn.parameters.To,
              isMuted: false, isOnHold: false, isRecording: false,
            });
            conn.accept();
          }
        });
        dev.on('disconnect', () => { if (mounted) clearCall(); });
        if (mounted) setDevice(dev);
      } catch {
        // Twilio credentials not configured — dialpad still works via REST
      }
    }
    initDevice();
    return () => { mounted = false; };
  }, []);

  const handleDial = (digit: string) => setDialNumber((p) => p + digit);
  const handleBackspace = () => setDialNumber((p) => p.slice(0, -1));

  const dialpadKeys = ['1','2','3','4','5','6','7','8','9','*','0','#'];

  const callIcon = (status: string, direction: string) => {
    if (status === 'completed') return direction === 'inbound' ? PhoneIncoming : PhoneCall;
    if (status === 'no-answer' || status === 'busy') return PhoneMissed;
    if (status === 'failed') return PhoneOff;
    return PhoneCall;
  };

  const statusColor = (status: string) => ({
    completed: 'text-success', failed: 'text-destructive', 'no-answer': 'text-warning', busy: 'text-warning',
  })[status] || 'text-muted-foreground';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Call Center</h2>
          <p className="text-sm text-muted-foreground">{deviceReady ? 'Softphone ready' : 'Browser calling not configured'}</p>
        </div>
        <button
          onClick={() => setShowDialpad(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Phone className="w-4 h-4" /> Make a Call
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Calls', key: 'total' },
          { label: 'Inbound', key: 'inbound' },
          { label: 'Outbound', key: 'outbound' },
          { label: 'Missed', key: 'missed' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Call History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Call History</h3>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (calls?.data || []).length === 0 ? (
            <div className="text-center py-12">
              <PhoneCall className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No calls yet</p>
            </div>
          ) : (
            (calls?.data || []).map((call: any) => {
              const Icon = callIcon(call.status, call.direction);
              return (
                <div key={call.id} className="px-5 py-4 flex items-center gap-4 hover:bg-accent transition-colors">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', call.direction === 'inbound' ? 'bg-blue-400/10' : 'bg-green-400/10')}>
                    <Icon className={cn('w-4 h-4', call.direction === 'inbound' ? 'text-blue-400' : 'text-green-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatPhone(call.direction === 'inbound' ? call.fromNumber : call.toNumber)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {call.direction} · {call.duration ? formatDuration(call.duration) : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-xs font-medium capitalize', statusColor(call.status))}>{call.status}</p>
                    <p className="text-xs text-muted-foreground">{formatRelative(call.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => makeCallMutation.mutate({ to: call.direction === 'inbound' ? call.fromNumber : call.toNumber, from: phoneNumbers?.[0]?.phoneNumber })}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dialpad Modal */}
      {showDialpad && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-80 p-6 animate-fadeIn softphone-container">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Softphone</h3>
              <button onClick={() => setShowDialpad(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {/* Number display */}
            <div className="bg-muted rounded-xl px-4 py-4 mb-4 flex items-center justify-between">
              <span className="text-xl font-mono text-foreground tracking-widest">{dialNumber || 'Enter number'}</span>
              {dialNumber && (
                <button onClick={handleBackspace} className="text-muted-foreground hover:text-foreground">
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* From number */}
            <select className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm text-foreground mb-4 focus:outline-none focus:ring-1 focus:ring-ring">
              {(phoneNumbers || []).map((n: any) => <option key={n.id} value={n.phoneNumber}>{n.phoneNumber}</option>)}
            </select>

            {/* Dialpad */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {dialpadKeys.map((k) => (
                <button
                  key={k}
                  onClick={() => handleDial(k)}
                  className="h-14 rounded-xl bg-muted hover:bg-accent text-foreground font-semibold text-lg transition-colors active:scale-95"
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Call button */}
            <button
              onClick={() => {
                if (!dialNumber) return;
                makeCallMutation.mutate({ to: dialNumber, from: phoneNumbers?.[0]?.phoneNumber });
              }}
              disabled={!dialNumber || makeCallMutation.isPending}
              className="w-full h-14 bg-success rounded-xl flex items-center justify-center text-white font-medium hover:bg-success/90 disabled:opacity-50 transition-all"
            >
              {makeCallMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Phone className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
