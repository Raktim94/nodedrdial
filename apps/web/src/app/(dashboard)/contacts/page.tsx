'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '@/lib/api';
import { formatDate, formatPhone, getInitials } from '@/lib/utils';
import {
  Users, Plus, Search, Upload, Download, Trash2, Edit, Phone, Mail, Loader2, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const qc = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', search],
    queryFn: () => contactsApi.list({ search, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: editing ? (d: any) => contactsApi.update(editing.id, d) : contactsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] });
      setShowForm(false);
      setEditing(null);
      toast.success(editing ? 'Contact updated' : 'Contact created');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); toast.success('Deleted'); },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: () => fetch('/api/contacts/bulk', { method: 'DELETE', body: JSON.stringify({ ids: selected }), headers: { 'Content-Type': 'application/json' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); setSelected([]); },
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await contactsApi.importCsv(file);
      toast.success(`Imported: ${result.created} created, ${result.updated} updated`);
      qc.invalidateQueries({ queryKey: ['contacts'] });
    } catch { toast.error('Import failed'); }
  };

  const handleExport = async () => {
    const blob = await contactsApi.exportCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const openEdit = (contact: any) => {
    setEditing(contact);
    Object.entries(contact).forEach(([k, v]) => setValue(k as any, v));
    setShowForm(true);
  };

  const openCreate = () => { setEditing(null); reset(); setShowForm(true); };

  const toggleSelect = (id: string) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Contacts</h2>
          <p className="text-sm text-muted-foreground">{contacts?.meta?.total || 0} total contacts</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={() => bulkDeleteMutation.mutate()} className="flex items-center gap-1.5 px-3 py-2 text-sm text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete ({selected.length})
            </button>
          )}
          <label className="flex items-center gap-1.5 px-3 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <Upload className="w-4 h-4" /> Import
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm text-foreground border border-border rounded-lg hover:bg-accent transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, email..." className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-10 px-4 py-3"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? (contacts?.data || []).map((c: any) => c.id) : [])} className="rounded" /></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Tags</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" /></td></tr>
            ) : (contacts?.data || []).length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No contacts found</p>
              </td></tr>
            ) : (
              (contacts?.data || []).map((c: any) => (
                <tr key={c.id} className="hover:bg-accent transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {getInitials(c.firstName, c.lastName)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.firstName} {c.lastName}</p>
                        {c.isOptedOut && <span className="text-xs text-destructive">Opted out</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <a href={`tel:${c.phone}`} className="text-sm text-foreground hover:text-primary flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />{formatPhone(c.phone)}
                    </a>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {c.email ? <a href={`mailto:${c.email}`} className="text-sm text-foreground hover:text-primary flex items-center gap-1.5"><Mail className="w-3 h-3" />{c.email}</a> : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden xl:table-cell">{c.company || '—'}</td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {(c.tags || []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contact Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg p-6 animate-fadeIn overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground">{editing ? 'Edit Contact' : 'New Contact'}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
                  <input {...register('firstName', { required: true })} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                  <input {...register('lastName')} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone *</label>
                <input {...register('phone', { required: true })} placeholder="+1234567890" className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input {...register('email')} type="email" className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Company</label>
                <input {...register('company')} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
                <textarea {...register('notes')} rows={3} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors flex items-center gap-2">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
