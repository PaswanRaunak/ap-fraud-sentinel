'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'Controller' | 'AP Analyst' | 'Internal Auditor' | 'CFO';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  avatar: string;
  createdAt: string;
}

export type AuthTab = 'login' | 'register' | 'forgot';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthTab;

  openAuthModal: (tab?: AuthTab) => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: AuthTab) => void;

  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role?: UserRole) => void;
  register: (name: string, email: string, company: string, role: UserRole, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      authModalTab: 'login',

      openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      setAuthModalTab: (tab: AuthTab) => set({ authModalTab: tab }),

      login: async (email: string) => {
        if (!email.includes('@')) {
          return { success: false, error: 'Please enter a valid work email address' };
        }
        const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = namePart
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') || 'Finance Lead';

        const user: AuthUser = {
          id: `user-${Date.now()}`,
          name: formattedName,
          email: email.toLowerCase(),
          role: 'Controller',
          company: 'Sentinel Enterprise',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=0284c7`,
          createdAt: new Date().toISOString(),
        };

        set({ user, isAuthenticated: true, isAuthModalOpen: false });
        return { success: true };
      },

      demoLogin: (role: UserRole = 'Controller') => {
        const user: AuthUser = {
          id: 'demo-admin-001',
          name: 'Raunak Paswan',
          email: 'controller@sentinelcharge.com',
          role,
          company: 'Sentinel Payments Corp',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Raunak+Paswan&backgroundColor=00668c',
          createdAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true, isAuthModalOpen: false });
      },

      register: async (name: string, email: string, company: string, role: UserRole) => {
        if (!name.trim() || !email.includes('@') || !company.trim()) {
          return { success: false, error: 'Please fill all required fields.' };
        }

        const user: AuthUser = {
          id: `user-${Date.now()}`,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role,
          company: company.trim(),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=00668c`,
          createdAt: new Date().toISOString(),
        };

        set({ user, isAuthenticated: true, isAuthModalOpen: false });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, isAuthModalOpen: false });
      },
    }),
    {
      name: 'ap-fraud-auth-session',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
