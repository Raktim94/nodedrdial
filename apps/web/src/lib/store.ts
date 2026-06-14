import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  dealerId?: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isSuperAdmin: () => boolean;
  isDealer: () => boolean;
  isOrgOwner: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      isAuthenticated: () => !!get().accessToken && !!get().user,
      isSuperAdmin: () => get().user?.role === 'super_admin',
      isDealer: () => get().user?.role === 'dealer',
      isOrgOwner: () => get().user?.role === 'org_owner',
    }),
    {
      name: 'twiliohub-auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    },
  ),
);

interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  unreadNotifications: 0,
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
}));

interface CallStore {
  activeCall: {
    id?: string;
    twilioSid?: string;
    direction: 'inbound' | 'outbound';
    status: string;
    from: string;
    to: string;
    contactName?: string;
    startedAt?: Date;
    isMuted: boolean;
    isOnHold: boolean;
    isRecording: boolean;
  } | null;
  setActiveCall: (call: CallStore['activeCall']) => void;
  updateCallStatus: (status: string) => void;
  clearCall: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
  activeCall: null,
  setActiveCall: (call) => set({ activeCall: call }),
  updateCallStatus: (status) => set((s) => s.activeCall ? { activeCall: { ...s.activeCall, status } } : {}),
  clearCall: () => set({ activeCall: null }),
  toggleMute: () => set((s) => s.activeCall ? { activeCall: { ...s.activeCall, isMuted: !s.activeCall.isMuted } } : {}),
  toggleHold: () => set((s) => s.activeCall ? { activeCall: { ...s.activeCall, isOnHold: !s.activeCall.isOnHold } } : {}),
}));
