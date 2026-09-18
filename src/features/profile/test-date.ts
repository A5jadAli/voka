export function toDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateOnly(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return toDateOnly(date) === value ? date : null;
}

export function formatTestDate(value: string | null) {
  const date = parseDateOnly(value);
  return date
    ? new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
    : 'Not set';
}

export function daysUntilTest(value: string | null, now = new Date()) {
  const date = parseDateOnly(value);
  if (!date) return null;
  const targetDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const currentDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((targetDay - currentDay) / 86_400_000);
}

export type TestDatePlan = {
  cadence: string;
  recommendation: string;
};

export function getTestDatePlan(value: string | null, now = new Date()): TestDatePlan | null {
  const days = daysUntilTest(value, now);
  if (days === null) return null;
  if (days < 0) {
    return {
      cadence: 'Update your test date',
      recommendation: 'Set a new target so Voka can rebuild your practice cadence.',
    };
  }
  if (days === 0) {
    return {
      cadence: 'One calm warm-up today',
      recommendation: 'Use familiar phrases, keep it brief, and save your energy for the test.',
    };
  }
  if (days <= 7) {
    return {
      cadence: `${days} focused ${days === 1 ? 'session' : 'sessions'} before the test`,
      recommendation: 'Practise short test-like turns daily and revisit only recurring weak spots.',
    };
  }
  if (days <= 30) {
    return {
      cadence: '5 focused sessions this week',
      recommendation: 'Alternate live speaking, listening checks, and one timed response.',
    };
  }
  if (days <= 90) {
    return {
      cadence: '4 focused sessions this week',
      recommendation: 'Build through the learning path and repeat one difficult scenario.',
    };
  }
  return {
    cadence: '3 focused sessions this week',
    recommendation: 'Build strong foundations now; increase test-like practice closer to the date.',
  };
}
