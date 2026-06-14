'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, messagesApi, callsApi } from '@/lib/api';
import {
  MessageSquare, PhoneCall, Users, Megaphone, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatDate, formatRelative } from '@/lib/utils';

export default function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ['analytics', 'dashboard'], queryFn: analyticsApi.dashboard });
  const { data: msgActivity } = useQuery({ queryKey: ['analytics', 'messages', 30], queryFn: () => analyticsApi.messageActivity(30) });
  const { data: callActivity } = useQuery({ queryKey: ['analytics', 'calls', 30], queryFn: () => analyticsApi.callActivity(30) });
  const { data: recentMessages } = useQuery({ queryKey: ['messages', 'recent'], queryFn: () => messagesApi.list({ limit: 5 }) });

  const statCards = [
    { label: 'Messages Sent', value: stats?.totalMessages || 0, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Calls Made', value: stats?.totalCalls || 0, icon: PhoneCall, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Total Contacts', value: stats?.totalContacts || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Campaigns', value: stats?.totalCampaigns || 0, icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Message Activity */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Message Activity (30 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={msgActivity || []}>
              <defs>
                <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.22 264)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.62 0.18 145)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.62 0.18 145)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 264)" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'oklch(0.13 0.01 264)', border: '1px solid oklch(0.22 0.01 264)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="sent" stroke="oklch(0.55 0.22 264)" fill="url(#sentGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="received" stroke="oklch(0.62 0.18 145)" fill="url(#receivedGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Call Activity */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Call Activity (30 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={callActivity || []}>
              <defs>
                <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.18 70)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.75 0.18 70)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 264)" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'oklch(0.55 0.01 264)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'oklch(0.13 0.01 264)', border: '1px solid oklch(0.22 0.01 264)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="outbound" stroke="oklch(0.75 0.18 70)" fill="url(#outGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="inbound" stroke="oklch(0.60 0.22 25)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Inbound Messages', value: stats?.inboundMessages || 0 },
          { label: 'Outbound Messages', value: stats?.outboundMessages || 0 },
          { label: 'Inbound Calls', value: stats?.inboundCalls || 0 },
          { label: 'Outbound Calls', value: stats?.outboundCalls || 0 },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-xl font-bold text-foreground">{s.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Messages */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Messages</h3>
          <a href="/messages" className="text-xs text-primary hover:underline">View all</a>
        </div>
        <div className="space-y-3">
          {(recentMessages?.data || []).map((msg: any) => (
            <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${msg.direction === 'inbound' ? 'bg-success' : 'bg-primary'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{msg.direction === 'inbound' ? msg.fromNumber : msg.toNumber}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelative(msg.createdAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.body}</p>
              </div>
            </div>
          ))}
          {(!recentMessages?.data?.length) && (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
