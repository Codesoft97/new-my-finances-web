export type SpendingLimitStartTiming = 'current-month' | 'next-month';

export interface SpendingLimitMonthlyRange {
  startDate: string;
  endDate: string;
}

export interface SpendingLimitPeriodSource {
  periodYear?: number;
  periodMonth?: number;
  startDate: string;
}

export interface SpendingLimitPeriod {
  year: number;
  month: number;
}

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const buildMonthlySpendingLimitRange = (
  startTiming: SpendingLimitStartTiming,
  durationMonths: number,
  referenceDate: Date = new Date()
): SpendingLimitMonthlyRange => {
  const safeDurationMonths = Math.max(1, Math.floor(durationMonths));

  const startOffsetMonths = startTiming === 'next-month' ? 1 : 0;
  const startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + startOffsetMonths, 1);
  const endMonthAnchor = new Date(startDate.getFullYear(), startDate.getMonth() + safeDurationMonths - 1, 1);
  const endDate = new Date(endMonthAnchor.getFullYear(), endMonthAnchor.getMonth() + 1, 0);

  return {
    startDate: toInputDate(startDate),
    endDate: toInputDate(endDate),
  };
};

export const getSpendingLimitPeriod = (
  spendingLimit: SpendingLimitPeriodSource
): SpendingLimitPeriod | null => {
  if (
    typeof spendingLimit.periodYear === 'number' &&
    Number.isInteger(spendingLimit.periodYear) &&
    typeof spendingLimit.periodMonth === 'number' &&
    Number.isInteger(spendingLimit.periodMonth) &&
    spendingLimit.periodMonth >= 1 &&
    spendingLimit.periodMonth <= 12
  ) {
    return {
      year: spendingLimit.periodYear,
      month: spendingLimit.periodMonth,
    };
  }

  const datePart = spendingLimit.startDate?.split('T')[0] ?? '';
  const [yearValue, monthValue] = datePart.split('-');
  const year = Number(yearValue);
  const month = Number(monthValue);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
};

export const isSpendingLimitInPeriod = (
  spendingLimit: SpendingLimitPeriodSource,
  month: number,
  year: number
) => {
  const period = getSpendingLimitPeriod(spendingLimit);
  if (!period) return false;

  return period.month === month && period.year === year;
};
