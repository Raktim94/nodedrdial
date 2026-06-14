'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { formatRelative } from '@/lib/utils';
import { Bell, CheckCheck, MessageSquare, Phone, Megaphone, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUIStore } from '@/lib/store';

const icons: Record<string, any> = {
  new_message: MessageSquare,
  missed_call: Phone,
  campaign_completed: Megaphone,
  system_alert: AlertCircle,
};

export default function NotificationsPage() {
  const { setUnreadNotifications } = useUIStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 50 }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadNotifications(0);
      toast.success('All marked as read');
    },
  });

  const markOneMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          {data?.unread > 0 && <p className="text-sm text-muted-foreground">{data.unread} unread</p>}
        </div>
        {data?.unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (data?.data || []).length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(data?.data || []).map((n: any) => {
              const Icon = icons[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markOneMutation.mutate(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-accent transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/3' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`w-4 h-4 ${!n.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>{n.title}</p>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatRelative(n.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
