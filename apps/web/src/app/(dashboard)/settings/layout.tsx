'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Users, Phone, Webhook, Key } from 'lucide-react';

const tabs = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/team', label: 'Team', icon: Users },
  { href: '/settings/twilio', label: 'Twilio', icon: Phone },
  { href: '/settings/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/settings/api-keys', label: 'API Keys', icon: Key },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and organization settings</p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
