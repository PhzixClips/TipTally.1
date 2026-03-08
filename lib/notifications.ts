import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { ScheduledShift } from './types';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    // Notifications don't work on simulator
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('shift-reminders', {
      name: 'Shift Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });

    await Notifications.setNotificationChannelAsync('weekly-summary', {
      name: 'Weekly Summary',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function parseTimeToDate(dateStr: string, timeStr: string): Date {
  // dateStr: "2026-03-06", timeStr: "3:00 PM"
  const [y, m, d] = dateStr.split('-').map(Number);
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return new Date(`${dateStr}T15:00:00`);

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return new Date(y, m - 1, d, hours, minutes);
}

export async function scheduleShiftReminder(
  shift: ScheduledShift,
  reminderMinutes: number
): Promise<void> {
  const shiftDate = parseTimeToDate(shift.date, shift.startTime);
  const triggerDate = new Date(shiftDate.getTime() - reminderMinutes * 60 * 1000);

  if (triggerDate <= new Date()) return; // Don't schedule past notifications

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Shift Reminder',
        body: `Your ${shift.role} shift starts at ${shift.startTime}`,
        data: { shiftId: shift.id, type: 'shift_reminder' },
        ...(Platform.OS === 'android' ? { channelId: 'shift-reminders' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
      identifier: `shift-reminder-${shift.id}`,
    });
  } catch {
    // Silently fail if scheduling fails
  }
}

export async function cancelShiftReminder(shiftId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`shift-reminder-${shiftId}`);
  } catch {}
}

export async function scheduleWeeklySummary(dayOfWeek: number): Promise<void> {
  // Cancel existing weekly summary
  try {
    await Notifications.cancelScheduledNotificationAsync('weekly-summary');
  } catch {}

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Earnings Summary',
        body: 'Tap to see how much you earned this week!',
        data: { type: 'weekly_summary' },
        ...(Platform.OS === 'android' ? { channelId: 'weekly-summary' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek + 1, // expo-notifications uses 1=Sunday
        hour: 10,
        minute: 0,
      },
      identifier: 'weekly-summary',
    });
  } catch {}
}

export async function cancelWeeklySummary(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync('weekly-summary');
  } catch {}
}

export async function syncReminders(
  schedule: ScheduledShift[],
  reminderMinutes: number
): Promise<void> {
  // Cancel all existing reminders
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('shift-reminder-')) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Schedule reminders for all upcoming unlogged shifts
  const upcoming = schedule.filter(s => !s.logged);
  for (const shift of upcoming) {
    await scheduleShiftReminder(shift, reminderMinutes);
  }
}
