'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  NotificationContextType,
  NotificationPreferences,
  ScheduledNotification,
  NotificationPermission,
  NotificationType
} from '@/types/notifications';

const defaultPreferences: NotificationPreferences = {
  scheduleReminders: true,
  pomodoroBreaks: true,
  workoutReminders: true,
  mealReminders: true,
  supplementReminders: true,
  weeklyReviews: true,
  soundEnabled: true,
  vibrationEnabled: true,
  reminderTime: 5 // 5 minutes before
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize notification permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const notificationPermission = Notification.permission;
      setPermission({
        granted: notificationPermission === 'granted',
        denied: notificationPermission === 'denied',
        default: notificationPermission === 'default'
      });
    }
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('notification-preferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }

      const savedNotifications = localStorage.getItem('scheduled-notifications');
      if (savedNotifications) {
        setScheduledNotifications(JSON.parse(savedNotifications));
      }
    }
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setServiceWorkerRegistration(registration);
      
      // Update service worker if needed
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.info('New app version available. Refresh to update.');
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      const newPermission = {
        granted: result === 'granted',
        denied: result === 'denied',
        default: result === 'default'
      };
      
      setPermission(newPermission);
      
      if (result === 'granted') {
        toast.success('Notifications enabled successfully!');
        return true;
      } else if (result === 'denied') {
        toast.error('Notifications were denied. You can enable them in browser settings.');
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Schedule a notification
  const scheduleNotification = useCallback(async (
    notification: Omit<ScheduledNotification, 'id'>
  ): Promise<string> => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const scheduledNotification: ScheduledNotification = {
      ...notification,
      id
    };

    // Add to local state
    const newNotifications = [...scheduledNotifications, scheduledNotification];
    setScheduledNotifications(newNotifications);
    localStorage.setItem('scheduled-notifications', JSON.stringify(newNotifications));

    // Schedule with service worker if available
    if (serviceWorkerRegistration) {
      serviceWorkerRegistration.active?.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        payload: {
          title: notification.title,
          message: notification.message,
          scheduledTime: notification.scheduledTime.toISOString(),
          tag: notification.tag,
          actions: notification.actions
        }
      });
    } else {
      // Fallback to browser setTimeout for immediate notifications
      const delay = notification.scheduledTime.getTime() - Date.now();
      if (delay > 0 && permission.granted) {
        setTimeout(() => {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: notification.tag,
            silent: !preferences.soundEnabled
          });
        }, delay);
      }
    }

    return id;
  }, [scheduledNotifications, serviceWorkerRegistration, permission.granted, preferences]);

  // Cancel a scheduled notification
  const cancelNotification = useCallback(async (id: string): Promise<void> => {
    const newNotifications = scheduledNotifications.filter(n => n.id !== id);
    setScheduledNotifications(newNotifications);
    localStorage.setItem('scheduled-notifications', JSON.stringify(newNotifications));
  }, [scheduledNotifications]);

  // Update notification preferences
  const updatePreferences = useCallback(async (
    newPreferences: Partial<NotificationPreferences>
  ): Promise<void> => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    localStorage.setItem('notification-preferences', JSON.stringify(updatedPreferences));
    toast.success('Notification preferences updated');
  }, [preferences]);

  // Show toast notification
  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast.info(message);
        break;
    }
  }, []);

  // Auto-register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  const contextValue: NotificationContextType = {
    permission,
    preferences,
    scheduledNotifications,
    requestPermission,
    scheduleNotification,
    cancelNotification,
    updatePreferences,
    showToast,
    registerServiceWorker
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Utility hooks for specific notification types
export function useScheduleNotifications() {
  const { scheduleNotification, preferences } = useNotifications();

  const scheduleActivityReminder = useCallback(async (
    activityName: string,
    activityTime: Date,
    activityType = 'activity'
  ) => {
    if (!preferences.scheduleReminders) {return;}

    const reminderTime = new Date(activityTime.getTime() - (preferences.reminderTime * 60 * 1000));
    
    return scheduleNotification({
      title: 'Upcoming Activity',
      message: `${activityName} (${activityType}) starts in ${preferences.reminderTime} minutes`,
      scheduledTime: reminderTime,
      type: NotificationType.SCHEDULE_REMINDER,
      tag: `activity-reminder-${activityType}-${activityTime.getTime()}`,
      actions: [
        { action: 'view', title: 'View Schedule' },
        { action: 'snooze', title: 'Remind in 5 min' }
      ]
    });
  }, [scheduleNotification, preferences]);

  return { scheduleActivityReminder };
}

export function usePomodoroNotifications() {
  const { scheduleNotification, preferences } = useNotifications();

  const scheduleBreakNotification = useCallback(async (
    breakType: 'short' | 'long',
    breakTime: Date
  ) => {
    if (!preferences.pomodoroBreaks) {return;}

    return scheduleNotification({
      title: 'Pomodoro Break Time',
      message: `Time for a ${breakType} break! You've earned it.`,
      scheduledTime: breakTime,
      type: NotificationType.POMODORO_BREAK,
      tag: `pomodoro-break-${breakTime.getTime()}`,
      actions: [
        { action: 'start-break', title: 'Start Break' },
        { action: 'skip-break', title: 'Skip Break' }
      ]
    });
  }, [scheduleNotification, preferences]);

  return { scheduleBreakNotification };
}

export function useWorkoutNotifications() {
  const { scheduleNotification, preferences } = useNotifications();

  const scheduleWorkoutReminder = useCallback(async (
    workoutName: string,
    workoutTime: Date
  ) => {
    if (!preferences.workoutReminders) {return;}

    const reminderTime = new Date(workoutTime.getTime() - (preferences.reminderTime * 60 * 1000));
    
    return scheduleNotification({
      title: 'Workout Time',
      message: `${workoutName} starts in ${preferences.reminderTime} minutes. Get ready!`,
      scheduledTime: reminderTime,
      type: NotificationType.WORKOUT_TIME,
      tag: `workout-reminder-${workoutTime.getTime()}`,
      actions: [
        { action: 'start-workout', title: 'Start Workout' },
        { action: 'delay', title: 'Delay 10 min' }
      ]
    });
  }, [scheduleNotification, preferences]);

  return { scheduleWorkoutReminder };
}

export function useNutritionNotifications() {
  const { scheduleNotification, preferences } = useNotifications();

  const scheduleMealReminder = useCallback(async (
    mealName: string,
    mealTime: Date
  ) => {
    if (!preferences.mealReminders) {return;}

    return scheduleNotification({
      title: 'Meal Time',
  message: `Time for ${mealName}! Do not forget to log your meal.`,
      scheduledTime: mealTime,
      type: NotificationType.MEAL_REMINDER,
      tag: `meal-reminder-${mealTime.getTime()}`,
      actions: [
        { action: 'log-meal', title: 'Log Meal' },
        { action: 'snooze', title: 'Remind Later' }
      ]
    });
  }, [scheduleNotification, preferences]);

  const scheduleSupplementReminder = useCallback(async (
    supplementName: string,
    supplementTime: Date
  ) => {
    if (!preferences.supplementReminders) {return;}

    return scheduleNotification({
      title: 'Supplement Reminder',
      message: `Time to take your ${supplementName}`,
      scheduledTime: supplementTime,
      type: NotificationType.SUPPLEMENT_REMINDER,
      tag: `supplement-reminder-${supplementTime.getTime()}`,
      actions: [
        { action: 'log-supplement', title: 'Mark Taken' },
        { action: 'snooze', title: 'Remind Later' }
      ]
    });
  }, [scheduleNotification, preferences]);

  return { scheduleMealReminder, scheduleSupplementReminder };
}