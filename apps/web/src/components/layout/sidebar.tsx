'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Phone, Users, Megaphone,
  Settings, Shield, Building2, ChevronRight, PhoneCall,
  Bell, FileText, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/lib/store';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/calls', icon: PhoneCall, label: 'Calls' },
  { href: '/contacts', icon: Users, label: 'Contacts' },
  { href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/templates', icon: FileText, label: 'Templates' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
];

const settingsItems = [
  { href: '/settings/twilio', icon: Phone, label: 'Twilio' },
  { href: '/settings/team', icon: Users, label: 'Team' },
  { href: '/settings/profile', icon: Settings, label: 'Profile' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className={cn(
      'flex flex-col bg-card border-r border-border transition-all duration-300 shrink-0',
      sidebarOpen ? 'w-64' : 'w-16',
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">TwilioHub</span>
          </Link>
        )}
        {!sidebarOpen && (
          <Link href="/dashboard" className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <Phone className="w-4 h-4 text-primary-foreground" />
          </Link>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} collapsed={!sidebarOpen} />
        ))}

        <div className={cn('pt-4 mt-4 border-t border-border', sidebarOpen && 'pb-1')}>
          {sidebarOpen && <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Settings</p>}
          {settingsItems.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} collapsed={!sidebarOpen} />
          ))}
        </div>

        {(user?.role === 'super_admin' || user?.role === 'dealer') && (
          <div className={cn('pt-4 mt-4 border-t border-border', sidebarOpen && 'pb-1')}>
            {sidebarOpen && <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {user.role === 'super_admin' ? 'Super Admin' : 'Dealer'}
            </p>}
            {user?.role === 'super_admin' && (
              <>
                <NavItem href="/admin" icon={Shield} label="Admin Portal" active={isActive('/admin')} collapsed={!sidebarOpen} />
                <NavItem href="/admin/organizations" icon={Building2} label="Organizations" active={isActive('/admin/organizations')} collapsed={!sidebarOpen} />
              </>
            )}
            {user?.role === 'dealer' && (
              <NavItem href="/dealer" icon={Building2} label="Dealer Portal" active={isActive('/dealer')} collapsed={!sidebarOpen} />
            )}
          </div>
        )}
      </nav>

      {/* User info */}
      {sidebarOpen && user && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavItem({ href, icon: Icon, label, active, collapsed }: {
  href: string; icon: any; label: string; active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed && 'justify-center px-0',
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
