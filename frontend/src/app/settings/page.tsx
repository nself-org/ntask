'use client';

import { useState, useEffect } from 'react';
import { usePreferences } from '@/hooks/use-preferences';
import { useLists } from '@/hooks/use-lists';
import { useNotifications } from '@/hooks/use-notifications';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Clock, Eye, Palette, Bell, MapPin, List } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { preferences, loading, updatePreferences } = usePreferences();
  const { lists } = useLists();
  const { requestPushPermission } = useNotifications();
  const { permission: geoPermission, requestPermission: requestGeoPermission } = useGeolocation();

  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [autoHide, setAutoHide] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [defaultListId, setDefaultListId] = useState<string>('');
  const [eveningReminderTime, setEveningReminderTime] = useState('20:00');
  const [dueReminderMinutes, setDueReminderMinutes] = useState('60');

  // Notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [newTodoNotif, setNewTodoNotif] = useState(true);
  const [dueReminders, setDueReminders] = useState(true);
  const [sharedLists, setSharedLists] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [locationReminders, setLocationReminders] = useState(true);
  const [listUpdates, setListUpdates] = useState(true);

  // Load preferences
  useEffect(() => {
    if (preferences) {
      setTimeFormat(preferences.time_format);
      setAutoHide(preferences.auto_hide_completed);
      setTheme(preferences.theme_preference);
      setDefaultListId(preferences.default_list_id || '');

      const notifSettings = preferences.notification_settings;
      setPushEnabled(notifSettings.push_enabled);
      setEmailEnabled(notifSettings.email_enabled);
      setNewTodoNotif(notifSettings.new_todo);
      setDueReminders(notifSettings.due_reminders);
      setSharedLists(notifSettings.shared_lists);
      setEveningReminder(notifSettings.evening_reminder);
      setLocationReminders(notifSettings.location_reminders);
      setListUpdates(notifSettings.list_updates);
      setEveningReminderTime(notifSettings.evening_reminder_time);
      setDueReminderMinutes(String(notifSettings.due_reminder_minutes_before));
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      await updatePreferences({
        time_format: timeFormat,
        auto_hide_completed: autoHide,
        theme_preference: theme,
        default_list_id: defaultListId || null,
        notification_settings: {
          push_enabled: pushEnabled,
          email_enabled: emailEnabled,
          new_todo: newTodoNotif,
          due_reminders: dueReminders,
          shared_lists: sharedLists,
          evening_reminder: eveningReminder,
          location_reminders: locationReminders,
          list_updates: listUpdates,
          evening_reminder_time: eveningReminderTime,
          due_reminder_minutes_before: parseInt(dueReminderMinutes, 10),
        },
      });
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const handleEnablePushNotifications = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      setPushEnabled(true);
      try {
        await updatePreferences({
          notification_settings: { push_enabled: true },
        });
      } catch {
        toast.error('Failed to save push notification setting');
      }
    }
  };

  const handleEnableLocation = async () => {
    const granted = await requestGeoPermission();
    if (granted) {
      setLocationReminders(true);
      try {
        await updatePreferences({
          notification_settings: { location_reminders: true },
        });
      } catch {
        toast.error('Failed to save location setting');
      }
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize your todo app experience
        </p>
      </div>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Palette className="inline h-5 w-5 mr-2" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Customize how todos and dates are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Format */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>
                <Clock className="inline h-4 w-4 mr-1" />
                Time Format
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose between 12-hour and 24-hour time
              </p>
            </div>
            <Select value={timeFormat} onValueChange={(v: '12h' | '24h') => setTimeFormat(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Auto-hide Completed */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-hide-switch">
                <Eye className="inline h-4 w-4 mr-1" />
                Auto-hide Completed Todos
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically hide completed tasks from view
              </p>
            </div>
            <Switch id="auto-hide-switch" checked={autoHide} onCheckedChange={setAutoHide} aria-label="Automatically hide completed todos" />
          </div>

          <Separator />

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose light, dark, or system theme
              </p>
            </div>
            <Select value={theme} onValueChange={(v: 'light' | 'dark' | 'system') => setTheme(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Default List */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>
                <List className="inline h-4 w-4 mr-1" />
                Default List
              </Label>
              <p className="text-sm text-muted-foreground">
                List to open when you launch the app
              </p>
            </div>
            <Select value={defaultListId} onValueChange={setDefaultListId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Bell className="inline h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser push notifications
              </p>
            </div>
            {Notification?.permission === 'granted' ? (
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} aria-label="Enable push notifications" />
            ) : (
              <Button onClick={handleEnablePushNotifications} size="sm">
                Enable
              </Button>
            )}
          </div>

          <Separator />

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} aria-label="Enable email notifications" />
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <Label className="text-base">Notify me about:</Label>

            <div className="space-y-3 pl-4">
              <div className="flex items-center justify-between">
                <Label className="font-normal" htmlFor="notif-new-todo">New todos added to shared lists</Label>
                <Switch id="notif-new-todo" checked={newTodoNotif} onCheckedChange={setNewTodoNotif} aria-label="Notify when new todos added to shared lists" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="font-normal" htmlFor="notif-due-reminders">Upcoming due dates</Label>
                <Switch id="notif-due-reminders" checked={dueReminders} onCheckedChange={setDueReminders} aria-label="Notify about upcoming due dates" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="font-normal" htmlFor="notif-shared-lists">Lists shared with me</Label>
                <Switch id="notif-shared-lists" checked={sharedLists} onCheckedChange={setSharedLists} aria-label="Notify when lists are shared with me" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="font-normal" htmlFor="notif-evening">Evening planning reminder</Label>
                <Switch id="notif-evening" checked={eveningReminder} onCheckedChange={setEveningReminder} aria-label="Send evening planning reminder" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="font-normal" htmlFor="notif-location">Location-based reminders</Label>
                <Switch id="notif-location" checked={locationReminders} onCheckedChange={setLocationReminders} aria-label="Enable location-based reminders" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="font-normal" htmlFor="notif-list-updates">Updates to shared lists</Label>
                <Switch id="notif-list-updates" checked={listUpdates} onCheckedChange={setListUpdates} aria-label="Notify about updates to shared lists" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Evening Reminder Time */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Evening Reminder Time</Label>
              <p className="text-sm text-muted-foreground">
                "Anything you'd like to add for tomorrow?"
              </p>
            </div>
            <Input
              type="time"
              value={eveningReminderTime}
              onChange={(e) => setEveningReminderTime(e.target.value)}
              className="w-32"
              aria-label="Evening reminder time"
            />
          </div>

          <Separator />

          {/* Due Reminder Timing */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Due Date Reminder</Label>
              <p className="text-sm text-muted-foreground">
                How far in advance to remind you
              </p>
            </div>
            <Select value={dueReminderMinutes} onValueChange={setDueReminderMinutes}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="1440">1 day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Location Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MapPin className="inline h-5 w-5 mr-2" />
            Location Services
          </CardTitle>
          <CardDescription>
            Enable location-based reminders for your todos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Location Access</Label>
              <p className="text-sm text-muted-foreground">
                Required for location-based todo reminders
              </p>
              <p className="text-xs text-muted-foreground">
                Status: {geoPermission.granted ? '✓ Enabled' : geoPermission.denied ? '✗ Denied' : '? Not set'}
              </p>
            </div>
            {!geoPermission.granted && (
              <Button onClick={handleEnableLocation} size="sm">
                Enable Location
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
