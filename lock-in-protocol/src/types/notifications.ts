export interface NotificationPreferences {
  scheduleReminders: boolean;
  pomodoroBreaks: boolean;
  workoutReminders: boolean;
  mealReminders: boolean;
  supplementReminders: boolean;
  weeklyReviews: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminderTime: number; // minutes before activity
}

export interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  scheduledTime: Date;
  type: NotificationType;
  tag: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export enum NotificationType {
  SCHEDULE_REMINDER = 'schedule_reminder',
  POMODORO_BREAK = 'pomodoro_break',
  WORKOUT_TIME = 'workout_time',
  MEAL_REMINDER = 'meal_reminder',
  SUPPLEMENT_REMINDER = 'supplement_reminder',
  WEEKLY_REVIEW = 'weekly_review',
  GENERAL = 'general'
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface NotificationContextType {
  permission: NotificationPermission;
  preferences: NotificationPreferences;
  scheduledNotifications: ScheduledNotification[];
  requestPermission: () => Promise<boolean>;
  scheduleNotification: (notification: Omit<ScheduledNotification, 'id'>) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  registerServiceWorker: () => Promise<boolean>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}