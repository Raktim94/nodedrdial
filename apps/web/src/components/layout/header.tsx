'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Search, Settings } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/messages': 'Messages',
  '/calls': 'Calls',
  '/contacts': 'Contacts',
  '/campaigns': 'Campaigns',
  '/templates': 'Templates',
  '/notifications': 'Notifications',
  '/settings/twilio': 'Twilio Settings',
  '/settings/team': 'Team Management',
  '/settings/profile': 'Profile',
  '/settings/webhooks': 'Webhooks',
  '/settings/api-keys': 'API Keys',
  '/admin': 'Admin Portal',
  '/dealer': 'Dealer Portal',
};

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { unreadNotifications } = useUIStore();
  const router = useRouter();

  const title = pageTitles[pathname] || pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    logout();
    router.push('/login');
    toast.success('Logged out');
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-foreground capitalize">{title}</h1>

      <div className="flex items-center gap-2">
        <Link href="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>

        <Link href="/settings/profile" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </Link>

        <button
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
