import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function getInitials(firstName: string, lastName?: string): string {
  return `${firstName[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    dealer: 'Dealer',
    org_owner: 'Owner',
    manager: 'Manager',
    agent: 'Agent',
  };
  return labels[role] || role;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    delivered: 'text-success',
    sent: 'text-blue-400',
    received: 'text-green-400',
    failed: 'text-destructive',
    queued: 'text-muted-foreground',
    completed: 'text-success',
    'in-progress': 'text-yellow-400',
    running: 'text-blue-400',
  };
  return colors[status] || 'text-muted-foreground';
}
