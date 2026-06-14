'use client';
import { useCallStore } from '@/lib/store';
import { Phone, PhoneOff, Mic, MicOff, Pause, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDuration } from '@/lib/utils';
import { callsApi } from '@/lib/api';
import { toast } from 'sonner';

export function ActiveCallBanner() {
  const { activeCall, clearCall, toggleMute, toggleHold } = useCallStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeCall || activeCall.status !== 'in-progress') { setElapsed(0); return; }
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  if (!activeCall) return null;

  const handleHangup = async () => {
    if (activeCall.id) {
      try { await callsApi.hangup(activeCall.id); } catch {}
    }
    clearCall();
    toast.info('Call ended');
  };

  return (
    <div className="bg-card border-b border-border px-6 py-2 flex items-center justify-between gap-4 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
            <Phone className="w-4 h-4 text-success" />
          </div>
          {activeCall.status === 'in-progress' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse-ring" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{activeCall.direction === 'inbound' ? activeCall.from : activeCall.to}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {activeCall.status === 'in-progress' ? formatDuration(elapsed) : activeCall.status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-lg transition-colors ${activeCall.isMuted ? 'bg-warning/10 text-warning' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}
          title={activeCall.isMuted ? 'Unmute' : 'Mute'}
        >
          {activeCall.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button
          onClick={toggleHold}
          className={`p-2 rounded-lg transition-colors ${activeCall.isOnHold ? 'bg-warning/10 text-warning' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}
          title={activeCall.isOnHold ? 'Resume' : 'Hold'}
        >
          <Pause className="w-4 h-4" />
        </button>
        <button
          onClick={handleHangup}
          className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
          title="End call"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
