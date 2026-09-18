import { describe, expect, it } from '@jest/globals';

import {
  daysUntilTest,
  formatTestDate,
  getTestDatePlan,
  parseDateOnly,
  toDateOnly,
} from '@/features/profile/test-date';

describe('test date helpers', () => {
  it('round-trips a valid date without a timezone shift', () => {
    const parsed = parseDateOnly('2028-02-29');
    expect(parsed).not.toBeNull();
    expect(toDateOnly(parsed!)).toBe('2028-02-29');
  });

  it('rejects invalid calendar dates', () => {
    expect(parseDateOnly('2027-02-29')).toBeNull();
    expect(parseDateOnly('not-a-date')).toBeNull();
  });

  it('calculates today, future, and past targets from local calendar days', () => {
    const now = new Date(2027, 5, 10, 23, 55);
    expect(daysUntilTest('2027-06-10', now)).toBe(0);
    expect(daysUntilTest('2027-06-11', now)).toBe(1);
    expect(daysUntilTest('2027-06-09', now)).toBe(-1);
  });

  it('provides an honest empty label', () => {
    expect(formatTestDate(null)).toBe('Not set');
    expect(getTestDatePlan(null)).toBeNull();
  });

  it('turns the date into a changing practice cadence', () => {
    const now = new Date(2027, 5, 10, 12);
    expect(getTestDatePlan('2027-06-10', now)?.cadence).toBe('One calm warm-up today');
    expect(getTestDatePlan('2027-06-15', now)?.cadence).toBe('5 focused sessions before the test');
    expect(getTestDatePlan('2027-07-20', now)?.cadence).toBe('4 focused sessions this week');
    expect(getTestDatePlan('2028-01-20', now)?.cadence).toBe('3 focused sessions this week');
  });
});
