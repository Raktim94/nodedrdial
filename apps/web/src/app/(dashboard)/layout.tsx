'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ActiveCallBanner } from '@/components/calls/active-call-banner';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUIStore } from '@/lib/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { setUnreadNotifications } = useUIStore();
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/login');
  }, []);

  useWebSocket({
    onMessage: (data) => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      toast.info(`New message from ${data.message.fromNumber}`, {
        description: data.message.body.substring(0, 60),
        action: { label: 'View', onClick: () => router.push('/messages') },
      });
    },
    onCall: (data) => {
      toast.info(`Incoming call from ${data.call.fromNumber}`, {
        description: data.contact?.firstName ? `${data.contact.firstName} ${data.contact.lastName || ''}` : 'Unknown caller',
        duration: 30000,
      });
    },
    onNotification: (data) => {
      setUnreadNotifications((prev: number) => prev + 1);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (!isAuthenticated()) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <ActiveCallBanner />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fadeIn">
            {children}
          </div>
          <footer className="mt-8 pt-4 border-t border-border">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>
                TwilioHub OSS by{' '}
                <a href="https://www.nodedr.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Nodedr Infotech Pvt Ltd
                </a>
                {' '}— MIT License
              </p>
              <nav aria-label="Legal" className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link>
              </nav>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
