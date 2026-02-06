import { Family } from '@/types';

export const isPremiumFamily = (family: Family | null | undefined) => {
  return family?.subscriptionStatus === 'active';
};

export const formatPlanInterval = (interval?: Family['planInterval']) => {
  if (!interval) return 'mensal';
  return interval === 'annual' ? 'anual' : 'mensal';
};
