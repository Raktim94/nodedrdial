'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { User, Shield, Key, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [qrCode, setQrCode] = useState('');
  const [totp, setTotp] = useState('');

  const updateMutation = useMutation({
    mutationFn: (d: any) => usersApi.update(user!.id, d),
    onSuccess: () => toast.success('Profile updated'),
    onError: () => toast.error('Update failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => { setPasswords({ currentPassword: '', newPassword: '', confirm: '' }); toast.success('Password changed'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (d) => setQrCode(d.qrCode),
  });

  const enable2FAMutation = useMutation({
    mutationFn: (code: string) => authApi.enable2FA(code),
    onSuccess: () => { setQrCode(''); setTotp(''); toast.success('2FA enabled'); },
    onError: () => toast.error('Invalid code'),
  });

  return (
    <div className="space-y-6 max-w-xl">
      {/* Profile */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Profile</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
              <input value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
              <input value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input value={user?.email || ''} disabled className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-muted-foreground text-sm cursor-not-allowed" />
          </div>
          <button onClick={() => updateMutation.mutate(profile)} disabled={updateMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors">
            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
            <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
            <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))} className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <button onClick={() => passwordMutation.mutate(passwords)} disabled={passwordMutation.isPending || !passwords.currentPassword || !passwords.newPassword} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-colors">
            {passwordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Change Password
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Two-Factor Authentication</h3>
        {!qrCode ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Protect your account with an authenticator app like Google Authenticator or Authy.</p>
            <button onClick={() => setup2FAMutation.mutate()} disabled={setup2FAMutation.isPending} className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent text-sm transition-colors">
              {setup2FAMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Set Up 2FA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app:</p>
            <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 rounded-lg border border-border" />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Enter the 6-digit code</label>
              <input value={totp} onChange={(e) => setTotp(e.target.value)} inputMode="numeric" maxLength={6} placeholder="000000" className="w-32 px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground text-center text-lg tracking-widest focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <button onClick={() => enable2FAMutation.mutate(totp)} disabled={totp.length !== 6 || enable2FAMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 disabled:opacity-50 text-sm font-medium transition-colors">
              {enable2FAMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Enable 2FA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
