import {
  buildMonthlySpendingLimitRange,
  getSpendingLimitPeriod,
  isSpendingLimitInPeriod,
} from '../spendingLimits';

describe('buildMonthlySpendingLimitRange', () => {
  it('builds period from current month with 3 months duration', () => {
    const referenceDate = new Date(2026, 1, 14); // 2026-02-14

    const result = buildMonthlySpendingLimitRange('current-month', 3, referenceDate);

    expect(result).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-04-30',
    });
  });

  it('builds period from next month with 1 month duration', () => {
    const referenceDate = new Date(2026, 1, 14); // 2026-02-14

    const result = buildMonthlySpendingLimitRange('next-month', 1, referenceDate);

    expect(result).toEqual({
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    });
  });

  it('clamps invalid duration to at least one month', () => {
    const referenceDate = new Date(2026, 5, 10); // 2026-06-10

    const result = buildMonthlySpendingLimitRange('current-month', 0, referenceDate);

    expect(result).toEqual({
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    });
  });
});

describe('getSpendingLimitPeriod', () => {
  it('uses explicit monthly fields when present', () => {
    const result = getSpendingLimitPeriod({
      periodYear: 2026,
      periodMonth: 3,
      startDate: '2026-02-01',
    });

    expect(result).toEqual({ year: 2026, month: 3 });
  });

  it('falls back to startDate when monthly fields are missing', () => {
    const result = getSpendingLimitPeriod({
      startDate: '2026-07-15T00:00:00.000Z',
    });

    expect(result).toEqual({ year: 2026, month: 7 });
  });

  it('returns null for invalid data', () => {
    const result = getSpendingLimitPeriod({
      periodYear: 2026,
      periodMonth: 99,
      startDate: 'invalid',
    });

    expect(result).toBeNull();
  });
});

describe('isSpendingLimitInPeriod', () => {
  it('matches selected month and year', () => {
    const result = isSpendingLimitInPeriod(
      {
        periodYear: 2026,
        periodMonth: 4,
        startDate: '2026-04-01',
      },
      4,
      2026
    );

    expect(result).toBe(true);
  });

  it('returns false when period differs', () => {
    const result = isSpendingLimitInPeriod(
      {
        periodYear: 2026,
        periodMonth: 4,
        startDate: '2026-04-01',
      },
      5,
      2026
    );

    expect(result).toBe(false);
  });
});
