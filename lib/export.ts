import { Shift } from './types';
import { writeAsStringAsync } from 'expo-file-system';
import { Paths } from 'expo-file-system';
import { Share } from 'react-native';

export function shiftsToCSV(shifts: Shift[]): string {
  const header = 'Date,Day,Role,Hours,HourlyWage,Tips,CashTips,CreditTips,TipOut,TotalEarned,Notes,Tags';
  const rows = [...shifts]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(s => {
      const d = new Date(s.date + 'T12:00:00');
      const day = d.toLocaleDateString('en-US', { weekday: 'short' });
      const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
      return [
        s.date,
        day,
        escape(s.role || ''),
        s.hours,
        s.hourlyWage,
        s.tips.toFixed(2),
        s.cashTips != null ? s.cashTips.toFixed(2) : '',
        s.creditTips != null ? s.creditTips.toFixed(2) : '',
        s.tipOut.toFixed(2),
        s.totalEarned.toFixed(2),
        escape(s.notes || ''),
        escape((s.tags || []).join('; ')),
      ].join(',');
    });
  return [header, ...rows].join('\n');
}

export async function exportCSV(shifts: Shift[]): Promise<void> {
  const csv = shiftsToCSV(shifts);
  const fileName = `tiptally-export-${new Date().toISOString().slice(0, 10)}.csv`;
  const filePath = Paths.cache.uri + '/' + fileName;
  await writeAsStringAsync(filePath, csv);
  await Share.share({ title: fileName, message: csv });
}
