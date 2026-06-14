'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Plus, Edit2, Trash2, Copy, X, Loader2 } from 'lucide-react';

export default function TemplatesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', body: '', category: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (d: any) => editing ? templatesApi.update(editing.id, d) : templatesApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', body: '', category: '' });
      toast.success(editing ? 'Template updated' : 'Template created');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: templatesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['templates'] }); toast.success('Template deleted'); },
  });

  const openEdit = (template: any) => {
    setEditing(template);
    setForm({ name: template.name, body: template.body, category: template.category || '' });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', body: '', category: '' });
    setShowModal(true);
  };

  const copyBody = (body: string) => {
    navigator.clipboard.writeText(body);
    toast.success('Copied to clipboard');
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{(\w+)\}/g) || [];
    return [...new Set(matches)];
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{data?.meta?.total || 0} saved templates</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (data?.data || []).length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">No templates yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create reusable message templates with variables</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.data || []).map((template: any) => {
            const vars = extractVariables(template.body);
            return (
              <div key={template.id} className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{template.name}</h3>
                    {template.category && (
                      <span className="text-xs text-muted-foreground">{template.category}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyBody(template.body)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Copy body">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEdit(template)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(template.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{template.body}</p>

                {vars.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {vars.map((v) => (
                      <span key={v} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{v}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{template.body.length} chars</span>
                  <span className="text-xs text-muted-foreground">Used {template.usageCount || 0}×</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">{editing ? 'Edit Template' : 'New Template'}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Template Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Appointment Reminder"
                    className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Category (optional)</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="e.g. Reminders"
                    className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Message Body
                  <span className="ml-2 text-xs font-normal text-muted-foreground">Use {'{firstName}'}, {'{company}'} for variables</span>
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  rows={5}
                  placeholder="Hi {firstName}, your appointment at {company} is confirmed for {date}."
                  className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                <div className="flex justify-between mt-1">
                  <div className="flex gap-1">
                    {extractVariables(form.body).map((v) => (
                      <span key={v} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{v}</span>
                    ))}
                  </div>
                  <span className={`text-xs ${form.body.length > 160 ? 'text-warning' : 'text-muted-foreground'}`}>
                    {form.body.length} chars
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent text-sm transition-colors">Cancel</button>
                <button
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending || !form.name || !form.body}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
