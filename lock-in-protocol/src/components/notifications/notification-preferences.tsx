'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/use-notifications';
import { Bell, BellOff, Volume2, VolumeX, Vibrate } from 'lucide-react';

export function NotificationPreferences() {
  const { 
    permission, 
    preferences, 
    requestPermission, 
    updatePreferences,
    scheduledNotifications 
  } = useNotifications();

  const handlePermissionRequest = async () => {
    await requestPermission();
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean | number) => {
    updatePreferences({ [key]: value });
  };

  const reminderTimeOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' }
  ];

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {permission.granted ? (
              <Bell className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-red-500" />
            )}
            Notification Permission
          </CardTitle>
          <CardDescription>
            Manage browser notification permissions for this app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Browser Notifications</p>
              <p className="text-sm text-muted-foreground">
                {permission.granted && 'Notifications are enabled'}
                {permission.denied && 'Notifications are blocked - enable in browser settings'}
                {permission.default && 'Click to enable notifications'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={permission.granted ? 'default' : 'secondary'}>
                {permission.granted ? 'Enabled' : permission.denied ? 'Blocked' : 'Not Set'}
              </Badge>
              {!permission.granted && !permission.denied && (
                <Button onClick={handlePermissionRequest} variant="outline" size="sm">
                  Enable
                </Button>
              )}
            </div>
          </div>

          {scheduledNotifications.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {scheduledNotifications.length} notification(s) scheduled
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="schedule-reminders">Schedule Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before your scheduled activities
                </p>
              </div>
              <Switch
                id="schedule-reminders"
                checked={preferences.scheduleReminders}
                onCheckedChange={(checked) => handlePreferenceChange('scheduleReminders', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="pomodoro-breaks">Pomodoro Break Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when it's time for a break
                </p>
              </div>
              <Switch
                id="pomodoro-breaks"
                checked={preferences.pomodoroBreaks}
                onCheckedChange={(checked) => handlePreferenceChange('pomodoroBreaks', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="workout-reminders">Workout Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when it's time to work out
                </p>
              </div>
              <Switch
                id="workout-reminders"
                checked={preferences.workoutReminders}
                onCheckedChange={(checked) => handlePreferenceChange('workoutReminders', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="meal-reminders">Meal Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified for meal times
                </p>
              </div>
              <Switch
                id="meal-reminders"
                checked={preferences.mealReminders}
                onCheckedChange={(checked) => handlePreferenceChange('mealReminders', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="supplement-reminders">Supplement Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified to take your supplements
                </p>
              </div>
              <Switch
                id="supplement-reminders"
                checked={preferences.supplementReminders}
                onCheckedChange={(checked) => handlePreferenceChange('supplementReminders', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weekly-reviews">Weekly Review Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded to do your weekly reviews
                </p>
              </div>
              <Switch
                id="weekly-reviews"
                checked={preferences.weeklyReviews}
                onCheckedChange={(checked) => handlePreferenceChange('weeklyReviews', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Customize how notifications are delivered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Reminder Time</Label>
            <Select
              value={preferences.reminderTime.toString()}
              onValueChange={(value) => handlePreferenceChange('reminderTime', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reminder time" />
              </SelectTrigger>
              <SelectContent>
                {reminderTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How early before activities should you be reminded
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sound-enabled" className="flex items-center gap-2">
                {preferences.soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                Sound Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Play sound when notifications appear
              </p>
            </div>
            <Switch
              id="sound-enabled"
              checked={preferences.soundEnabled}
              onCheckedChange={(checked) => handlePreferenceChange('soundEnabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="vibration-enabled" className="flex items-center gap-2">
                <Vibrate className="h-4 w-4" />
                Vibration
              </Label>
              <p className="text-sm text-muted-foreground">
                Vibrate device when notifications appear (mobile only)
              </p>
            </div>
            <Switch
              id="vibration-enabled"
              checked={preferences.vibrationEnabled}
              onCheckedChange={(checked) => handlePreferenceChange('vibrationEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Notification */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>
            Send a test notification to verify your settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              if (permission.granted) {
                new Notification('Lock-In Protocol', {
                  body: 'Test notification is working! 🎉',
                  icon: '/icons/icon-192x192.png',
                  badge: '/icons/icon-72x72.png',
                  vibrate: preferences.vibrationEnabled ? [100, 50, 100] : undefined,
                  silent: !preferences.soundEnabled
                });
              } else {
                alert('Please enable notifications first');
              }
            }}
            disabled={!permission.granted}
            variant="outline"
          >
            Send Test Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}