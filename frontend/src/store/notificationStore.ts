import { create } from 'zustand';
import type { Notification } from '../types';
import api from '../services/api';

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      // Fetch only unread notifications by default
      const { data } = await api.get<Notification[]>('/api/notifications?unread=true');
      set({ notifications: data });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },
}));
