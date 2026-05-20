import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function parseScheduleTime(input: string, timezone?: string): Date {
  const lower = input.toLowerCase().trim();
  let target = timezone ? dayjs().tz(timezone) : dayjs();

  if (lower === 'now') {
    return target.utc().toDate();
  }

  if (lower.startsWith('in ')) {
    const match = lower.match(/^in (\d+)\s*(hour|minute|day)s?$/);
    if (match) {
      const [, num, unit] = match;
      const amount = parseInt(num, 10);
      if (unit === 'hour') target = target.add(amount, 'hour');
      else if (unit === 'minute') target = target.add(amount, 'minute');
      else if (unit === 'day') target = target.add(amount, 'day');
      return target.utc().toDate();
    }
  }

  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?(\s)?(am|pm)?/);
  if (timeMatch) {
    let [, hour, minutes, , ampm] = timeMatch;
    let h = parseInt(hour, 10);
    let m = minutes ? parseInt(minutes, 10) : 0;
    if (ampm === 'pm' && h !== 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;

    const dayMatch = lower.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+/i);
    if (dayMatch) {
      const dayName = dayMatch[1].toLowerCase();
      const dayMap: { [k: string]: number } = {
        monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
        friday: 5, saturday: 6, sunday: 0
      };
      const targetDay = dayMap[dayName];
      const today = target.day();
      let daysAhead = targetDay - today;
      if (daysAhead <= 0) daysAhead += 7;
      target = target.add(daysAhead, 'day');
    } else if (lower.startsWith('tomorrow')) {
      target = target.add(1, 'day');
    }

    target = target.hour(h).minute(m).second(0);
    const now = timezone ? dayjs().tz(timezone) : dayjs();
    if (target.isBefore(now)) {
      target = target.add(1, 'day');
    }
    return target.utc().toDate();
  }

  throw new Error(`Cannot parse time: ${input}. Try: "5pm", "5:47pm", "17:30", "tomorrow 9am", "in 2 hours", "friday 8pm"`);
}
