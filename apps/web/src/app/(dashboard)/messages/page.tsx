'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi, contactsApi, aiApi } from '@/lib/api';
import { formatRelative, formatPhone, cn } from '@/lib/utils';
import { Send, Plus, Search, Inbox, Filter, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function MessagesPage() {
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [compose, setCompose] = useState({ to: '', from: '', body: '' });
  const [showCompose, setShowCompose] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const qc = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', search],
    queryFn: () => messagesApi.list({ search, limit: 100 }),
  });

  const { data: phoneNumbers } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: () => import('@/lib/api').then((m) => m.twilioApi.phoneNumbers()),
  });

  const { data: conversation } = useQuery({
    queryKey: ['conversation', selected?.contactId],
    queryFn: () => messagesApi.conversation(selected.contactId),
    enabled: !!selected?.contactId,
  });

  const sendMutation = useMutation({
    mutationFn: messagesApi.send,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      if (selected) qc.invalidateQueries({ queryKey: ['conversation', selected.contactId] });
      setCompose((c) => ({ ...c, body: '' }));
      setShowCompose(false);
      toast.success('Message sent');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send'),
  });

  const getSuggestions = async () => {
    if (!selected?.body) return;
    const suggestions = await aiApi.suggestReply(selected.body);
    setAiSuggestions(Array.isArray(suggestions) ? suggestions : []);
  };

  // Group messages by conversation
  const conversations = (messages?.data || []).reduce((acc: any, msg: any) => {
    const key = msg.contactId || (msg.direction === 'inbound' ? msg.fromNumber : msg.toNumber);
    if (!acc[key]) acc[key] = { messages: [], lastMessage: msg, key };
    acc[key].messages.push(msg);
    return acc;
  }, {});

  const convList = Object.values(conversations).sort((a: any, b: any) =>
    new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );

  return (
    <div className="h-full flex rounded-xl border border-border bg-card overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Conversation List */}
      <div className={cn('w-80 border-r border-border flex flex-col shrink-0', selected && 'hidden md:flex')}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Inbox className="w-4 h-4" /> Messages
            </h2>
            <button onClick={() => setShowCompose(true)} className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : convList.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            convList.map((conv: any) => {
              const last = conv.lastMessage;
              const isSelected = selected?.key === conv.key;
              return (
                <button
                  key={conv.key}
                  onClick={() => setSelected(last)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-border hover:bg-accent transition-colors',
                    isSelected && 'bg-primary/5 border-l-2 border-l-primary',
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatPhone(last.direction === 'inbound' ? last.fromNumber : last.toNumber)}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{formatRelative(last.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs shrink-0', last.direction === 'inbound' ? 'text-success' : 'text-primary')}>
                      {last.direction === 'inbound' ? '←' : '→'}
                    </span>
                    <p className="text-xs text-muted-foreground truncate">{last.body}</p>
                    {!last.isRead && last.direction === 'inbound' && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Conversation View */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          <div className="px-5 py-3 border-b border-border flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="md:hidden text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="font-semibold text-foreground">
                {formatPhone(selected.direction === 'inbound' ? selected.fromNumber : selected.toNumber)}
              </p>
              <p className="text-xs text-muted-foreground">{selected.direction === 'inbound' ? selected.fromNumber : selected.toNumber}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(conversation?.data || [selected]).map((msg: any) => (
              <div key={msg.id} className={cn('flex', msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                  msg.direction === 'outbound' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm',
                )}>
                  <p>{msg.body}</p>
                  <p className="text-xs opacity-60 mt-1">{formatRelative(msg.createdAt)} · {msg.status}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto">
              {aiSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setCompose((c) => ({ ...c, body: s })); setAiSuggestions([]); }}
                  className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-primary/20 transition-colors"
                >
                  {s.substring(0, 50)}...
                </button>
              ))}
            </div>
          )}

          {/* Reply box */}
          <div className="p-4 border-t border-border flex gap-3">
            <button onClick={getSuggestions} className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="AI Suggestions">
              <Sparkles className="w-5 h-5" />
            </button>
            <textarea
              value={compose.body}
              onChange={(e) => setCompose((c) => ({ ...c, body: e.target.value }))}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-3 py-2.5 bg-muted border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (compose.body.trim()) {
                    sendMutation.mutate({
                      to: selected.direction === 'inbound' ? selected.fromNumber : selected.toNumber,
                      from: (phoneNumbers?.[0]?.phoneNumber || selected.toNumber),
                      body: compose.body,
                    });
                  }
                }
              }}
            />
            <button
              onClick={() => sendMutation.mutate({
                to: selected.direction === 'inbound' ? selected.fromNumber : selected.toNumber,
                from: (phoneNumbers?.[0]?.phoneNumber || selected.toNumber),
                body: compose.body,
              })}
              disabled={!compose.body.trim() || sendMutation.isPending}
              className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <Inbox className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Select a conversation</p>
            <p className="text-sm text-muted-foreground mt-1">or click + to send a new message</p>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 animate-fadeIn">
            <h3 className="font-semibold text-foreground mb-4">New Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">To</label>
                <input value={compose.to} onChange={(e) => setCompose((c) => ({ ...c, to: e.target.value }))} placeholder="+1234567890" className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">From</label>
                <select value={compose.from} onChange={(e) => setCompose((c) => ({ ...c, from: e.target.value }))} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm">
                  {(phoneNumbers || []).map((n: any) => <option key={n.id} value={n.phoneNumber}>{n.phoneNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                <textarea value={compose.body} onChange={(e) => setCompose((c) => ({ ...c, body: e.target.value }))} rows={4} placeholder="Type your message..." className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm resize-none" />
                <p className="text-xs text-muted-foreground mt-1">{compose.body.length}/160 chars</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCompose(false)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent text-sm transition-colors">Cancel</button>
                <button onClick={() => sendMutation.mutate(compose)} disabled={!compose.to || !compose.body || sendMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm flex items-center gap-2 transition-colors">
                  {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
